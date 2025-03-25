import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as AWS from 'aws-sdk';
import * as forge from 'node-forge';
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

    // Extract device certificate from headers
    const encodedCert = request.headers['x-client-cert'];
    logger.info(`encodeCert ${JSON.stringify(encodedCert)}`);
    if (!encodedCert) {
      return false; // No certificate provided
    }

    const certPem = decodeURIComponent(encodedCert);
    const cert = forge.pki.certificateFromPem(certPem);
    const certificateId = cert.subject.getField('CN')?.value;
    if (!certificateId) {
      return false; // Invalid certificate (no CN)
    }

    logger.info(`Client Cert ID: ${JSON.stringify(certificateId)}`);

    // Extract device ID from headers
    const deviceId = request.headers['x-device-id'];
    logger.info(`Device ID: ${JSON.stringify(deviceId)}`);

    if (!deviceId) {
      throw new UnauthorizedException('Missing authentication headers');
    }

    try {
      // Check if the certificate is active
      const certData = await this.iotClient.describeCertificate({ certificateId }).promise();
      if (certData.certificateDescription.status !== 'ACTIVE') {
        return false; // Certificate is not active
      }

      // First check device in your database
      const device = await this.deviceRepository.findOne({
        where: { deviceId },
        relations: ['product'],
      });

      if (!device) {
        throw new UnauthorizedException('Device not registered');
      }

      request.device = device;
      // // Verify the certificate is associated with the device
      // const thingsData = await this.iot.listPrincipalThings({
      //   principal: certData.certificateDescription.certificateArn,
      // }).promise();
      // if ()thingsData.things.includes(deviceId); // Return true if device is associated
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Certificate validation error:', error.message);

      return false; // Validation failed
    }
  }
}
