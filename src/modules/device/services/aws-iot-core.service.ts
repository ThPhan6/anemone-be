import {
  AddThingToThingGroupCommand,
  AttachPolicyCommand,
  AttachThingPrincipalCommand,
  CertificateStatus,
  CreateKeysAndCertificateCommand,
  CreateThingCommand,
  DeleteThingCommand,
  DescribeCertificateCommand,
  IoTClient,
  UpdateCertificateCommand,
} from '@aws-sdk/client-iot';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { StorageService } from '../../storage/storage.service';

@Injectable()
export class AwsIotCoreService {
  private readonly logger = new Logger(AwsIotCoreService.name);
  private readonly iotClient: IoTClient;
  private readonly defaultPolicy: string;

  constructor(
    private configService: ConfigService,
    private storageService: StorageService,
  ) {
    this.iotClient = new IoTClient({
      region: this.configService.get<string>('AWS_REGION'),
    });
    this.defaultPolicy = this.configService.get('AWS_IOT_DEFAULT_POLICY', 'AnemoneDevicePolicy');
  }

  /**
   * Create a thing in AWS IoT Core
   */
  async createThing(deviceId: string, attributes: Record<string, string>) {
    try {
      const command = new CreateThingCommand({
        thingName: deviceId,
        attributePayload: { attributes },
      });

      return await this.iotClient.send(command);
    } catch (error) {
      this.logger.error(`Failed to create thing ${deviceId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create keys and certificate in AWS IoT Core
   */
  async createCertificateWithKeys() {
    try {
      const command = new CreateKeysAndCertificateCommand({
        setAsActive: false,
      });

      return await this.iotClient.send(command);
    } catch (error) {
      this.logger.error(`Failed to create certificate: ${error.message}`);
      throw error;
    }
  }

  /**
   * Attach certificate to thing
   */
  async attachThingPolicy(thingName: string, certificateArn: string) {
    try {
      await Promise.all([
        this.iotClient.send(
          new AttachPolicyCommand({
            policyName: this.defaultPolicy,
            target: certificateArn,
          }),
        ),
        this.iotClient.send(
          new AttachThingPrincipalCommand({
            thingName,
            principal: certificateArn,
          }),
        ),
      ]);
    } catch (error) {
      this.logger.error(`Failed to attach policy: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update certificate status
   */
  async updateCertificateStatus(certificateId: string, status: CertificateStatus) {
    try {
      const command = new UpdateCertificateCommand({
        certificateId,
        newStatus: status,
      });

      await this.iotClient.send(command);
      this.logger.log(`Updated certificate ${certificateId} status to ${status}`);

      return true;
    } catch (error) {
      this.logger.error(`Failed to update certificate status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add thing to thing group
   */
  async addThingToGroup(thingName: string, thingGroupName: string) {
    try {
      const command = new AddThingToThingGroupCommand({
        thingName,
        thingGroupName,
      });

      await this.iotClient.send(command);
      this.logger.log(`Added thing ${thingName} to group ${thingGroupName}`);

      return true;
    } catch (error) {
      this.logger.error(`Failed to add thing to group: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a thing in AWS IoT Core
   */
  async deleteThing(thingName: string) {
    try {
      const command = new DeleteThingCommand({ thingName });
      await this.iotClient.send(command);
    } catch (error) {
      this.logger.error(`Failed to delete thing: ${error.message}`);
      throw error;
    }
  }

  /**
   * Describe a certificate in AWS IoT Core
   */
  async describeCertificate(certificateId: string) {
    try {
      const command = new DescribeCertificateCommand({ certificateId });
      const response = await this.iotClient.send(command);

      return response.certificateDescription;
    } catch (error) {
      this.logger.error(`Failed to describe certificate: ${error.message}`);
      throw error;
    }
  }

  async storeCertificateFiles(
    deviceId: string,
    certificateId: string,
    certificatePem: string,
    privateKey: string,
  ) {
    const certKey = `certificates/${deviceId}/${certificateId}/certificate.pem`;
    const keyKey = `certificates/${deviceId}/${certificateId}/private.key`;

    try {
      await Promise.all([
        this.storageService.uploadObject({
          Key: certKey,
          Body: certificatePem,
          ContentType: 'application/x-pem-file',
        }),
        this.storageService.uploadObject({
          Key: keyKey,
          Body: privateKey,
          ContentType: 'application/x-pem-file',
        }),
      ]);

      return { certKey, keyKey };
    } catch (error) {
      this.logger.error(`Failed to store certificate files: ${error.message}`);
      throw error;
    }
  }

  async generateDownloadUrls(certKey: string, keyKey: string) {
    try {
      const [certificateUrl, privateKeyUrl] = await Promise.all([
        this.storageService.getSignedUrl('getObject', {
          Key: certKey,
          Expires: 3600, // 1 hour
        }),
        this.storageService.getSignedUrl('getObject', {
          Key: keyKey,
          Expires: 3600, // 1 hour
        }),
      ]);

      return { certificateUrl, privateKeyUrl };
    } catch (error) {
      this.logger.error(`Failed to generate download URLs: ${error.message}`);
      throw error;
    }
  }

  async deletePrivateKey(keyKey: string) {
    try {
      await this.storageService.deleteObject({ Key: keyKey });
    } catch (error) {
      this.logger.error(`Failed to delete private key: ${error.message}`);
      throw error;
    }
  }
}
