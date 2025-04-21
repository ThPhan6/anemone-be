import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DeviceCertificate } from '../entities/device-certificate.entity';
import { CertificateStatus } from '../entities/device-certificate.entity';
import { AwsIotCoreService } from './aws-iot-core.service';

@Injectable()
export class DeviceCertificateService {
  private readonly logger = new Logger(DeviceCertificateService.name);

  constructor(
    @InjectRepository(DeviceCertificate)
    private certificateRepository: Repository<DeviceCertificate>,
    private awsIotCoreService: AwsIotCoreService,
  ) {}

  // Certificate management operations
  async createDeviceCertificate(deviceId: string) {
    const certResponse = await this.awsIotCoreService.createCertificateWithKeys();

    // Store certificate files in S3
    const { certKey, keyKey } = await this.awsIotCoreService.storeCertificateFiles(
      deviceId,
      certResponse.certificateId,
      certResponse.certificatePem,
      certResponse.keyPair.PrivateKey,
    );

    // Create database record
    const certificate = this.certificateRepository.create({
      device: { id: deviceId },
      certificateId: certResponse.certificateId,
      certificateArn: certResponse.certificateArn,
      certificateS3Key: certKey,
      privateKeyS3Key: keyKey,
      status: CertificateStatus.ACTIVE,
      activatedAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    });

    await this.certificateRepository.save(certificate);

    // Generate download URLs
    const urls = await this.awsIotCoreService.generateDownloadUrls(certKey, keyKey);

    return { certificate, urls };
  }

  async findCertificateById(certificateId: string) {
    const certificate = await this.certificateRepository.findOne({
      where: { certificateId },
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    return certificate;
  }

  async activateCertificate(certificateId: string): Promise<DeviceCertificate> {
    const certificate = await this.findCertificateById(certificateId);

    await this.awsIotCoreService.updateCertificateStatus(certificateId, 'ACTIVE');
    await this.awsIotCoreService.attachThingPolicy(
      certificate.device.product.serialNumber,
      certificate.certificateArn,
    );

    // Update and cleanup
    certificate.status = CertificateStatus.ACTIVE;
    certificate.activatedAt = new Date();
    await this.certificateRepository.save(certificate);

    // Delete private key from S3
    if (certificate.privateKeyS3Key) {
      await this.awsIotCoreService.deletePrivateKey(certificate.privateKeyS3Key);
      certificate.privateKeyS3Key = null;
      await this.certificateRepository.save(certificate);
    }

    return certificate;
  }

  async rotateCertificate(deviceId: string) {
    // Find active certificate
    const activeCertificate = await this.certificateRepository.findOne({
      where: { device: { product: { serialNumber: deviceId } }, status: CertificateStatus.ACTIVE },
    });

    if (!activeCertificate) {
      throw new NotFoundException('No active certificate found for device');
    }

    // Create new certificate
    const { certificate: newCertificate, urls } = await this.createDeviceCertificate(deviceId);

    // Attach policy and thing principal
    await this.awsIotCoreService.attachThingPolicy(deviceId, newCertificate.certificateArn);

    // Mark old certificate as inactive
    activeCertificate.status = CertificateStatus.INACTIVE;
    await this.certificateRepository.save(activeCertificate);

    return { certificate: newCertificate, urls };
  }

  async revokeCertificate(certificateId: string) {
    const certificate = await this.certificateRepository.findOne({
      where: { certificateId },
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    // Revoke in AWS IoT Core
    await this.awsIotCoreService.updateCertificateStatus(certificateId, 'REVOKED');

    // Update database record
    certificate.status = CertificateStatus.REVOKED;
    certificate.revokedAt = new Date();
    await this.certificateRepository.save(certificate);

    return certificate;
  }

  async validateCertificate(certificateId: string) {
    const certificate = await this.certificateRepository.findOne({
      where: { certificateId },
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    const awsCertInfo = await this.awsIotCoreService.describeCertificate(certificateId);

    return {
      isValid: certificate.status === CertificateStatus.ACTIVE && awsCertInfo.status === 'ACTIVE',
      certificate,
      awsCertificateStatus: awsCertInfo.status,
    };
  }
}
