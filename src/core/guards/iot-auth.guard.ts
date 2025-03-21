import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as AWS from 'aws-sdk';
import { Repository } from 'typeorm';

import { DeviceRepository } from '../../common/repositories/device.repository';
import { Device } from '../../modules/device/entities/device.entity';
import {
  CertificateStatus,
  DeviceCertificate,
} from '../../modules/device/entities/device-certificate.entity';

@Injectable()
export class IoTAuthGuard implements CanActivate {
  private iotClient: AWS.Iot;

  constructor(
    @InjectRepository(Device)
    private deviceRepository: DeviceRepository,
    @InjectRepository(DeviceCertificate)
    private certificateRepository: Repository<DeviceCertificate>,
  ) {
    // Initialize AWS IoT client
    this.iotClient = new AWS.Iot({ region: 'ap-southeast-1' }); // Use your region
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // console.log('request', request);
    // Extract device ID and certificate ID from headers
    const deviceId = request.headers['x-device-id'];
    const certificateId = request.headers['x-certificate-id'];

    if (!deviceId || !certificateId) {
      throw new UnauthorizedException('Missing authentication headers');
    }

    try {
      // First check device in your database
      const device = await this.deviceRepository.findOne({
        where: { deviceId },
        relations: ['product'],
      });

      if (!device) {
        throw new UnauthorizedException('Device not registered');
      }

      // Verify certificate status in AWS IoT Core
      const params = { certificateId };
      const certResponse = await this.iotClient.describeCertificate(params).promise();

      if (certResponse.certificateDescription.status !== 'ACTIVE') {
        throw new UnauthorizedException('Certificate is not active in AWS IoT Core');
      }

      // Also verify against your local database
      const certificate = await this.certificateRepository.findOne({
        where: {
          certificateId,
          device: { id: device.id },
          status: CertificateStatus.ACTIVE,
        },
      });

      if (!certificate) {
        throw new UnauthorizedException('Invalid or inactive certificate');
      }

      // Check if certificate is expired
      const now = new Date();
      if (certificate.expiresAt < now) {
        throw new UnauthorizedException('Certificate expired');
      }

      // Attach device to request
      request.device = device;

      return true;
    } catch (error) {
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
