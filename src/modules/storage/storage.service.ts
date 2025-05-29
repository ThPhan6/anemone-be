import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ObjectCannedACL,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
  S3ClientConfig,
} from '@aws-sdk/client-s3';
import { fromInstanceMetadata } from '@aws-sdk/credential-providers';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream, ReadStream } from 'fs';
import * as fs from 'fs/promises';
import { extname } from 'path';
import * as sharp from 'sharp';
import { Readable } from 'stream';
import { v4 as uuid } from 'uuid';

import {
  ImageContentType,
  ImageFit,
  ImageQuality,
  ImageSize,
  ImageSizeType,
} from '../../common/constants/file.constant';
import { MessageCode } from '../../common/constants/messageCode';
import { ApiBadRequestException } from '../../common/types/apiException.type';
import { logger } from '../../core/logger/index.logger';
import { UploadImageResDto } from './dto/storage.response';
import { LocalStorage } from './util';

interface UploadObjectParams {
  Key: string;
  Body: Buffer | string;
  ContentType?: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3Client: S3Client;
  private local: LocalStorage;
  private bucket: string;
  private keyPrefix: string;

  constructor(private readonly configService: ConfigService) {
    const accessKeyId = configService.get('AWS_ACCESS_KEY_ID');
    const secretAccessKey = configService.get('AWS_SECRET_ACCESS_KEY');
    const region = configService.get('AWS_REGION');
    const fileDir = configService.get('FILE_DIR') ?? 'files';
    this.bucket = configService.get('AWS_BUCKET');
    this.keyPrefix =
      configService.get('AWS_BUCKET_KEY_PREFIX') ||
      process.env.AWS_BUCKET_KEY_PREFIX ||
      'staging/color';
    const config: S3ClientConfig = { region };
    if (accessKeyId && secretAccessKey) {
      config.credentials = { accessKeyId, secretAccessKey };
    } else {
      config.credentials = fromInstanceMetadata();
    }

    this.s3Client = new S3Client(config);
    this.local = new LocalStorage(fileDir);
  }

  saveLocalFile(data: Buffer | string, filename: string) {
    return this.local.saveLocalFile(data, filename);
  }

  readLocalFile(filename: string): Buffer {
    return this.local.readLocalFile(filename);
  }

  private getKeyTempFile(key = '') {
    if (!key.endsWith('_tmp')) {
      return `${key}_tmp`;
    }

    return key;
  }

  async getFile(Key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key,
      });

      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new HttpException('File not found', HttpStatus.NOT_FOUND);
      }

      const streamToBuffer = (stream: Readable): Promise<Buffer> => {
        return new Promise((resolve, reject) => {
          const chunks: Buffer[] = [];
          stream.on('data', (chunk) => chunks.push(chunk));
          stream.on('end', () => resolve(Buffer.concat(chunks)));
          stream.on('error', reject);
        });
      };

      return await streamToBuffer(response.Body as Readable);
    } catch (err) {
      this.logger.error(`Failed to get file ${Key}: ${err.message}`);
      throw err;
    }
  }

  async getSignedUrl(
    operation: 'getObject' | 'putObject',
    params: { Key: string; Expires?: number },
  ) {
    if (!params.Key) {
      return '';
    }

    const command =
      operation === 'getObject'
        ? new GetObjectCommand({
            Bucket: this.bucket,
            Key: params.Key,
          })
        : new PutObjectCommand({
            Bucket: this.bucket,
            Key: params.Key,
          });

    try {
      return await getSignedUrl(this.s3Client, command, {
        expiresIn: params.Expires || this.configService.get('AWS_SIGNED_URL_EXPIRES_IN'),
      });
    } catch (err) {
      this.logger.error(`Failed to generate signed URL for ${params.Key}: ${err.message}`);
      throw err;
    }
  }

  async persistTempFile(tempKey = '') {
    if (!tempKey.endsWith('_tmp')) {
      return tempKey;
    }

    const key = tempKey.slice(0, -4);

    try {
      const result = await this.s3Client.send(
        new CopyObjectCommand({
          Bucket: this.bucket,
          Key: key,
          CopySource: `/${this.bucket}/${tempKey}`,
        }),
      );

      if (result.$metadata.httpStatusCode === HttpStatus.OK) {
        await this.s3Client.send(
          new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: tempKey,
          }),
        );
      }

      if (result.$metadata.httpStatusCode !== HttpStatus.OK) {
        throw new HttpException(
          'Failed to persist temp file',
          result.$metadata.httpStatusCode ?? HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return key;
    } catch (err) {
      this.logger.error(`persistTempFile: ${tempKey} - error: ${err}`);
      throw err;
    }
  }

  async uploadTempFile(data: Buffer | string, key: string) {
    return this.uploadObject({
      Key: this.getKeyTempFile(key),
      Body: data,
    });
  }

  async uploadImage(file: Express.Multer.File, fileName?: string) {
    try {
      const ext = extname(file.originalname) || file.mimetype.split('/')[1] || '.png';
      const fullPathName = fileName ? `${fileName}${ext}` : file.filename || file.originalname;
      const contentType = file.mimetype;

      let fileBuffer: Buffer | ReadStream;

      // Prioritize buffer if available (in-memory upload)
      if (file.buffer) {
        fileBuffer = file.buffer;
      } else if (file.path) {
        // If not, read from path (disk upload)
        fileBuffer = createReadStream(file.path);
      } else {
        throw new Error('File has neither buffer nor path. Cannot upload image.');
      }

      // Use the refactored uploadFile for both buffer and stream
      const pathToOrigin = await this.uploadFile(
        fileBuffer,
        `${fullPathName}`,
        'public-read',
        contentType,
      );

      // Note: pathToConverted logic from original was removed as it implied a conversion
      // that wasn't explicitly defined or handled in this method.
      // If you need a converted version here, you'd perform sharp processing on fileBuffer
      // before calling uploadFile a second time.

      return {
        origin: pathToOrigin,
        converted: pathToOrigin, // Placeholder, adjust if you have a conversion step
        fileName: fullPathName,
      };
    } catch (error) {
      this.logger.error(`Failed to upload image: ${error.message}`);
      throw new ApiBadRequestException(
        MessageCode.badRequest,
        error.message || 'Upload image failed.',
      );
    } finally {
      // Clean up the locally saved file by Multer if it was saved to disk
      if (file.path) {
        try {
          await fs.unlink(file.path);
          this.logger.log(`Deleted temporary file: ${file.path}`);
        } catch (unlinkError) {
          this.logger.error(`Error deleting temporary file ${file.path}: ${unlinkError.message}`);
        }
      }
    }
  }

  async uploadImages(file: Express.Multer.File): Promise<
    Record<
      ImageSizeType,
      {
        fileKey: string;
        url: string;
        fileName: string;
      }
    >
  > {
    try {
      const ext = extname(file.originalname);
      const contentType = file.mimetype;
      const fileName = file.originalname.replace(ext, '');

      this.logger.debug('Processing file for multiple sizes:', file);

      let originalFileBuffer: Buffer;
      // Determine if the file is in memory (buffer) or on disk (path)
      if (file.buffer) {
        originalFileBuffer = file.buffer;
      } else if (file.path) {
        // If file is on disk, read it into a buffer
        originalFileBuffer = await fs.readFile(file.path);
      } else {
        throw new Error(
          'File has neither buffer nor path. Cannot process image for multiple sizes.',
        );
      }

      // Define image size variations to generate
      const sizeVariations = [
        { name: ImageSizeType.original, size: null },
        { name: ImageSizeType.large, size: ImageSize.large },
        { name: ImageSizeType.medium, size: ImageSize.medium },
        { name: ImageSizeType.small, size: ImageSize.small },
        { name: ImageSizeType.thumbnail, size: ImageSize.thumbnail },
      ];

      // Process each size variation
      const uploadPromises = sizeVariations.map(async (variation) => {
        let processedBuffer: Buffer;
        let finalContentType: string = contentType; // Default to original content type

        // For original, just use the original buffer
        if (!variation.size) {
          processedBuffer = originalFileBuffer;
        } else {
          try {
            const resizeOptions = {
              width: variation.size,
              height: undefined,
              withoutEnlargement: true,
              fit: ImageFit.cover,
            };

            switch (contentType) {
              case ImageContentType.webp:
                processedBuffer = await sharp(originalFileBuffer)
                  .resize(resizeOptions)
                  .webp({ quality: ImageQuality.high })
                  .toBuffer();
                break;

              case ImageContentType.png:
                processedBuffer = await sharp(originalFileBuffer)
                  .resize(resizeOptions)
                  .png({ quality: ImageQuality.high })
                  .toBuffer();
                break;

              case ImageContentType.jpeg: // Explicitly handle JPEG

              case ImageContentType.jpg:
                processedBuffer = await sharp(originalFileBuffer)
                  .resize(resizeOptions)
                  .jpeg({ quality: ImageQuality.high })
                  .toBuffer();
                break;

              default:
                // For other formats (GIF, TIFF, etc.), just resize and output to buffer.
                // Sharp will try to maintain the original format if supported.
                processedBuffer = await sharp(originalFileBuffer).resize(resizeOptions).toBuffer();
            }
            finalContentType = contentType; // Always retain original content type
          } catch (resizeError) {
            this.logger.error(`Failed to resize image (${variation.name}): ${resizeError.message}`);
            // If resizing fails, use original buffer as fallback and original content type
            processedBuffer = originalFileBuffer;
            finalContentType = contentType;
          }
        }

        // Create a size-specific filename, retaining the original extension
        const sizeFileName =
          variation.name === ImageSizeType.original
            ? `${fileName}${ext}` // Original retains original extension
            : `${fileName}-${variation.name}${ext}`; // Resized also retain original extension

        // Upload the resized image using the refactored uploadFile
        const uploadedKey = await this.uploadFile(
          processedBuffer, // Always a Buffer here
          sizeFileName,
          'public-read',
          finalContentType,
        );

        return {
          size: variation.name,
          fileKey: uploadedKey,
          url: `${this.configService.get('AWS_PUBLIC_URL')}/${uploadedKey}`,
        };
      });

      // Wait for all uploads to complete
      const results = await Promise.all(uploadPromises);

      // Format the result as an object with size names as keys
      const formattedResults = results.reduce(
        (acc, result) => {
          if (result && result.size) {
            acc[result.size] = {
              fileKey: result.fileKey,
              url: result.url,
              fileName:
                result.size === ImageSizeType.original
                  ? `${fileName}${ext}`
                  : `${fileName}-${result.size}${ext}`, // Ensure filename matches uploaded extension
            };
          }

          return acc;
        },
        {} as Record<ImageSizeType, { fileKey: string; url: string; fileName: string }>,
      );

      return formattedResults;
    } catch (error) {
      this.logger.error(`Failed to upload images: ${error.message}`);
      throw new ApiBadRequestException(
        MessageCode.badRequest,
        error.message || 'Upload images failed',
      );
    } finally {
      // Clean up the locally saved file by Multer if it was saved to disk
      if (file.path) {
        try {
          await fs.unlink(file.path);
          this.logger.log(`Deleted temporary file: ${file.path}`);
        } catch (unlinkError) {
          this.logger.error(`Error deleting temporary file ${file.path}: ${unlinkError.message}`);
        }
      }
    }
  }

  async uploadFile(
    data: Buffer | string | ReadStream | ArrayBuffer,
    key: string,
    ACL?: ObjectCannedACL,
    contentType?: string,
    prefix = this.keyPrefix,
  ) {
    const newKey = `${prefix}/${key}`;
    let attempt = 0;
    const maxRetries = 3; // You can adjust this
    const retryDelayMs = 1000; // You can adjust this

    while (attempt <= maxRetries) {
      try {
        const putInput: PutObjectCommandInput = {
          Bucket: this.bucket,
          Key: newKey,
          Body: data as any, // Body can be Buffer, Readable, string, etc.
          ContentType: contentType,
        };
        if (ACL) {
          putInput.ACL = ACL;
        }

        const result = await this.s3Client.send(new PutObjectCommand(putInput));
        if (result.$metadata.httpStatusCode != HttpStatus.OK) {
          throw new HttpException(
            '',
            result.$metadata.httpStatusCode ?? HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        return newKey;
      } catch (err) {
        attempt++;

        // If we've exhausted all retries, throw the error
        if (attempt > maxRetries) {
          logger.error(`uploadFile: ${key} - failed after ${maxRetries} attempts. Error: ${err}`);
          throw err;
        }

        logger.warn(
          `uploadFile: ${key} - attempt ${attempt}/${maxRetries} failed. Retrying in ${retryDelayMs}ms. Error: ${err}`,
        );

        // Wait for the fixed delay
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }
  }

  async uploadImageFile(file: Express.Multer.File): Promise<UploadImageResDto> {
    const key = uuid();
    await this.uploadTempFile(file.buffer, key);
    const tempKey = this.getKeyTempFile(key);

    return {
      fileKey: tempKey,
      url: await this.getSignedUrl('getObject', { Key: tempKey }),
      fileName: file.filename || file.originalname,
    };
  }

  async uploadObject({ Key, Body, ContentType }: UploadObjectParams) {
    try {
      const result = await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key,
          Body,
          ContentType,
        }),
      );

      if (result.$metadata.httpStatusCode !== HttpStatus.OK) {
        throw new HttpException(
          'Failed to upload object to S3',
          result.$metadata.httpStatusCode ?? HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return { Key };
    } catch (err) {
      this.logger.error(`Failed to upload object ${Key}: ${err.message}`);
      throw err;
    }
  }

  async deleteObject({ Key }: { Key: string }) {
    try {
      const result = await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key,
        }),
      );

      // S3 returns 204 No Content for successful deletions
      if (
        result.$metadata.httpStatusCode !== HttpStatus.NO_CONTENT &&
        result.$metadata.httpStatusCode !== HttpStatus.OK
      ) {
        throw new HttpException(
          'Failed to delete object from S3',
          result.$metadata.httpStatusCode ?? HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return { Key };
    } catch (err) {
      this.logger.error(`Failed to delete object ${Key}: ${err.message}`);
      // If the object doesn't exist, S3 might return 404, which is fine for a delete operation.
      // You might want to check for specific error codes like 'NotFound' to avoid throwing.
      if (err.name === 'NotFound') {
        this.logger.warn(`Object ${Key} not found during deletion attempt.`);

        return { Key, status: 'not-found' }; // Indicate it wasn't found
      }

      throw err;
    }
  }

  /**
   * Delete all size variations of an image
   * @param fileName The base filename without size suffix
   * @returns Promise<{ deleted: string[] }> Array of deleted file keys
   */
  async deleteImages(fileName: string): Promise<{ deleted: string[] }> {
    try {
      const imageSizes = Object.values(ImageSizeType);
      const deletedKeys: string[] = [];
      const errors: string[] = [];

      // Get the file extension
      const ext = extname(fileName); // Use extname directly
      const baseName = fileName.replace(ext, '');

      // Delete each size variation
      await Promise.all(
        imageSizes.map(async (size) => {
          // Construct key based on how they are saved in uploadImages
          let key: string;
          if (size === ImageSizeType.original) {
            key = `${this.keyPrefix}/${fileName}`;
          } else {
            // Resized images are saved with original extension
            key = `${this.keyPrefix}/${baseName}-${size}${ext}`;
          }

          try {
            await this.deleteObject({ Key: key });
            deletedKeys.push(key);
          } catch (error) {
            errors.push(`Failed to delete ${key}: ${error.message}`);
          }
        }),
      );

      // Log any errors that occurred
      if (errors.length > 0) {
        this.logger.error(`Errors during image deletion: ${errors.join(', ')}`);
      }

      return { deleted: deletedKeys };
    } catch (err) {
      this.logger.error(`Failed to delete images for ${fileName}: ${err.message}`);
      throw err;
    }
  }
}
