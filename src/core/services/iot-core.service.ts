import {
  AttachPrincipalPolicyCommand,
  AttachThingPrincipalCommand,
  CreateKeysAndCertificateCommand,
  CreatePolicyCommand,
  CreateThingCommand,
  DescribeCertificateCommand,
  GetPolicyCommand,
  IoTClient,
} from '@aws-sdk/client-iot';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { formatThingName } from '../../common/utils/helper';

@Injectable()
export class IotService {
  private iot: IoTClient;
  private readonly ioTPolicyResource: string;
  private readonly ioTPolicyName: string;
  private readonly environment: string;
  private readonly thingVersion: string;

  constructor(private readonly configService: ConfigService) {
    const accessKeyId = configService.get('AWS_ACCESS_KEY_ID');
    const secretAccessKey = configService.get('AWS_SECRET_ACCESS_KEY');
    const region = configService.get('AWS_REGION');
    this.iot = new IoTClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
    this.ioTPolicyResource = configService.get('AWS_IOT_POLICY_RESOURCE') || '*';
    this.ioTPolicyName = configService.get('AWS_IOT_DEFAULT_POLICY') || 'Anemone-Policy';
    this.environment = configService.get('NODE_ENV') || 'development';
    this.thingVersion = configService.get('AWS_IOT_CORE_THING_VERSION') || 'v1.0';
  }

  async createThingAndCertificate(deviceId: string): Promise<{
    thingName: string;
    certificateArn: string;
    certificatePem: string;
    certificateId: string;
    privateKey: string;
    publicKey: string;
  }> {
    try {
      // 1. Create Certificate
      const certificate = await this.iot.send(
        new CreateKeysAndCertificateCommand({ setAsActive: true }),
      );
      const certificateId = certificate.certificateId;
      const certificateArn = certificate.certificateArn;
      const certificatePem = certificate.certificatePem;
      const privateKey = certificate.keyPair.PrivateKey;
      const publicKey = certificate.keyPair.PublicKey;

      // 2. Create Thing
      const thingName = formatThingName(deviceId); // Generate a unique thing name
      const createParams = {
        thingName: thingName,
        attributePayload: {
          attributes: {
            deviceId,
            version: this.thingVersion,
            environment: this.environment,
          },
        },
      };

      await this.iot.send(new CreateThingCommand(createParams));

      // 3. Attach Principal to Certificate (Thing)
      const attachParams = {
        principal: certificateArn,
        thingName: thingName,
      };

      await this.iot.send(
        new AttachPrincipalPolicyCommand({
          policyName: await this.getOrCreateIotPolicy(),
          principal: certificateArn,
        }),
      );

      await this.iot.send(new AttachThingPrincipalCommand(attachParams));

      return { thingName, certificateArn, certificatePem, privateKey, publicKey, certificateId };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error creating Thing and Certificate:', error);
      throw error;
    }
  }

  async describeCertificate(certificateId: string) {
    try {
      const response = await this.iot.send(
        new DescribeCertificateCommand({
          certificateId,
        }),
      );

      return response.certificateDescription;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error describing certificate:', error);
      throw error;
    }
  }

  /**
   * Check certificate status and wait until it is active
   * @param certificateId The ID of the certificate to check
   * @param maxAttempts Maximum number of attempts to check the status
   * @param delayMs Delay in milliseconds between checks
   */
  async waitForCertificateStatus(
    certificateId: string,
    maxAttempts = 20,
    delayMs = 1000,
  ): Promise<boolean> {
    let attempts = 0;

    while (attempts < maxAttempts) {
      const certDescription = await this.describeCertificate(certificateId);

      if (certDescription.status === 'ACTIVE') {
        return true;
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
      attempts++;
    }

    return false;
  }

  private async getOrCreateIotPolicy(): Promise<string> {
    try {
      await this.iot.send(new GetPolicyCommand({ policyName: this.ioTPolicyName }));

      return this.ioTPolicyName; // Policy exists, return its name
    } catch (error) {
      if (error.code === 'ResourceNotFoundException') {
        // Policy does not exist, create it
        // eslint-disable-next-line no-console
        console.log(`Policy "${this.ioTPolicyName}" not found, creating it...`);
        const policyDocument = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Action: ['iot:Connect', 'iot:Publish', 'iot:Subscribe', 'iot:Receive'],
              Resource: this.ioTPolicyResource,
            },
          ],
        };

        const createPolicyParams = {
          policyName: this.ioTPolicyName,
          policyDocument: JSON.stringify(policyDocument),
        };

        try {
          await this.iot.send(new CreatePolicyCommand(createPolicyParams));
          // eslint-disable-next-line no-console
          console.log(`Policy "${this.ioTPolicyName}" created successfully.`);

          return this.ioTPolicyName;
        } catch (createError) {
          // eslint-disable-next-line no-console
          console.error(`Error creating policy "${this.ioTPolicyName}":`, createError);
          throw createError; // Re-throw the error to be handled by the caller
        }
      } else {
        // Some other error occurred while trying to get the policy
        // eslint-disable-next-line no-console
        console.error('Error getting policy:', error);
        throw error; // Re-throw the error
      }
    }
  }
}
