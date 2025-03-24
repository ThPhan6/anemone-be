import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as AWS from 'aws-sdk';
import { Repository } from 'typeorm';

import { DeviceRepository } from '../../common/repositories/device.repository';
import { Device } from '../../modules/device/entities/device.entity';
import { DeviceCertificate } from '../../modules/device/entities/device-certificate.entity';
import { logger } from '../logger/index.logger';

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
    this.iotClient = new AWS.Iot({
      region: process.env.AWS_REGION,
      credentials: new AWS.Credentials({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }),
    }); // Use your region
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const cert = request.socket.getPeerCertificate();
    // logger.info('Client Cert Subject:', cert);
    // logger.info('Serial Number:', cert.serialNumber);
    logger.info(
      JSON.stringify(
        {
          serialNumber: cert.serialNumber,
          subject: cert.subject,
          authorized: request.client.authorized,
        },
        null,
        2,
      ),
    );

    if (!cert || !cert.subject || !cert.subject.CN) {
      throw new UnauthorizedException('No valid cert subject');
    }

    // Extract device ID and certificate ID from headers
    const deviceId = request.headers['x-device-id'];
    // const certificateId = request.headers['x-certificate-id'];

    if (!deviceId) {
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
      const params = {
        certificateId:
          process.env.AWS_IOT_TEST_CERTIFICATE_ID ||
          'c645baccb7a4ec0cefe9692bc32035694b2b390624e5cc49ab45fecec4272795',
      };
      const certResponse = await this.iotClient.describeCertificate(params).promise();

      logger.info(
        JSON.stringify(
          {
            deviceId,
            certificateId: params.certificateId,
            status: certResponse.certificateDescription.status,
          },
          null,
          2,
        ),
      );
      if (certResponse.certificateDescription.status !== 'ACTIVE') {
        throw new UnauthorizedException('Certificate is not active in AWS IoT Core');
      }

      // Also verify against your local database
      // const certificate = await this.certificateRepository.findOne({
      //   where: {
      //     certificateId,
      //     device: { id: device.id },
      //     status: CertificateStatus.ACTIVE,
      //   },
      // });

      // if (!certificate) {
      //   throw new UnauthorizedException('Invalid or inactive certificate');
      // }

      // // Check if certificate is expired
      // const now = new Date();
      // if (certificate.expiresAt < now) {
      //   throw new UnauthorizedException('Certificate expired');
      // }

      // Attach device to request
      request.device = device;

      return true;
    } catch (error) {
      logger.error(error);
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
