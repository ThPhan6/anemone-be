import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SettingDefinitionRepository } from 'common/repositories/setting-definition.repository';
import { uniq } from 'lodash';
import { In } from 'typeorm';
import { Repository, UpdateResult } from 'typeorm';

import { MESSAGE } from '../../common/constants/message.constant';
import { ScentConfigRepository } from '../../common/repositories/scent-config.repository';
import { extractImageNameFromS3Url } from '../../common/utils/file';
import { extractFileName, transformImageUrls } from '../../common/utils/helper';
import { BaseService } from '../../core/services/base.service';
import { ApiBaseGetListQueries } from '../../core/types/apiQuery.type';
import { Product, ProductType } from '../../modules/device/entities/product.entity';
import { StorageService } from '../../modules/storage/storage.service';
import { ESystemDefinitionType } from '../../modules/system/entities/setting-definition.entity';
import { CreateScentConfigDto, DeletedFileDto, UpdateScentConfigDto } from './dto/scent-config.dto';
import { ScentConfig } from './entities/scent-config.entity';

@Injectable()
export class ScentConfigService extends BaseService<ScentConfig> {
  private readonly logger = new Logger(ScentConfigService.name);

  constructor(
    public readonly repository: ScentConfigRepository,
    private readonly settingDefinitionRepository: SettingDefinitionRepository,
    private readonly storageService: StorageService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {
    super(repository);
  }

  async getAll(query: ApiBaseGetListQueries) {
    const data = await super.findAll(query, {}, ['code', 'name']);

    const tagIds = uniq(data.items.map((el) => el.tags).flat());
    const tags = await this.settingDefinitionRepository.find({
      where: { id: In(tagIds) },
    });

    return {
      ...data,
      items: data.items.map((item) => {
        const newItem: any = { ...item };

        const foundTags = tags.filter((tag) => item.tags.includes(tag.id));
        newItem.tags = foundTags;

        return transformImageUrls(newItem, ['background', 'image']);
      }),
    };
  }

  async find(): Promise<ScentConfig[]> {
    const data = await super.find();

    const tagIds = uniq(data.map((el) => el.tags).flat());
    const tags = await this.settingDefinitionRepository.find({
      where: { id: In(tagIds) },
    });

    return data.map((item) => {
      const newItem: any = { ...item };

      const foundTags = tags.filter((tag) => item.tags.includes(tag.id));
      newItem.tags = foundTags;

      return transformImageUrls(newItem, ['background', 'image']);
    });
  }

  async findOne(where: any): Promise<ScentConfig> {
    const scentConfig = await this.repository.findOne({ where });
    if (!scentConfig) {
      throw new HttpException(MESSAGE.SCENT_CONFIG.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return scentConfig;
  }

  async findById(id: string): Promise<ScentConfig> {
    const data = await this.findOne({ id });

    return transformImageUrls(data, ['background', 'image']);
  }

  async createOne(data: CreateScentConfigDto, files: Express.Multer.File[]) {
    try {
      // Validate code uniqueness
      const existingScentConfig = await this.repository.findOne({
        where: { code: data.code },
      });

      if (existingScentConfig) {
        throw new HttpException(MESSAGE.SCENT_CONFIG.CODE_EXISTS, HttpStatus.BAD_REQUEST);
      }

      // Validate tags
      await this._validateTags(data.tags);

      // Process files using extractFileName helper
      const backgroundFile = files?.find((f) => {
        const { prefix } = extractFileName(f.originalname);

        return prefix === 'background';
      });

      const storyImageFile = files?.find((f) => {
        const { prefix } = extractFileName(f.originalname);

        return prefix === 'story';
      });

      // Get all note files and sort them by index
      const noteImageFiles = files?.filter((f) => {
        const { prefix } = extractFileName(f.originalname);

        return prefix === 'note';
      });

      // Upload background
      const backgroundUrl = await this._handleFileUpload({
        ...backgroundFile,
        originalname: extractFileName(backgroundFile.originalname).name,
      });

      // Process story with image
      const processedStory = await this._processStory(data.story, {
        ...storyImageFile,
        originalname: extractFileName(storyImageFile.originalname).name,
      });

      // Process notes with images
      const processedNotes = await this._processNotes(data.notes, noteImageFiles);

      const newScentConfig = this.repository.create({
        ...data,
        background: backgroundUrl,
        story: processedStory,
        notes: processedNotes,
      });

      await this.repository.save(newScentConfig);

      return true;
    } catch (error) {
      this.logger.error(`Failed to create scent config: ${error.message}`);
      throw error;
    }
  }

  async updateOne(
    id: string,
    data: UpdateScentConfigDto,
    files?: Express.Multer.File[],
    deletedFiles?: DeletedFileDto[],
  ) {
    const existingScentConfig = await this.findOne({ id });

    // Validate code uniqueness if code is being updated
    if (data.code && existingScentConfig.code !== data.code) {
      const codeExists = await this.repository.findOne({
        where: { code: data.code },
      });

      if (codeExists) {
        throw new HttpException(MESSAGE.SCENT_CONFIG.CODE_EXISTS, HttpStatus.BAD_REQUEST);
      }
    }

    // Validate tags if provided
    if (data.tags) {
      await this._validateTags(data.tags);
    }

    // Initialize data with existing values
    let currentData = {
      backgroundUrl: existingScentConfig.background,
      processedStory: existingScentConfig.story,
      processedNotes: existingScentConfig.notes || [],
    };

    // Update story content if provided
    if (data.story) {
      currentData.processedStory = {
        ...currentData.processedStory,
        content: data.story.content,
      };
    }

    // Update notes if provided
    if (data.notes && Array.isArray(data.notes)) {
      currentData.processedNotes = data.notes.map((note) => {
        const noteFound = currentData.processedNotes.find((el) => el.type === note.type);

        return {
          ingredients: note.ingredients || noteFound?.ingredients || [],
          type: note.type,
          image: noteFound?.image || null,
        };
      });
    }

    // Process deleted files first
    if (deletedFiles?.length > 0) {
      currentData = await this._processDeletedFiles(deletedFiles, currentData);
    }

    // Then process new files
    if (files?.length > 0) {
      currentData = await this._processNewFiles(files, currentData);
    }

    // Prepare update data
    const updateData = {
      ...existingScentConfig,
      ...data,
      background: currentData.backgroundUrl,
      story: currentData.processedStory,
      notes: currentData.processedNotes,
    };

    await super.update(id, updateData);

    return true;
  }

  async save(data: ScentConfig): Promise<ScentConfig> {
    return await this.repository.save(data);
  }

  private async _validateTags(tagIds: string[]): Promise<void> {
    if (!tagIds || tagIds.length === 0) {
      throw new HttpException('Tags are required', HttpStatus.BAD_REQUEST);
    }

    if (tagIds.length > 3) {
      throw new HttpException('Maximum 3 tags allowed', HttpStatus.BAD_REQUEST);
    }

    // Validate that all tags exist and are of type SCENT_TAG
    const existingTags = await this.settingDefinitionRepository.find({
      where: {
        id: In(tagIds),
        type: ESystemDefinitionType.SCENT_TAG,
      },
    });

    if (existingTags.length !== tagIds.length) {
      throw new HttpException('One or more invalid tags provided', HttpStatus.BAD_REQUEST);
    }
  }

  private async _handleFileUpload(file: Express.Multer.File): Promise<string> {
    if (!file) {
      return null;
    }

    try {
      const uploadedImage = await this.storageService.uploadImage(file);

      return uploadedImage.fileName;
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`);
      throw new HttpException('Failed to upload file', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async _processNotes(notes: any[], noteImages: Express.Multer.File[]): Promise<any[]> {
    if (!notes || notes.length === 0) {
      return [];
    }

    const processedNotes = await Promise.all(
      notes.map(async (note, index) => {
        const noteImage = noteImages?.find((img) => {
          const { prefix, index: fileIndex } = extractFileName(img.originalname);

          return prefix === 'note' && String(fileIndex) === String(index);
        });

        if (!noteImage) {
          return {
            ...note,
            image: null,
          };
        }

        const { name } = extractFileName(noteImage.originalname);
        const fileWithNewName = {
          ...noteImage,
          originalname: name,
        };

        const imageUrl = await this._handleFileUpload(fileWithNewName);

        return {
          ...note,
          image: imageUrl,
        };
      }),
    );

    return processedNotes.filter(Boolean);
  }

  private async _processStory(story: any, storyImage: Express.Multer.File): Promise<any> {
    if (!story) {
      return null;
    }

    const imageUrl = await this._handleFileUpload(storyImage);

    return {
      ...story,
      image: imageUrl,
    };
  }

  private async _processDeletedFiles(
    deletedFiles: DeletedFileDto[],
    currentData: {
      backgroundUrl: string;
      processedStory: any;
      processedNotes: any[];
    },
  ) {
    const { backgroundUrl, processedStory, processedNotes } = currentData;
    let newBackgroundUrl = backgroundUrl;
    let newProcessedStory = processedStory;
    let newProcessedNotes = processedNotes;

    // Process each deleted file based on its key
    for (const deletedFile of deletedFiles) {
      const { key, image } = deletedFile;

      try {
        // Extract filepath and filename from the URL
        const imageInfo = extractImageNameFromS3Url(image);
        // If it's already a string (just filename), use it directly
        const s3Key =
          typeof imageInfo === 'string' ? imageInfo : `${imageInfo.filepath}/${imageInfo.filename}`;

        // Try to delete from S3 but don't wait for it
        this.storageService.deleteObject({ Key: s3Key }).catch((error) => {
          this.logger.error(
            `Failed to delete file from S3 ${s3Key} (key: ${key}): ${error.message}`,
          );
        });
      } catch (error) {
        this.logger.error(
          `Error initiating S3 deletion for ${image} (key: ${key}): ${error.message}`,
        );
      }

      // Update database regardless of S3 deletion success
      if (key === 'background') {
        newBackgroundUrl = null;
      } else if (key === 'story') {
        newProcessedStory = {
          ...newProcessedStory,
          image: null,
        };
      } else if (key.startsWith('notes_')) {
        // Extract note index from key (e.g., 'notes_1' -> 1)
        const noteIndex = parseInt(key.split('_')[1]);
        if (!isNaN(noteIndex)) {
          newProcessedNotes = newProcessedNotes.map((note, index) =>
            index === noteIndex ? { ...note, image: null } : note,
          );
        }
      }
    }

    return {
      backgroundUrl: newBackgroundUrl,
      processedStory: newProcessedStory,
      processedNotes: newProcessedNotes,
    };
  }

  private async _processNewFiles(
    files: Express.Multer.File[],
    currentData: {
      backgroundUrl: string;
      processedStory: any;
      processedNotes: any[];
    },
  ) {
    const { backgroundUrl, processedStory, processedNotes } = currentData;
    let newBackgroundUrl = backgroundUrl;
    let newProcessedStory = processedStory;
    let newProcessedNotes = processedNotes;

    // Process files using extractFileName helper
    const backgroundFile = files?.find((f) => {
      const { prefix } = extractFileName(f.originalname);

      return prefix === 'background';
    });

    const storyImageFile = files?.find((f) => {
      const { prefix } = extractFileName(f.originalname);

      return prefix === 'story';
    });

    // Get all note files
    const noteImageFiles = files?.filter((f) => {
      const { prefix } = extractFileName(f.originalname);

      return prefix === 'note';
    });

    // Upload background if provided
    if (backgroundFile) {
      newBackgroundUrl = await this._handleFileUpload({
        ...backgroundFile,
        originalname: extractFileName(backgroundFile.originalname).name,
      });
    }

    // Process story with image if provided
    if (storyImageFile) {
      const storyImageUrl = await this._handleFileUpload({
        ...storyImageFile,
        originalname: extractFileName(storyImageFile.originalname).name,
      });
      newProcessedStory = {
        ...newProcessedStory,
        image: storyImageUrl,
      };
    }

    // Process notes with images if provided
    if (noteImageFiles?.length > 0) {
      const notesWithImages = await Promise.all(
        newProcessedNotes.map(async (note, index) => {
          const noteImage = noteImageFiles.find((img) => {
            const { prefix, index: fileIndex } = extractFileName(img.originalname);

            return prefix === 'note' && String(fileIndex) === String(index);
          });

          if (!noteImage) {
            return note;
          }

          const { name } = extractFileName(noteImage.originalname);
          const imageUrl = await this._handleFileUpload({
            ...noteImage,
            originalname: name,
          });

          return {
            ...note,
            image: imageUrl,
          };
        }),
      );
      newProcessedNotes = notesWithImages;
    }

    return {
      backgroundUrl: newBackgroundUrl,
      processedStory: newProcessedStory,
      processedNotes: newProcessedNotes,
    };
  }

  /**
   * Check if a scent config is being used by any products
   * @param scentConfigId The ID of the scent config to check
   * @returns Promise<boolean> True if the scent config is in use, false otherwise
   */
  private async isScentConfigInUse(scentConfigId: string): Promise<boolean> {
    const productCount = await this.productRepository.count({
      where: {
        scentConfig: { id: scentConfigId },
        type: ProductType.CARTRIDGE,
      },
    });

    return productCount > 0;
  }

  /**
   * Delete a scent config if it's not in use by any products
   * @param id The ID of the scent config to delete
   * @throws HttpException if the scent config is in use or not found
   * @returns Promise<UpdateResult> The result of the delete operation
   */
  async delete(id: string | number): Promise<UpdateResult> {
    // First check if the scent config exists
    const scentConfig = await this.findOne({ id });
    if (!scentConfig) {
      throw new HttpException(MESSAGE.SCENT_CONFIG.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    // Check if the scent config is in use
    const isInUse = await this.isScentConfigInUse(id.toString());
    if (isInUse) {
      throw new HttpException(
        'Cannot delete scent config as it is being used by one or more products',
        HttpStatus.BAD_REQUEST,
      );
    }

    // If not in use, proceed with soft delete
    return super.delete(id);
  }
}
