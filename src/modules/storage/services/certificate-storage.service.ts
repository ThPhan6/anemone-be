import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { StorageService } from '../storage.service';

@Injectable()
export class CertificateStorageService {
  private readonly logger = new Logger(CertificateStorageService.name);
  private readonly bucketName: string;
  private readonly certificatesFolder = 'device-certificates';

  constructor(
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
  ) {
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
  }

  /**
   * Generate a unique S3 key for a certificate file
   */
  private generateCertificateKey(
    deviceId: string,
    certificateId: string,
    fileType: 'cert' | 'key',
  ): string {
    const extension = fileType === 'cert' ? 'pem' : 'key';

    return `${this.certificatesFolder}/${deviceId}/${certificateId}.${extension}`;
  }

  /**
   * Store a certificate in S3
   */
  async storeCertificate(
    deviceId: string,
    certificateId: string,
    certificatePem: string,
  ): Promise<string> {
    const key = this.generateCertificateKey(deviceId, certificateId, 'cert');
    try {
      await this.storageService.uploadObject({
        Key: key,
        Body: certificatePem,
        ContentType: 'application/x-pem-file',
      });
      this.logger.log(`Certificate for device ${deviceId} stored at ${key}`);

      return key;
    } catch (error) {
      this.logger.error(`Failed to store certificate for device ${deviceId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Store a private key in S3 (temporary storage)
   */
  async storePrivateKey(
    deviceId: string,
    certificateId: string,
    privateKey: string,
  ): Promise<string> {
    const key = this.generateCertificateKey(deviceId, certificateId, 'key');
    try {
      await this.storageService.uploadObject({
        Key: key,
        Body: privateKey,
        ContentType: 'application/x-pem-file',
      });
      this.logger.log(`Private key for device ${deviceId} stored at ${key}`);

      return key;
    } catch (error) {
      this.logger.error(`Failed to store private key for device ${deviceId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get certificate from S3
   */
  async getCertificate(certificateS3Key: string): Promise<string> {
    try {
      const result = await this.storageService.getFile(certificateS3Key);

      return result.toString('utf-8');
    } catch (error) {
      this.logger.error(`Failed to get certificate: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get private key from S3
   */
  async getPrivateKey(privateKeyS3Key: string): Promise<string> {
    try {
      const result = await this.storageService.getFile(privateKeyS3Key);

      return result.toString('utf-8');
    } catch (error) {
      this.logger.error(`Failed to get private key: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete private key from S3 after it's been delivered to the device
   */
  async deletePrivateKey(privateKeyS3Key: string): Promise<void> {
    try {
      await this.storageService.deleteObject({ Key: privateKeyS3Key });
      this.logger.log(`Private key deleted from ${privateKeyS3Key}`);
    } catch (error) {
      this.logger.error(`Failed to delete private key: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate a pre-signed URL for downloading certificate
   */
  async generateCertificateDownloadUrl(
    certificateS3Key: string,
    expiresIn = 3600,
  ): Promise<string> {
    try {
      return await this.storageService.getSignedUrl('getObject', {
        Key: certificateS3Key,
        Expires: expiresIn,
      });
    } catch (error) {
      this.logger.error(`Failed to generate certificate download URL: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate a pre-signed URL for downloading private key
   */
  async generatePrivateKeyDownloadUrl(privateKeyS3Key: string, expiresIn = 3600): Promise<string> {
    try {
      return await this.storageService.getSignedUrl('getObject', {
        Key: privateKeyS3Key,
        Expires: expiresIn,
      });
    } catch (error) {
      this.logger.error(`Failed to generate private key download URL: ${error.message}`);
      throw error;
    }
  }
}
