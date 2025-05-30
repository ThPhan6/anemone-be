import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isNil, omit, orderBy } from 'lodash';
import { DataSource, In, Not, QueryRunner, Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { MESSAGE } from '../../common/constants/message.constant';
import { Scent } from '../../common/entities/scent.entity';
import { UserSetting } from '../../common/entities/user-setting.entity';
import { SettingDefinitionRepository } from '../../common/repositories/setting-definition.repository';
import { transformImageUrls } from '../../common/utils/helper';
import { BaseService } from '../../core/services/base.service';
import { ApiBaseGetListQueries } from '../../core/types/apiQuery.type';
import { Pagination } from '../../core/types/response.type';
import { StorageService } from '../storage/storage.service';
import {
  QuestionnaireAdminCreateDto,
  QuestionnaireAdminUpdateDto,
} from './dto/questionnaire-admin.dto';
import { CreateScentTagDto, UpdateScentTagDto } from './dto/scent-tag.dto';
import { ESystemDefinitionType, SettingDefinition } from './entities/setting-definition.entity';
import { SettingValue } from './entities/setting-value.entity';
import { base64ToFile, isBase64Image } from './utils/image.utils';

@Injectable()
export class SettingDefinitionService extends BaseService<SettingDefinition> {
  private readonly logger = new Logger(SettingDefinitionService.name);

  constructor(
    @InjectRepository(SettingDefinition)
    private readonly settingDefinitionRepository: SettingDefinitionRepository,
    @InjectRepository(SettingValue)
    private readonly settingValueRepository: Repository<SettingValue>,
    @InjectRepository(UserSetting)
    private readonly userSettingRepository: Repository<UserSetting>,
    @InjectRepository(Scent)
    private readonly scentRepository: Repository<Scent>,
    private readonly storageService: StorageService,
    private readonly dataSource: DataSource,
  ) {
    super(settingDefinitionRepository);
  }

  async getAll(type: string[]): Promise<SettingDefinition[]> {
    const settings = await this.settingDefinitionRepository.find({
      where: {
        type: In(type),
      },
    });

    const values = await this.settingValueRepository.find({
      where: {
        settingDefinition: In(settings.map((setting) => setting.id)),
      },
      relations: ['settingDefinition'],
    });

    const result = settings.map((question) => {
      const data = values.filter((value) => value.settingDefinition.id === question.id);

      return {
        ...omit(question, ['deletedAt', 'values', 'type']),
        settingDefinition: data.map((item) => omit(item, ['deletedAt', 'settingDefinition'])),
      };
    });

    const sortedResult: any = orderBy(result, [(item) => item.metadata?.index || 0], ['asc']);

    return transformImageUrls(sortedResult);
  }

  async getAllWithPagination(
    queries: ApiBaseGetListQueries & { [key: string]: any },
  ): Promise<Pagination<SettingDefinition>> {
    // Process type parameter specifically if it's in array string format
    if (
      queries.type &&
      typeof queries.type === 'string' &&
      queries.type.startsWith('[') &&
      queries.type.endsWith(']')
    ) {
      try {
        // Parse array values from string like [2] or [1,2,3]
        const typeArray = JSON.parse(queries.type);
        if (Array.isArray(typeArray)) {
          // Replace the string representation with the actual array
          queries.type = typeArray;
        }
      } catch (e) {
        // If parsing fails, keep as is
      }
    }

    const data = await super.findAll(queries, {}, ['name']);

    return {
      ...data,
      items: transformImageUrls(data.items),
    };
  }

  async getQuestionnaireResultByUserId(userId: string) {
    const userSetting = await this.userSettingRepository.findOne({
      where: {
        userId,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    if (!userSetting) {
      throw new HttpException(MESSAGE.SYSTEM_SETTINGS.NOT_FOUND_USER_SETTING, HttpStatus.NOT_FOUND);
    }

    const answers = userSetting.system;

    const settings = await this.settingDefinitionRepository.find({
      where: {
        type: ESystemDefinitionType.QUESTIONNAIRE,
      },
    });

    const result = settings.map((setting) => {
      const answer = answers.find((answer) => answer.questionId === setting.id);

      return {
        id: setting.id,
        question: setting.name,
        answers: answer?.answers ?? [],
      };
    });

    return result;
  }

  async getScentTags() {
    const scentTags = await this.settingDefinitionRepository.find({
      where: {
        type: ESystemDefinitionType.SCENT_TAG,
      },
    });

    return scentTags.map((scentTag) => ({
      id: scentTag.id,
      name: scentTag.name,
    }));
  }

  /**
   * Deletes a questionnaire and its answers
   */
  async deleteQuestionnaire(id: string): Promise<void> {
    try {
      // Find the question to be deleted
      const questionToDelete = await this.settingDefinitionRepository.findOne({
        where: { id },
        relations: ['values'],
      });

      if (!questionToDelete) {
        throw new HttpException('Questionnaire not found', HttpStatus.NOT_FOUND);
      }

      // Get the index of the question to be deleted
      const deletedQuestionIndex = questionToDelete.metadata?.index;
      this.logger.log(`About to delete question at index ${deletedQuestionIndex}`);

      // Start a transaction
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Delete associated answers first
        if (questionToDelete.values && questionToDelete.values.length > 0) {
          await queryRunner.manager.remove(questionToDelete.values);
        }

        // Delete the question
        await queryRunner.manager.remove(questionToDelete);

        // If we have a valid index, reindex the remaining questions
        if (deletedQuestionIndex !== undefined && deletedQuestionIndex !== null) {
          // Get all remaining questionnaires
          const remainingQuestions = await queryRunner.manager.find(SettingDefinition, {
            where: {
              type: ESystemDefinitionType.QUESTIONNAIRE,
            },
          });

          // Sort them by their current index
          const sortedQuestions = remainingQuestions.sort((a, b) => {
            const indexA = a.metadata?.index || 0;
            const indexB = b.metadata?.index || 0;

            return indexA - indexB;
          });

          this.logger.log(`Found ${sortedQuestions.length} remaining questions to reindex`);

          // Track questions that need updates
          const questionsToUpdate = [];

          // Reindex questions
          for (const question of sortedQuestions) {
            const currentIndex = question.metadata?.index || 0;

            // If the current index is greater than the deleted index, decrement it
            if (currentIndex > deletedQuestionIndex) {
              const newIndex = currentIndex - 1;
              this.logger.log(
                `Reindexing question ${question.id} from ${currentIndex} to ${newIndex}`,
              );

              // Ensure metadata object exists
              if (!question.metadata) {
                question.metadata = {};
              }

              // Update the index
              question.metadata.index = newIndex;
              questionsToUpdate.push(question);
            }
          }

          // Save all questions that need updating
          if (questionsToUpdate.length > 0) {
            await queryRunner.manager.save(questionsToUpdate);
            this.logger.log(`Reindexed ${questionsToUpdate.length} questions`);
          }
        }

        // Commit the transaction
        await queryRunner.commitTransaction();
      } catch (error) {
        // Rollback transaction on error
        await queryRunner.rollbackTransaction();
        this.logger.error(`Transaction failed: ${error.message}`);
        throw error;
      } finally {
        // Release query runner
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error(`Failed to delete questionnaire: ${error.message}`);
      throw new HttpException(
        error.message || 'Failed to delete questionnaire',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Creates a new scent tag
   */
  async createScentTag(data: CreateScentTagDto, file?: Express.Multer.File) {
    // Check if name is unique
    const existingTag = await this.settingDefinitionRepository.findOne({
      where: {
        name: data.name,
        type: ESystemDefinitionType.SCENT_TAG,
      },
    });

    if (existingTag) {
      throw new HttpException('Scent tag with this name already exists', HttpStatus.BAD_REQUEST);
    }

    // Upload image if provided
    let imageName = null;
    if (file) {
      await this.storageService.uploadImages(file);
      imageName = file.originalname;
    }

    // Create tag entity
    const tag = this.settingDefinitionRepository.create({
      name: data.name,
      type: ESystemDefinitionType.SCENT_TAG,
      metadata: {
        name: data.description || null,
        image: imageName,
      },
    });

    const savedTag = await this.settingDefinitionRepository.save(tag);

    return {
      id: savedTag.id,
      name: savedTag.name,
      description: savedTag.metadata?.name || null,
      image: savedTag.metadata?.image || null,
    };
  }

  /**
   * Updates an existing scent tag
   */
  async updateScentTag(
    id: string,
    data: UpdateScentTagDto,
    file?: Express.Multer.File,
  ): Promise<boolean> {
    // Find the tag to update
    const existingTag = await this.settingDefinitionRepository.findOne({
      where: {
        id,
        type: ESystemDefinitionType.SCENT_TAG,
      },
    });

    if (!existingTag) {
      throw new HttpException('Scent tag not found', HttpStatus.NOT_FOUND);
    }

    // Check if name is unique (if name is changed)
    if (data.name !== existingTag.name) {
      const duplicateTag = await this.settingDefinitionRepository.findOne({
        where: {
          name: data.name,
          type: ESystemDefinitionType.SCENT_TAG,
          id: Not(id), // Exclude current tag
        },
      });

      if (duplicateTag) {
        throw new HttpException('Scent tag with this name already exists', HttpStatus.BAD_REQUEST);
      }
    }

    // Upload new image if provided
    let imageName = existingTag.metadata?.image || null;
    if (file) {
      await this.storageService.uploadImages(file);
      imageName = file.originalname;
    }

    // Update tag
    existingTag.name = data.name;
    existingTag.metadata = {
      ...existingTag.metadata,
      name: data.description || existingTag.metadata?.name || null,
      image: imageName,
    };

    await this.settingDefinitionRepository.save(existingTag);

    return true;
  }

  /**
   * Deletes a scent tag even if it's used in scents
   */
  async deleteScentTag(id: string): Promise<boolean> {
    // Find the tag to delete
    const existingTag = await this.settingDefinitionRepository.findOne({
      where: {
        id,
        type: ESystemDefinitionType.SCENT_TAG,
      },
    });

    if (!existingTag) {
      throw new HttpException('Scent tag not found', HttpStatus.NOT_FOUND);
    }

    // Find scents that use this tag
    const scents = await this.scentRepository.find();

    // Check if any scent contains this tag ID in their tags array
    const scentsUsingTag = scents.filter((scent) => {
      try {
        const tagIds = JSON.parse(scent.tags);

        return Array.isArray(tagIds) && tagIds.includes(id);
      } catch (e) {
        // If JSON.parse fails, this scent doesn't have valid tags
        return false;
      }
    });

    if (scentsUsingTag.length > 0) {
      throw new HttpException(
        'Cannot delete tag as it is used in one or more scents',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Delete the tag
    await super.delete(id);

    return true;
  }

  async findById(id: string): Promise<SettingDefinition> {
    const settingDefinition = await this.findOne({
      where: { id },
      relations: ['values'],
    });

    if (!settingDefinition) {
      throw new HttpException('Setting definition not found', HttpStatus.NOT_FOUND);
    }

    return transformImageUrls(settingDefinition);
  }

  /**
   * Creates a new questionnaire with answers
   */
  async createQuestionnaire(
    data: QuestionnaireAdminCreateDto,
    files?: Express.Multer.File[],
  ): Promise<boolean> {
    this.logger.log(`Creating questionnaire: ${data.name}`);
    this.logger.debug(`Questionnaire data: ${JSON.stringify(data, null, 2)}`);
    this.logger.debug(`Files received: ${files ? files.length : 0} files`);

    // 1. Initial validation
    this._validateCreateQuestionnaireData(data);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 2. Handle main question image upload
      const questionImageUrl = await this._handleCreateQuestionImageUpload(files);

      // 3. Handle file uploads for answers and create maps
      const { uploadedImages, answerIndexToImageMap } = await this._uploadFilesAndMapUrls(
        files,
        new Map<string, string>(), // No existing images for new creation
      );

      // 4. Create question entity and reindex
      const savedQuestion = await this._createQuestion(data, queryRunner, questionImageUrl);

      // 5. Create answer entities
      await this._createAnswers(
        data.values,
        savedQuestion,
        queryRunner,
        uploadedImages,
        answerIndexToImageMap,
      );

      await queryRunner.commitTransaction();
      this.logger.log(`Questionnaire with ID: ${savedQuestion.id} created successfully.`);

      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Transaction failed for questionnaire creation: ${error.message}`,
        error.stack,
      );
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        error.message || 'Failed to create questionnaire',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Updates a questionnaire (question definition and its answers).
   * Orchestrates the update process by calling smaller, focused methods.
   *
   * @param data The DTO containing update information for the questionnaire.
   * @param files Optional array of files to be uploaded for answers.
   * @returns A boolean indicating if the update was successful.
   * @throws HttpException if the questionnaire is not found or an error occurs during update.
   */
  async updateQuestionnaire(
    data: QuestionnaireAdminUpdateDto,
    files?: Express.Multer.File[],
  ): Promise<boolean> {
    this.logger.log(`Updating questionnaire with ID: ${data.id}`);
    this.logger.debug(`Questionnaire data: ${JSON.stringify(data, null, 2)}`);
    this.logger.debug(`Files received: ${files ? files.length : 0} files`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Find the question with its values (answers)
      const question = await this.settingDefinitionRepository.findOne({
        where: { id: data.id },
        relations: ['values'],
      });

      if (!question) {
        throw new HttpException('Questionnaire not found', HttpStatus.NOT_FOUND);
      }

      // 2. Prepare existing image maps for reuse and deletion tracking
      const existingAnswerImageMap = new Map<string, string>(); // answer.value -> image URL
      const existingImageFilenameMap = new Map<string, string>(); // filename -> image URL (for reuse)

      if (question.values && question.values.length > 0) {
        question.values.forEach((answer) => {
          if (answer.metadata?.image) {
            existingAnswerImageMap.set(answer.value, answer.metadata.image);
            const fileName = this._extractFileNameFromUrl(answer.metadata.image);
            if (fileName) {
              existingImageFilenameMap.set(fileName, answer.metadata.image);
            }
          }
        });
      }

      // 3. Determine if question index is changing
      const newQuestionIndex = data.metadata?.index;
      const currentQuestionIndex = question.metadata?.index || 0;
      const indexChanged =
        newQuestionIndex !== undefined && newQuestionIndex !== currentQuestionIndex;

      // 4. Handle question update (including reindexing and main image upload)
      const savedQuestion = await this._handleQuestionUpdate(
        data,
        question,
        queryRunner,
        indexChanged,
        newQuestionIndex,
        files, // Pass files to _handleQuestionUpdate
      );

      // 5. Handle file uploads and create maps for new/updated images (for answers)
      const { uploadedImages, answerIndexToImageMap } = await this._uploadFilesAndMapUrls(
        files,
        existingImageFilenameMap,
      );

      // 6. Handle answer updates (delete old, create new with proper image URLs)
      if (data.values) {
        // Only proceed if new answer values are provided in the DTO
        await this._handleAnswerUpdate(
          data.values,
          savedQuestion,
          queryRunner,
          uploadedImages,
          answerIndexToImageMap,
          existingAnswerImageMap,
          question.values, // Pass existing answers for diffing
        );
      }

      await queryRunner.commitTransaction();
      this.logger.log(`Questionnaire with ID: ${data.id} updated successfully.`);

      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Transaction failed for questionnaire update: ${error.message}`,
        error.stack,
      );
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        error.message || 'Failed to update questionnaire',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Handles the update of the main question (SettingDefinition) entity.
   * Includes logic for reindexing other questions if the index changes,
   * and handling the main question image upload.
   *
   * @param data The DTO containing update information.
   * @param question The existing SettingDefinition entity.
   * @param queryRunner The TypeORM QueryRunner for transaction management.
   * @param indexChanged A boolean indicating if the question's index has changed.
   * @param newQuestionIndex The new index for the question, if applicable.
   * @param files Optional array of files for potential main image upload.
   * @returns The saved SettingDefinition entity.
   * @throws HttpException if the main question image upload fails.
   */
  private async _handleQuestionUpdate(
    data: QuestionnaireAdminUpdateDto,
    question: SettingDefinition,
    queryRunner: QueryRunner,
    indexChanged: boolean,
    newQuestionIndex: number | undefined,
    files?: Express.Multer.File[],
  ): Promise<SettingDefinition> {
    // If the index is changing, reindex other questions accordingly
    if (indexChanged && newQuestionIndex !== undefined) {
      this.logger.debug(
        `Reindexing questions due to index change for question ID: ${question.id} to new index: ${newQuestionIndex}`,
      );
      await this._reindexQuestions(newQuestionIndex, queryRunner, question.id);
    }

    // Ensure metadata object exists before merging or direct assignment
    if (!question.metadata) {
      this.logger.debug(
        `Initializing question.metadata as empty object for question ID: ${question.id}`,
      );
      question.metadata = {};
    }

    // --- DEBUGGING LOGS START ---
    this.logger.debug(
      `[DEBUG] Question metadata BEFORE merge: ${JSON.stringify(question.metadata)}`,
    );
    this.logger.debug(`[DEBUG] Data metadata for merge: ${JSON.stringify(data.metadata)}`);
    // --- DEBUGGING LOGS END ---

    // Update question entity properties
    if (data.name) {
      question.name = data.name;
    }

    if (data.type) {
      question.type = data.type;
    }

    // Handle main question image upload if 'mainImage' file is provided
    let mainImageUploadedUrl: string | null = null;
    if (files && files.length > 0) {
      const mainImageFile = files.find((file) => file.fieldname === 'mainImage');
      if (mainImageFile) {
        try {
          mainImageUploadedUrl = await this._uploadQuestionFile(mainImageFile);
          this.logger.debug(`Main question image uploaded: ${mainImageUploadedUrl}`);
        } catch (uploadError) {
          this.logger.error(
            `Failed to upload main question image: ${mainImageFile.originalname}: ${uploadError.message}`,
          );
          throw new HttpException(
            `Failed to upload main question image ${mainImageFile.originalname}`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    }

    // Merge metadata from DTO
    question.metadata = {
      ...question.metadata,
      ...data.metadata,
    };

    // --- DEBUGGING LOGS START ---
    this.logger.debug(
      `[DEBUG] Question metadata AFTER merge (before image handling): ${JSON.stringify(question.metadata)}`,
    );
    // --- DEBUGGING LOGS END ---

    // Prioritize newly uploaded main image.
    // If data.metadata.image is explicitly null (requires DTO update), remove the image.
    if (mainImageUploadedUrl !== null) {
      question.metadata.image = mainImageUploadedUrl;
    } else if (data.metadata?.image === null) {
      question.metadata.image = null;
    }
    // If data.metadata.image is undefined and no new main image, it retains its existing value
    // from the spread of `...question.metadata` above.

    // --- DEBUGGING LOGS START ---
    this.logger.debug(
      `[DEBUG] Question metadata FINAL state before save: ${JSON.stringify(question.metadata)}`,
    );
    // --- DEBUGGING LOGS END ---

    const savedQuestion = await queryRunner.manager.save(question);
    this.logger.debug(`Question definition saved: ${savedQuestion.id}`);

    return savedQuestion;
  }

  /**
   * Uploads provided files and creates maps for their URLs.
   * Reuses existing URLs if a file with the same name was already present.
   *
   * @param files Optional array of files to upload.
   * @param existingImageFilenameMap Map of existing filenames to their URLs for reuse.
   * @returns An object containing `uploadedImages` (filename -> URL) and `answerIndexToImageMap` (index -> URL).
   * @throws HttpException if a critical file upload fails.
   */
  private async _uploadFilesAndMapUrls(
    files: Express.Multer.File[] | undefined,
    existingImageFilenameMap: Map<string, string>,
  ): Promise<{
    uploadedImages: { [key: string]: string };
    answerIndexToImageMap: { [index: number]: string };
  }> {
    const uploadedImages: { [key: string]: string } = {};
    const answerIndexToImageMap: { [index: number]: string } = {};

    if (files && files.length > 0) {
      for (const file of files) {
        // Skip 'mainImage' as it's handled separately for the question itself
        if (file.fieldname === 'mainImage') {
          continue;
        }

        try {
          const existingUrl = existingImageFilenameMap.get(file.originalname);
          let imageUrl: string;

          if (existingUrl) {
            // If file with this name already exists, reuse the URL
            imageUrl = existingUrl;
            this.logger.debug(`Reusing URL for existing file: ${file.originalname}`);
          } else {
            // Otherwise, upload the new file
            imageUrl = await this._uploadQuestionFile(file);
            this.logger.debug(`Uploaded new file: ${file.originalname}, URL: ${imageUrl}`);
          }

          // Store the URL with the original filename as key
          uploadedImages[file.originalname] = imageUrl;

          // Extract answer index from filename and map it to the URL
          const answerIndex = this._extractAnswerIndexFromFilename(file.originalname);
          if (answerIndex !== null) {
            answerIndexToImageMap[answerIndex] = uploadedImages[file.originalname];
          }
        } catch (error) {
          this.logger.error(`Error uploading file ${file.originalname}: ${error.message}`);
          // If file upload is critical, re-throw to trigger transaction rollback
          throw new HttpException(
            `Failed to upload image ${file.originalname}: ${error.message}`,
            HttpStatus.BAD_REQUEST, // Or INTERNAL_SERVER_ERROR
          );
        }
      }
    }

    return { uploadedImages, answerIndexToImageMap };
  }

  /**
   * Handles the update of answers (SettingValue) for a questionnaire.
   * Implements a "diff and update" strategy to preserve existing answer IDs.
   *
   * @param newAnswerData Array of new answer data from the DTO.
   * @param savedQuestion The parent SettingDefinition entity (the question).
   * @param queryRunner The TypeORM QueryRunner for transaction management.
   * @param uploadedImages Map of uploaded filenames to their URLs.
   * @param answerIndexToImageMap Map of answer indices to their image URLs.
   * @param existingAnswerImageMap Map of existing answer values to their image URLs.
   * @param currentQuestionAnswers The answers currently associated with the question from the database.
   */
  private async _handleAnswerUpdate(
    newAnswerData: QuestionnaireAdminUpdateDto['values'],
    savedQuestion: SettingDefinition,
    queryRunner: QueryRunner,
    uploadedImages: { [key: string]: string },
    answerIndexToImageMap: { [index: number]: string },
    existingAnswerImageMap: Map<string, string>,
    currentQuestionAnswers: SettingValue[], // Added parameter for existing answers
  ): Promise<void> {
    const answersToUpdate: SettingValue[] = [];
    const answersToCreate: SettingValue[] = [];
    const answersToDelete: SettingValue[] = [];

    // Create a map of existing answers by their ID for efficient lookup
    const existingAnswersMap = new Map<string, SettingValue>();
    currentQuestionAnswers.forEach((answer) => {
      if (answer.id) {
        existingAnswersMap.set(answer.id, answer);
      }
    });

    for (let i = 0; i < newAnswerData.length; i++) {
      const answerData = newAnswerData[i];
      let answerImageUrl: string | null = null;

      // Determine image URL for the current answer
      // Priority 1: New file uploaded specifically for this answer's index
      if (answerIndexToImageMap[i] !== undefined) {
        answerImageUrl = answerIndexToImageMap[i];
        this.logger.debug(`Assigned image by index for answer ${i}: ${answerImageUrl}`);
      } else {
        // Priority 2: Existing image URL associated with this answer's value
        // This handles cases where an answer value is updated but its image remains the same,
        // or if the answer value itself is unchanged and its image was previously uploaded.
        if (existingAnswerImageMap.has(answerData.value)) {
          answerImageUrl = existingAnswerImageMap.get(answerData.value);
          this.logger.debug(
            `Assigned existing image by value for answer ${answerData.value}: ${answerImageUrl}`,
          );
        }
      }

      if (answerData.id && existingAnswersMap.has(answerData.id)) {
        // This is an existing answer that needs to be updated
        const existingAnswer = existingAnswersMap.get(answerData.id);
        existingAnswer.value = answerData.value; // Update the value
        existingAnswer.metadata = {
          ...existingAnswer.metadata, // Keep existing metadata fields not provided in DTO
          ...answerData.metadata,
          image: answerImageUrl, // Apply new or existing image URL
        };
        answersToUpdate.push(existingAnswer);
        existingAnswersMap.delete(answerData.id); // Remove from map to track remaining for deletion
        this.logger.debug(
          `[DEBUG] Prepared to UPDATE answer ID: ${answerData.id}, new value: ${answerData.value}`,
        );
      } else {
        // This is a new answer that needs to be created
        const newAnswer = queryRunner.manager.create(SettingValue, {
          value: answerData.value,
          metadata: {
            ...answerData.metadata,
            image: answerImageUrl,
          },
          settingDefinition: savedQuestion,
        });
        answersToCreate.push(newAnswer);
        this.logger.debug(`[DEBUG] Prepared to CREATE new answer with value: ${answerData.value}`);
      }
    }

    // Any answers remaining in existingAnswersMap were not in the newAnswerData, so they should be deleted
    existingAnswersMap.forEach((answer) => {
      answersToDelete.push(answer);
      this.logger.debug(
        `[DEBUG] Prepared to DELETE answer ID: ${answer.id}, value: ${answer.value}`,
      );
    });

    // Execute database operations
    if (answersToUpdate.length > 0) {
      await queryRunner.manager.save(answersToUpdate);
      this.logger.log(`Updated ${answersToUpdate.length} answer entities.`);
    }

    if (answersToCreate.length > 0) {
      await queryRunner.manager.save(answersToCreate);
      this.logger.log(`Created ${answersToCreate.length} new answer entities.`);
    }

    if (answersToDelete.length > 0) {
      await queryRunner.manager.remove(answersToDelete);
      this.logger.log(`Removed ${answersToDelete.length} answer entities.`);
    }
  }

  /**
   * Upload a question or answer file and return the URL
   * Handles both regular files and base64 encoded images
   */
  private async _uploadQuestionFile(file: Express.Multer.File | string): Promise<string> {
    try {
      // Check if the file is a base64 string
      if (typeof file === 'string' && isBase64Image(file)) {
        // Process base64 image
        const fileName = `questionnaire-${uuid()}`;
        const convertedFile = base64ToFile(file, fileName);

        if (!convertedFile) {
          throw new Error('Failed to convert base64 to file');
        }

        // Upload the converted file and get its URL
        const uploadResult = await this.storageService.uploadImages(convertedFile);

        // Make sure we return the full URL, not just the fileName
        this.logger.log(
          `Base64 image uploaded, returning URL: ${uploadResult['original'].fileName}`,
        );

        return uploadResult['original'].fileName;
      }
      // Regular file upload
      else if (typeof file !== 'string') {
        const uploadResult = await this.storageService.uploadImages(file);

        // Make sure we return the full URL, not just the fileName
        this.logger.log(`File uploaded, returning URL: ${uploadResult['original'].fileName}`);

        return uploadResult['original'].fileName;
      }
      // If the string is not a base64 image, it might be an existing URL
      else {
        return file;
      }
    } catch (error) {
      this.logger.error(`Error uploading file: ${error.message}`);
      throw new HttpException('Failed to upload image', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Extracts the filename from a given URL
   */
  private _extractFileNameFromUrl(url: string): string | null {
    try {
      if (!url) {
        return null;
      }

      // Extract the last part of the URL path which typically contains the filename
      const parts = url.split('/');

      return parts[parts.length - 1] || null;
    } catch (error) {
      this.logger.error(`Error extracting filename from URL: ${error.message}`);

      return null;
    }
  }

  /**
   * Extract answer index from filename with pattern: option_${optionIndex}_${randomHash}.${fileExt}
   * Previously: answer_${optionIndex}_${randomHash}.${fileExt}
   */
  private _extractAnswerIndexFromFilename(filename: string): number | null {
    try {
      if (!filename) {
        return null;
      }

      // Updated to match pattern like "option_2_abc123.png" to extract the index "2"
      const matches = filename.match(/option_(\d+)_[a-zA-Z0-9-]+\.[a-zA-Z0-9]+$/);

      if (matches && matches[1]) {
        // Convert matched index string to number
        const index = parseInt(matches[1], 10);
        this.logger.log(`Extracted index ${index} from filename ${filename}`);

        return index;
      }

      this.logger.warn(`Could not extract index from filename ${filename}`);

      return null;
    } catch (error) {
      this.logger.error(
        `Error extracting answer index from filename ${filename}: ${error.message}`,
      );

      return null;
    }
  }

  /**
   * Reindex questions after inserting or updating a question at a specific index
   * @param newQuestionIndex The index where the new/updated question will be placed
   * @param queryRunner The transaction query runner
   * @param excludeQuestionId Optional ID to exclude from reindexing (used in update scenario)
   */
  private async _reindexQuestions(
    newQuestionIndex: number,
    queryRunner: QueryRunner,
    excludeQuestionId?: string,
  ): Promise<void> {
    try {
      this.logger.log(`Reindexing questions after index ${newQuestionIndex}`);

      // Get all questionnaire questions - we'll sort them in memory
      const questions = await queryRunner.manager.find(SettingDefinition, {
        where: {
          type: ESystemDefinitionType.QUESTIONNAIRE,
        },
      });

      // Sort the questions by their index in memory
      const sortedQuestions = questions.sort((a, b) => {
        const indexA = a.metadata?.index || 0;
        const indexB = b.metadata?.index || 0;

        return indexA - indexB;
      });

      // Filter out the excluded question ID if provided
      const filteredQuestions = excludeQuestionId
        ? sortedQuestions.filter((q) => q.id !== excludeQuestionId)
        : sortedQuestions;

      this.logger.log(`Found ${filteredQuestions.length} questions to check for reindexing`);

      // Track which questions need to be updated
      const questionsToUpdate = [];

      // Iterate through questions and update indices as needed
      for (const question of filteredQuestions) {
        const currentIndex = question.metadata?.index || 0;

        // If the current question index is >= the new question index, increment it
        if (currentIndex >= newQuestionIndex) {
          const newIndex = currentIndex + 1;
          this.logger.log(`Reindexing question ${question.id} from ${currentIndex} to ${newIndex}`);

          // Make sure metadata object exists
          if (!question.metadata) {
            question.metadata = {};
          }

          // Update the metadata with the new index
          question.metadata.index = newIndex;

          questionsToUpdate.push(question);
        }
      }

      // Save all questions that need updating
      if (questionsToUpdate.length > 0) {
        await queryRunner.manager.save(questionsToUpdate);
      }
    } catch (error) {
      this.logger.error(`Error reindexing questions: ${error.message}`);
      throw error; // Let the calling function handle the error
    }
  }

  /**
   * Validates the input data for creating a new questionnaire.
   * @param data The DTO for creating a questionnaire.
   * @throws HttpException if validation fails.
   */
  private _validateCreateQuestionnaireData(data: QuestionnaireAdminCreateDto): void {
    if (!data.values || data.values.length === 0) {
      throw new HttpException(
        'Questionnaire must have at least one answer option',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (isNil(data.metadata?.index)) {
      throw new HttpException('Question index is required', HttpStatus.BAD_REQUEST);
    }

    this.logger.log(
      `Validated questionnaire data: ${data.name} with ${data.values.length} answers at index ${data.metadata.index}`,
    );
  }

  /**
   * Handles the upload of the main question image.
   * @param files Optional array of files uploaded with the request.
   * @returns The URL of the uploaded main image, or null if no main image is provided.
   * @throws HttpException if the main image upload fails.
   */
  private async _handleCreateQuestionImageUpload(
    files?: Express.Multer.File[],
  ): Promise<string | null> {
    if (files && files.length > 0) {
      const mainImageFile = files.find((file) => file.fieldname === 'mainImage');
      if (mainImageFile) {
        try {
          const imageUrl = await this._uploadQuestionFile(mainImageFile);
          this.logger.debug(`Main question image uploaded: ${imageUrl}`);

          return imageUrl;
        } catch (uploadError) {
          this.logger.error(
            `Failed to upload main question image: ${mainImageFile.originalname}: ${uploadError.message}`,
          );
          throw new HttpException(
            `Failed to upload main question image ${mainImageFile.originalname}`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    }

    return null;
  }

  /**
   * Creates and saves the main question entity.
   * @param data The DTO for creating a questionnaire.
   * @param queryRunner The TypeORM QueryRunner for transaction management.
   * @param questionImageUrl The URL of the main question image, if any.
   * @returns The saved SettingDefinition entity.
   * @throws Error if question creation fails.
   */
  private async _createQuestion(
    data: QuestionnaireAdminCreateDto,
    queryRunner: QueryRunner,
    questionImageUrl: string | null,
  ): Promise<SettingDefinition> {
    const newQuestionIndex = data.metadata.index;

    // Before creating a new question at the specified index, reindex existing questions
    await this._reindexQuestions(newQuestionIndex, queryRunner);

    // Create question metadata with image URL
    const questionMetadata = {
      ...data.metadata,
      image: questionImageUrl,
    };

    // Create question entity
    const question = queryRunner.manager.create(SettingDefinition, {
      name: data.name,
      type: ESystemDefinitionType.QUESTIONNAIRE,
      metadata: questionMetadata,
    });

    const savedQuestion = await queryRunner.manager.save(question);
    this.logger.log(`Created question: ${savedQuestion.id} at index ${newQuestionIndex}`);

    return savedQuestion;
  }

  /**
   * Creates and saves the answer entities for a questionnaire.
   * @param dataValues Array of answer data from the DTO.
   * @param savedQuestion The parent SettingDefinition entity (the question).
   * @param queryRunner The TypeORM QueryRunner for transaction management.
   * @param uploadedImages Map of uploaded filenames to their URLs.
   * @param answerIndexToImageMap Map of answer indices to their image URLs.
   */
  private async _createAnswers(
    dataValues: QuestionnaireAdminCreateDto['values'],
    savedQuestion: SettingDefinition,
    queryRunner: QueryRunner,
    uploadedImages: { [key: string]: string },
    answerIndexToImageMap: { [index: number]: string },
  ): Promise<void> {
    const answerEntities: SettingValue[] = [];

    for (let i = 0; i < dataValues.length; i++) {
      const answerData = dataValues[i];
      let answerImageUrl: string | null = null;

      // Priority for image assignment for answers:
      // 1. New file uploaded specifically for this answer's index (e.g., option_0_uuid.png for answer at index 0)
      if (answerIndexToImageMap[i] !== undefined) {
        answerImageUrl = answerIndexToImageMap[i];
        this.logger.debug(`Assigned image by index for answer ${i}: ${answerImageUrl}`);
      }
      // No fallback to existing images for *creation* as there are no existing answers yet.
      // The previous "single file fallback" logic is removed for clarity and consistency.

      // Create answer entity
      const answer = queryRunner.manager.create(SettingValue, {
        value: answerData.value,
        metadata: {
          ...answerData.metadata,
          image: answerImageUrl,
        },
        settingDefinition: savedQuestion,
      });
      answerEntities.push(answer);
    }

    // Save all new answer entities
    if (answerEntities.length > 0) {
      await queryRunner.manager.save(answerEntities);
      this.logger.log(`Created ${answerEntities.length} answer options`);
    }
  }
}
