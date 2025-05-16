import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as AWS from 'aws-sdk';
import * as forge from 'node-forge';
import { Repository } from 'typeorm';

import { Device } from '../../modules/device/entities/device.entity';
import { logger } from '../logger/index.logger';

@Injectable()
export class IoTAuthGuard implements CanActivate {
  private iotClient: AWS.Iot;

  constructor(
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
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

  // Compute the SHA-1 fingerprint of a certificate
  private computeFingerprint(certPem: string): string {
    const cert = forge.pki.certificateFromPem(certPem);
    const der = forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes();
    const hash = forge.md.sha1.create();
    hash.update(der);
    const fingerprint = hash.digest().toHex();

    return fingerprint.toLowerCase();
  }

  async findCertificateId(clientFingerprint: string, deviceId: string) {
    try {
      // Get the certificates associated with the device
      const thingsData = await this.iotClient
        .listThingPrincipals({ thingName: `ANEMONE-${deviceId}` })
        .promise();
      const certificateArns = thingsData.principals;

      if (!certificateArns || certificateArns.length === 0) {
        logger.error(`No certificates associated with device: ${deviceId}`);
        throw new Error('No certificates found for device');
      }

      // Check each certificate associated with the device
      for (const arn of certificateArns) {
        const certId = arn.split('/')[1];
        const describeResponse = await this.iotClient
          .describeCertificate({ certificateId: certId })
          .promise();
        const awsCertPem = describeResponse.certificateDescription.certificatePem;

        // Compute the fingerprint of the AWS certificate
        const awsFingerprint = this.computeFingerprint(awsCertPem);

        if (awsFingerprint === clientFingerprint) {
          return describeResponse;
        }
      }
      throw new Error('Certificate not found for device');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error finding certificate ID:', error.message);
      throw error;
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // Extract device ID from headers
    const deviceId = request.headers['x-device-id'];
    logger.info(`Device ID: ${deviceId}`);
    if (!deviceId) {
      throw new UnauthorizedException('Empty Device Id');
    }
    // First check device in your database

    const device = await this.deviceRepository.findOne({
      where: { serialNumber: deviceId },
      relations: ['product'],
    });

    if (!device) {
      throw new UnauthorizedException('Device not registered');
    }

    // Extract device certificate from headers
    const encodedCert = request.headers['x-client-cert'];
    if (!encodedCert) {
      return false; // No certificate provided
    }

    const certPem = decodeURIComponent(encodedCert);
    // Compute the fingerprint of the client certificate
    const clientFingerprint = this.computeFingerprint(certPem);

    try {
      // Find the certificate ID by fingerprint
      const certificate = await this.findCertificateId(clientFingerprint, deviceId);
      // Validate the certificate
      if (certificate.certificateDescription.status !== 'ACTIVE') {
        logger.error(`Certificate is not active: ${certificate.certificateDescription.status}`);

        return false;
      }

      request.device = device;

      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Certificate validation error:', error.message);

      return false;
    }
  }
}
