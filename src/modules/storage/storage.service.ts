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
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { logger } from 'core/logger/index.logger';
import { v4 as uuid } from 'uuid';

import { UploadImageResDto } from './dto/storage.response';
import { LocalStorage } from './util';

@Injectable()
export class StorageService {
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

  async getSignedUrl(key: string) {
    if (!key) {
      return '';
    }

    return getSignedUrl(
      this.s3Client,
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
      {
        expiresIn: this.configService.get('AWS_SIGNED_URL_EXPIRES_IN'),
      },
    );
  }

  async persistTempFile(tempKey = '') {
    if (!tempKey.endsWith('_tmp')) {
      return tempKey;
    }

    const key = tempKey.slice(0, -4);

    try {
      const result = await this.s3Client
        .send(
          new CopyObjectCommand({
            Bucket: this.bucket,
            Key: key,
            CopySource: `/${this.bucket}/${tempKey}`,
          }),
        )
        .then((output) => {
          if (output.$metadata.httpStatusCode === HttpStatus.OK) {
            return this.s3Client.send(
              new DeleteObjectCommand({
                Bucket: this.bucket,
                Key: `/${this.bucket}/${tempKey}`,
              }),
            );
          }

          if (result.$metadata.httpStatusCode != HttpStatus.OK) {
            throw new HttpException(
              '',
              result.$metadata.httpStatusCode ?? HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
        });
    } catch (err) {
      logger.error(`persistTempFile: ${tempKey} - error: ${err}`);
      throw err;
    } finally {
      return key;
    }
  }

  async uploadTempFile(data: Buffer | string, key: string) {
    return this.uploadFile(data, this.getKeyTempFile(key));
  }

  async uploadFile(data: Buffer | string, key: string) {
    try {
      const result = await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: data,
        }),
      );
      if (result.$metadata.httpStatusCode != HttpStatus.OK) {
        throw new HttpException(
          '',
          result.$metadata.httpStatusCode ?? HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (err) {
      logger.error(`uploadFile: ${key} - error: ${err}`);
      throw err;
    }
  }

  async uploadImageFile(file: Express.Multer.File): Promise<UploadImageResDto> {
    const key = uuid();
    await this.uploadTempFile(file.buffer, key);
    const tempKey = this.getKeyTempFile(key);

    return { fileKey: tempKey, url: await this.getSignedUrl(tempKey) };
  }
}
