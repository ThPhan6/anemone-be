import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AwsConfigService {
  constructor(private readonly configService: ConfigService) {}

  getCognitoIdentityServiceProvider(): CognitoIdentityProviderClient {
    return new CognitoIdentityProviderClient({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  get userMobilePoolId() {
    return this.configService.get<string>('AWS_COGNITO_MOBILE_USER_POOL_ID');
  }
  get userCmsPoolId() {
    return this.configService.get<string>('AWS_COGNITO_USER_POOL_ID');
  }

  get userMobilePoolClientId() {
    return this.configService.get<string>('AWS_COGNITO_MOBILE_CLIENT_ID');
  }
  get userCmsPoolClientId() {
    return this.configService.get<string>('AWS_COGNITO_CLIENT_ID');
  }
}
