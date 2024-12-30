import {
  AdminCreateUserCommand,
  AdminCreateUserCommandInput,
  AdminCreateUserCommandOutput,
  AdminDeleteUserCommand,
  AdminDeleteUserCommandInput,
  AdminDeleteUserCommandOutput,
  AdminInitiateAuthCommand,
  AdminInitiateAuthCommandInput,
  AdminInitiateAuthCommandOutput,
  AdminSetUserPasswordCommand,
  AdminSetUserPasswordCommandInput,
  AdminUpdateUserAttributesCommand,
  AdminUpdateUserAttributesCommandInput,
  AdminUpdateUserAttributesCommandOutput,
  CognitoIdentityProviderClient,
  ForgotPasswordCommand,
  ForgotPasswordCommandInput,
  ForgotPasswordCommandOutput,
  GlobalSignOutCommand,
  InitiateAuthCommand,
  InitiateAuthCommandInput,
  InitiateAuthCommandOutput,
  RespondToAuthChallengeCommand,
  RespondToAuthChallengeCommandInput,
  RespondToAuthChallengeCommandOutput,
  RevokeTokenCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { Injectable } from '@nestjs/common';
import { AwsConfigService } from 'common/config/aws.config';
import { UserRole } from 'common/enums/user.enum';
import * as crypto from 'crypto';

@Injectable()
export class CognitoService {
  private readonly cognitoClient: CognitoIdentityProviderClient;

  constructor(private readonly awsConfigService: AwsConfigService) {
    this.cognitoClient = this.awsConfigService.getCognitoIdentityServiceProvider();
  }

  async signIn(email: string, password: string): Promise<InitiateAuthCommandOutput> {
    const secretHash = this.calculateSecretHash(email);

    const params: InitiateAuthCommandInput = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: this.awsConfigService.userPoolClientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
        SECRET_HASH: secretHash,
      },
    };

    const command = new InitiateAuthCommand(params);

    return this.cognitoClient.send(command);
  }

  async respondToNewPasswordChallenge(
    email: string,
    newPassword: string,
    session: string,
  ): Promise<RespondToAuthChallengeCommandOutput> {
    const secretHash = this.calculateSecretHash(email);

    const params: RespondToAuthChallengeCommandInput = {
      ChallengeName: 'NEW_PASSWORD_REQUIRED',
      ClientId: this.awsConfigService.userPoolClientId,
      ChallengeResponses: {
        USERNAME: email,
        NEW_PASSWORD: newPassword,
        SECRET_HASH: secretHash,
      },
      Session: session,
    };

    const command = new RespondToAuthChallengeCommand(params);

    return this.cognitoClient.send(command);
  }

  async changePassword(email: string, newPassword: string) {
    const params: AdminSetUserPasswordCommandInput = {
      UserPoolId: this.awsConfigService.userPoolId,
      Username: email,
      Password: newPassword,
      // Permanent: true, Set to true if you want the password to be permanent
    };

    const command = new AdminSetUserPasswordCommand(params);

    return this.cognitoClient.send(command);
  }

  async resetPassword(email: string): Promise<ForgotPasswordCommandOutput> {
    const secretHash = this.calculateSecretHash(email);

    const params: ForgotPasswordCommandInput = {
      ClientId: this.awsConfigService.userPoolClientId,
      Username: email,
      SecretHash: secretHash,
    };

    const command = new ForgotPasswordCommand(params);

    return this.cognitoClient.send(command);
  }

  async createUser(data: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
  }): Promise<AdminCreateUserCommandOutput> {
    const { email, password, name } = data;
    const params: AdminCreateUserCommandInput = {
      UserPoolId: this.awsConfigService.userPoolId,
      Username: email,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'name', Value: name },
        // { Name: 'custom:role', Value: role },
      ],
      TemporaryPassword: password,
    };

    const command = new AdminCreateUserCommand(params);

    return this.cognitoClient.send(command);
  }

  async updateUser(data: {
    email: string;
    name: string;
    role: UserRole;
  }): Promise<AdminUpdateUserAttributesCommandOutput> {
    const { email, name } = data;
    const params: AdminUpdateUserAttributesCommandInput = {
      UserPoolId: this.awsConfigService.userPoolId,
      Username: email,
      UserAttributes: [
        { Name: 'name', Value: name },
        // {
        //   Name: 'custom:role',
        //   Value: role,
        // },
      ],
    };

    const command = new AdminUpdateUserAttributesCommand(params);

    return this.cognitoClient.send(command);
  }

  async deleteUser(email: string): Promise<AdminDeleteUserCommandOutput> {
    const params: AdminDeleteUserCommandInput = {
      UserPoolId: this.awsConfigService.userPoolId,
      Username: email,
    };

    const command = new AdminDeleteUserCommand(params);

    return this.cognitoClient.send(command);
  }

  async refreshToken(refreshToken: string): Promise<AdminInitiateAuthCommandOutput> {
    const secretHash = this.calculateSecretHash(refreshToken);

    const params: AdminInitiateAuthCommandInput = {
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId: this.awsConfigService.userPoolClientId,
      UserPoolId: this.awsConfigService.userPoolId,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
        SECRET_HASH: secretHash,
      },
    };

    const command = new AdminInitiateAuthCommand(params);

    return this.cognitoClient.send(command);
  }

  async signOut(token: { accessToken: string; refreshToken: string }) {
    const { accessToken, refreshToken } = token;
    const commandRevokeAccessToken = new GlobalSignOutCommand({ AccessToken: accessToken });

    const commandRevokeRefreshToken = new RevokeTokenCommand({
      Token: refreshToken,
      ClientId: this.awsConfigService.userPoolClientId,
    });

    try {
      await Promise.all([
        this.cognitoClient.send(commandRevokeAccessToken),
        this.cognitoClient.send(commandRevokeRefreshToken),
      ]);

      return null;
    } catch (error) {
      return error;
    }
  }

  private calculateSecretHash(username: string): string {
    const clientId = this.awsConfigService.userPoolClientId;
    const clientSecret = this.awsConfigService.userPoolClientSecret;

    return crypto
      .createHmac('SHA256', clientSecret)
      .update(username + clientId)
      .digest('base64');
  }
}
