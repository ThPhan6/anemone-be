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
      const ext = extname(file.originalname);
      const fullPathName = fileName ? `${fileName}${ext}` : file.filename || file.originalname;
      const contentType = file.mimetype;

      const calls = [];

      // Check if file is a buffer or has a path
      if (file.buffer) {
        // Handle file with buffer (memory upload)
        calls.push(this.uploadFile(file.buffer, `${fullPathName}`, 'public-read', contentType));
      } else if (file.path) {
        // Handle file with path (disk upload)
        calls.push(
          this.uploadFile(
            createReadStream(file.path),
            `${fullPathName}`,
            'public-read',
            contentType,
          ),
        );
      } else {
        throw new Error('File has neither buffer nor path');
      }

      const [pathToOrigin, pathToConverted] = await Promise.all(calls);

      return {
        origin: pathToOrigin,
        converted: pathToConverted,
        fileName: fullPathName,
      };
    } catch (error) {
      this.logger.error(`Failed to upload image: ${error.message}`);
      throw new ApiBadRequestException(
        MessageCode.badRequest,
        error.message || 'Upload image failed.',
      );
    }
  }

  async uploadImages(file: Express.Multer.File /* _prefix?: StoreUploadPrefix */): Promise<
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

      // Define image size variations to generate
      const sizeVariations = [
        { name: 'original', size: null },
        { name: 'large', size: ImageSize.large },
        { name: 'medium', size: ImageSize.medium },
        { name: 'small', size: ImageSize.small },
        { name: 'thumbnail', size: ImageSize.thumbnail },
      ];

      // Process each size variation
      const uploadPromises = sizeVariations.map(async (variation) => {
        let processedBuffer: Buffer;

        // For original, just use the original buffer
        if (!variation.size) {
          processedBuffer = file.buffer;
        } else {
          try {
            // Use Sharp directly instead of the utility functions
            const resizeOptions = {
              width: variation.size,
              height: undefined,
              withoutEnlargement: true,
              fit: ImageFit.cover,
            };

            // For other sizes, resize the image
            switch (contentType) {
              case ImageContentType.webp:
                processedBuffer = await sharp(file.buffer)
                  .resize(resizeOptions)
                  .webp({ quality: ImageQuality.high })
                  .toBuffer();
                break;

              case ImageContentType.png:
                processedBuffer = await sharp(file.buffer)
                  .resize(resizeOptions)
                  .png({ quality: ImageQuality.high })
                  .toBuffer();
                break;

              default:
                // For JPEG and other formats
                processedBuffer = await sharp(file.buffer)
                  .resize(resizeOptions)
                  .jpeg({ quality: ImageQuality.high })
                  .toBuffer();
            }
          } catch (resizeError) {
            this.logger.error(`Failed to resize image (${variation.name}): ${resizeError.message}`);
            // If resizing fails, use original buffer as fallback
            processedBuffer = file.buffer;
          }
        }

        // Create a size-specific filename
        const sizeFileName =
          variation.name === 'original'
            ? `${fileName}${ext}`
            : `${fileName}-${variation.name}${ext}`;

        // Upload the resized image
        const path = await this.uploadFile(
          processedBuffer,
          sizeFileName,
          'public-read',
          contentType,
        );

        return {
          size: variation.name,
          path,
          url: `${this.configService.get('AWS_PUBLIC_URL')}/${path}`,
        };
      });

      // Wait for all uploads to complete
      const results = await Promise.all(uploadPromises);

      // Format the result as an object with size names as keys
      const formattedResults = results.reduce((acc, result) => {
        if (result && result.size) {
          acc[result.size] = {
            fileKey: result.path,
            url: result.url,
            fileName:
              result.size === 'original' ? `${fileName}${ext}` : `${fileName}-${result.size}${ext}`,
          };
        }

        return acc;
      }, {});

      return formattedResults as Record<
        ImageSizeType,
        { fileKey: string; url: string; fileName: string }
      >;
    } catch (error) {
      this.logger.error(`Failed to upload images: ${error.message}`);
      throw new ApiBadRequestException(
        MessageCode.badRequest,
        error.message || 'Upload images failed',
      );
    }
  }

  async uploadFile(
    data: Buffer | string | ReadStream | ArrayBuffer,
    key: string,
    ACL?: ObjectCannedACL,
    contentType?: string,
    prefix = this.keyPrefix,
    maxRetries = 0,
    retryDelayMs = 1000,
  ) {
    const newKey = `${prefix}/${key}`;
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        const putInput: PutObjectCommandInput = {
          Bucket: this.bucket,
          Key: newKey,
          Body: data as any,
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

      if (result.$metadata.httpStatusCode !== HttpStatus.NO_CONTENT) {
        throw new HttpException(
          'Failed to delete object from S3',
          result.$metadata.httpStatusCode ?? HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return { Key };
    } catch (err) {
      this.logger.error(`Failed to delete object ${Key}: ${err.message}`);
      throw err;
    }
  }
}
