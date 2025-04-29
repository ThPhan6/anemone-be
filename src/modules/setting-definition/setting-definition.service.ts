import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isNil, omit, orderBy } from 'lodash';
import { DataSource, In, Not, Repository } from 'typeorm';
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
import { QuestionnaireAnswerItem } from './dto/questionnaire.dto';
import {
  QuestionnaireAdminCreateDto,
  QuestionnaireAdminUpdateDto,
} from './dto/questionnaire-admin.dto';
import { CreateScentTagDto, UpdateScentTagDto } from './dto/scent-tag.dto';
import { ESystemDefinitionType, SettingDefinition } from './entities/setting-definition.entity';
import { QuestionnaireAnswerType, SettingValue } from './entities/setting-value.entity';
import { base64ToFile, isBase64Image } from './utils/image.utils';

@Injectable()
export class SettingDefinitionService extends BaseService<SettingDefinition> {
  private readonly logger = new Logger(SettingDefinitionService.name);

  constructor(
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

  async createQuestionnaireAnswer(userId: string, body: QuestionnaireAnswerItem[]) {
    // Check all questions before saving to database
    for (const el of body) {
      if (!Array.isArray(el.answers)) {
        throw new HttpException(MESSAGE.SYSTEM_SETTINGS.INVALID_ANSWER, HttpStatus.BAD_REQUEST);
      }

      const question = await this.settingDefinitionRepository.findOne({
        where: {
          id: el.questionId,
        },
      });

      // If a question does not exist, throw an error immediately
      if (!question) {
        throw new HttpException(MESSAGE.SYSTEM_SETTINGS.NOT_FOUND_QUESTION, HttpStatus.NOT_FOUND);
      }
    }

    // If all questions are valid, save data to database
    const answer = await this.userSettingRepository.create({
      userId,
      system: body,
    });

    await this.userSettingRepository.save(answer);

    return answer;
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
   * Creates a new questionnaire with answers
   */
  async createQuestionnaire(
    data: QuestionnaireAdminCreateDto,
    files?: Express.Multer.File[],
  ): Promise<boolean> {
    try {
      // Validate the data - extra validation beyond DTO validation
      if (!data.settingDefinition || data.settingDefinition.length === 0) {
        throw new HttpException(
          'Questionnaire must have at least one answer option',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Ensure we have an index in the metadata
      if (isNil(data.metadata?.index)) {
        throw new HttpException('Question index is required', HttpStatus.BAD_REQUEST);
      }

      const newQuestionIndex = data.metadata.index;
      this.logger.log(
        `Processing questionnaire: ${data.name} with ${data.settingDefinition.length} answers at index ${newQuestionIndex}`,
      );

      // First, upload all images to get their URLs
      const uploadedImages: { [key: string]: string } = {};

      if (files && files.length > 0) {
        // Process and upload all files
        for (const file of files) {
          try {
            // Upload the file and get the URL
            const imageUrl = await this.uploadQuestionFile(file);

            // Store the URL with the original filename as key for lookup
            uploadedImages[file.originalname] = imageUrl;

            // Add debug logging
            this.logger.log(
              `Successfully uploaded and mapped image: ${file.originalname} → ${imageUrl}`,
            );
          } catch (error) {
            this.logger.error(`Error uploading file ${file.originalname}: ${error.message}`);
            // Continue with other files even if one fails
          }
        }

        // Log all uploaded images for debugging
        this.logger.log(`Total uploaded images: ${Object.keys(uploadedImages).length}`);
        this.logger.log(`Uploaded image map: ${JSON.stringify(uploadedImages)}`);
      }

      // Create the setting definition (question) transaction
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Before creating a new question at the specified index, reindex existing questions
        await this.reindexQuestions(newQuestionIndex, queryRunner);

        // Get question image URL if any was provided for the question
        // We'll need to determine which file (if any) is intended for the question itself
        const questionImageUrl = null; // Will be set if a question image is found

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

        // Process and create the answers (SettingValues)
        const answerEntities: SettingValue[] = [];

        // First create a map of answer index to uploaded image URL
        const answerIndexToImageMap: { [index: number]: string } = {};

        // Parse and populate the map for all uploaded files
        if (files && files.length > 0) {
          for (const file of files) {
            const answerIndex = this.extractAnswerIndexFromFilename(file.originalname);
            if (answerIndex !== null) {
              answerIndexToImageMap[answerIndex] = uploadedImages[file.originalname];
              this.logger.log(`Mapped file ${file.originalname} to answer index ${answerIndex}`);
            }
          }

          this.logger.log(
            `Answer index to image mapping: ${JSON.stringify(answerIndexToImageMap)}`,
          );
        }

        for (let i = 0; i < data.settingDefinition.length; i++) {
          const answerData = data.settingDefinition[i];

          // Find an uploaded image for this answer if available
          let answerImageUrl = null;

          // First check if we have a direct match by index
          if (answerIndexToImageMap[i] !== undefined) {
            answerImageUrl = answerIndexToImageMap[i];
            this.logger.log(`Found matching image for answer ${i} (${answerData.value}) by index`);
          }
          // Fallback logic for when no match by index is found
          else if (
            files &&
            files.length > 0 &&
            answerData.metadata.type === QuestionnaireAnswerType.IMAGE_CARD
          ) {
            const imageCardAnswers = data.settingDefinition.filter(
              (a) => a.metadata.type === QuestionnaireAnswerType.IMAGE_CARD,
            );

            // If there's only one file and one IMAGE_CARD answer with no index matches
            if (
              files.length === 1 &&
              imageCardAnswers.length === 1 &&
              Object.keys(answerIndexToImageMap).length === 0
            ) {
              answerImageUrl = uploadedImages[files[0].originalname];
              this.logger.log(
                `Single file/answer scenario: using file for answer ${i} (${answerData.value})`,
              );
            }
          }

          if (answerImageUrl) {
            this.logger.log(
              `Assigned image URL for answer ${i} (${answerData.value}): ${answerImageUrl}`,
            );
          } else if (answerData.metadata.type === QuestionnaireAnswerType.IMAGE_CARD) {
            this.logger.warn(`No image URL found for IMAGE_CARD answer ${i} (${answerData.value})`);
          }

          // For IMAGE_CARD type, ensure we have an image
          if (answerData.metadata.type === QuestionnaireAnswerType.IMAGE_CARD && !answerImageUrl) {
            this.logger.warn(`No image found for IMAGE_CARD answer ${i}`);
            // Continue without throwing an error - this allows processing to complete
          }

          // Create answer metadata with image URL
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

        // Save all answer entities
        await queryRunner.manager.save(answerEntities);
        this.logger.log(`Created ${answerEntities.length} answer options`);

        // Commit transaction
        await queryRunner.commitTransaction();

        return true;
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
      this.logger.error(`Failed to create questionnaire: ${error.message}`);
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        error.message || 'Failed to create questionnaire',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Upload a question or answer file and return the URL
   * Handles both regular files and base64 encoded images
   */
  private async uploadQuestionFile(file: Express.Multer.File | string): Promise<string> {
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
  private extractFileNameFromUrl(url: string): string | null {
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
   * Extract answer index from filename with pattern: answer_${optionIndex}_${randomHash}.${fileExt}
   */
  private extractAnswerIndexFromFilename(filename: string): number | null {
    try {
      if (!filename) {
        return null;
      }

      // Match pattern like "answer_2_abc123.png" to extract the index "2"
      const matches = filename.match(/answer_(\d+)_[a-zA-Z0-9]+\.[a-zA-Z0-9]+$/);

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
   * Updates an existing questionnaire and its answers
   */
  async updateQuestionnaire(
    data: QuestionnaireAdminUpdateDto,
    files?: Express.Multer.File[],
  ): Promise<boolean> {
    try {
      // 1. Find the question with its values (answers)
      const question = await this.settingDefinitionRepository.findOne({
        where: { id: data.id },
        relations: ['values'],
      });

      if (!question) {
        throw new HttpException('Questionnaire not found', HttpStatus.NOT_FOUND);
      }

      this.logger.log(
        `Updating questionnaire ${data.id}: ${data.name} with ${data.settingDefinition?.length || 0} answers`,
      );

      // Create a map of existing answer values to their metadata (including image URLs)
      const existingAnswerImageMap = new Map<string, string>();
      // Also track the filenames of existing images
      const existingImageFilenameMap = new Map<string, string>();

      if (question.values && question.values.length > 0) {
        question.values.forEach((answer) => {
          if (answer.metadata?.image) {
            existingAnswerImageMap.set(answer.value, answer.metadata.image);
            // Extract the filename from the URL
            const imageUrl = answer.metadata.image;
            const fileName = this.extractFileNameFromUrl(imageUrl);
            if (fileName) {
              existingImageFilenameMap.set(fileName, imageUrl);
            }

            this.logger.log(
              `Existing image for answer "${answer.value}": ${answer.metadata.image} (filename: ${fileName || 'unknown'})`,
            );
          }
        });
      }

      // Ensure we have an index in the metadata if provided
      const newQuestionIndex = data.metadata?.index;
      const currentQuestionIndex = question.metadata?.index || 0;

      // Check if index is changing
      let indexChanged = false;
      if (newQuestionIndex !== undefined && newQuestionIndex !== currentQuestionIndex) {
        indexChanged = true;
        this.logger.log(
          `Question index changing from ${currentQuestionIndex} to ${newQuestionIndex}`,
        );
      }

      // Extract existing question image URL if available
      const existingQuestionImageUrl = question.metadata?.image || null;
      this.logger.log(`Existing question image URL: ${existingQuestionImageUrl || 'none'}`);

      // Upload all images to get their URLs
      const uploadedImages: { [key: string]: string } = {};

      if (files && files.length > 0) {
        // Upload all files first and store their URLs
        for (const file of files) {
          try {
            // Check if this file already exists based on filename
            const existingUrl = existingImageFilenameMap.get(file.originalname);

            if (existingUrl) {
              // If file with this name already exists, reuse the URL instead of uploading
              this.logger.log(
                `File ${file.originalname} already exists, reusing existing URL: ${existingUrl}`,
              );
              uploadedImages[file.originalname] = existingUrl;
            } else {
              // Otherwise, upload the new file
              const imageUrl = await this.uploadQuestionFile(file);

              // Store the URL with the original filename as key for lookup
              uploadedImages[file.originalname] = imageUrl;
              this.logger.log(`Uploaded new image for ${file.originalname}: ${imageUrl}`);
            }
          } catch (error) {
            this.logger.error(`Error uploading file ${file.originalname}: ${error.message}`);
            // Continue with other files even if one fails
          }
        }
      }

      // Start transaction for updating the question and answers
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // If the index is changing, reindex other questions accordingly
        if (indexChanged && newQuestionIndex !== undefined) {
          await this.reindexQuestions(newQuestionIndex, queryRunner, question.id);
        }

        // Update question entity
        if (data.name) {
          question.name = data.name;
        }

        if (data.type) {
          question.type = data.type;
        }

        // Update question metadata with new data
        question.metadata = {
          ...question.metadata,
          ...data.metadata,
        };

        const savedQuestion = await queryRunner.manager.save(question);
        this.logger.log(`Updated question: ${savedQuestion.id}`);

        // If answers are provided, update them
        if (data.settingDefinition && data.settingDefinition.length > 0) {
          // Delete existing answers
          if (question.values && question.values.length > 0) {
            await queryRunner.manager.remove(question.values);
          }

          // Process and create new answers
          const answerEntities: SettingValue[] = [];

          // First create a map of answer index to uploaded image URL
          const answerIndexToImageMap: { [index: number]: string } = {};

          // Parse and populate the map for all uploaded files
          if (files && files.length > 0) {
            for (const file of files) {
              const answerIndex = this.extractAnswerIndexFromFilename(file.originalname);
              if (answerIndex !== null) {
                answerIndexToImageMap[answerIndex] = uploadedImages[file.originalname];
                this.logger.log(`Mapped file ${file.originalname} to answer index ${answerIndex}`);
              }
            }

            this.logger.log(
              `Answer index to image mapping: ${JSON.stringify(answerIndexToImageMap)}`,
            );
          }

          // Second pass: Create all answer entities with proper image URLs
          for (let i = 0; i < data.settingDefinition.length; i++) {
            const answerData = data.settingDefinition[i];
            let answerImageUrl = null;

            // First check if we have a direct match by index
            if (answerIndexToImageMap[i] !== undefined) {
              answerImageUrl = answerIndexToImageMap[i];
              this.logger.log(
                `Found matching image for answer ${i} (${answerData.value}) by index`,
              );
            }
            // Otherwise look for an existing image for this answer value
            else if (existingAnswerImageMap.has(answerData.value)) {
              answerImageUrl = existingAnswerImageMap.get(answerData.value);
              this.logger.log(
                `Preserving existing image for answer "${answerData.value}": ${answerImageUrl}`,
              );
            }
            // Fallback to the old assignment strategy if no index match and no existing image
            else if (
              files &&
              files.length === 1 &&
              answerData.metadata.type === QuestionnaireAnswerType.IMAGE_CARD &&
              Object.keys(answerIndexToImageMap).length === 0
            ) {
              // If there's only one file and no specific indices were found
              answerImageUrl = uploadedImages[files[0].originalname];
              this.logger.log(
                `Using only available file for answer "${answerData.value}": ${answerImageUrl}`,
              );
            }

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

          // Save all answer entities
          await queryRunner.manager.save(answerEntities);
        }

        // Commit transaction
        await queryRunner.commitTransaction();

        return true;
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
      this.logger.error(`Failed to update questionnaire: ${error.message}`);
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        error.message || 'Failed to update questionnaire',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
   * Reindex questions after inserting or updating a question at a specific index
   * @param newQuestionIndex The index where the new/updated question will be placed
   * @param queryRunner The transaction query runner
   * @param excludeQuestionId Optional ID to exclude from reindexing (used in update scenario)
   */
  private async reindexQuestions(
    newQuestionIndex: number,
    queryRunner: any,
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
      const uploadResult = await this.storageService.uploadImageFile(file);
      imageName = uploadResult.fileName;
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
      const uploadResult = await this.storageService.uploadImage(file);
      imageName = uploadResult.fileName;
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
}
