import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ClientConfig,
} from '@aws-sdk/client-s3';
import { fromInstanceMetadata } from '@aws-sdk/credential-providers';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import { v4 as uuid } from 'uuid';

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

  constructor(private readonly configService: ConfigService) {
    const accessKeyId = configService.get('AWS_ACCESS_KEY_ID');
    const secretAccessKey = configService.get('AWS_SECRET_ACCESS_KEY');
    const region = configService.get('AWS_REGION');
    const fileDir = configService.get('FILE_DIR') ?? 'files';
    this.bucket = configService.get('AWS_BUCKET');
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

  async uploadFile(data: Buffer | string, key: string) {
    return this.uploadObject({
      Key: key,
      Body: data,
    });
  }

  async uploadImageFile(file: Express.Multer.File): Promise<UploadImageResDto> {
    const key = uuid();
    await this.uploadTempFile(file.buffer, key);
    const tempKey = this.getKeyTempFile(key);

    return { fileKey: tempKey, url: await this.getSignedUrl('getObject', { Key: tempKey }) };
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
