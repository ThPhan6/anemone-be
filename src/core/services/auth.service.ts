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

@Injectable()
export class AuthService {
  private cognitoClient: CognitoIdentityProviderClient;

  constructor(private readonly awsConfigService: AwsConfigService) {
    this.cognitoClient = this.awsConfigService.getCognitoIdentityServiceProvider();
  }

  async signIn(email: string, password: string): Promise<InitiateAuthCommandOutput> {
    const params: InitiateAuthCommandInput = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: this.awsConfigService.userPoolClientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
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
    const params: RespondToAuthChallengeCommandInput = {
      ChallengeName: 'NEW_PASSWORD_REQUIRED',
      ClientId: this.awsConfigService.userPoolClientId,
      ChallengeResponses: {
        USERNAME: email,
        NEW_PASSWORD: newPassword,
      },
      Session: session,
    };

    const command = new RespondToAuthChallengeCommand(params);

    return this.cognitoClient.send(command);
  }

  async changePassword(email: string, newPassword: string): Promise<void> {
    const params: AdminUpdateUserAttributesCommandInput = {
      UserPoolId: this.awsConfigService.userPoolId,
      Username: email,
      UserAttributes: [{ Name: 'password', Value: newPassword }],
    };

    const command = new AdminUpdateUserAttributesCommand(params);

    await this.cognitoClient.send(command);
  }

  async resetPassword(email: string): Promise<ForgotPasswordCommandOutput> {
    const params: ForgotPasswordCommandInput = {
      ClientId: this.awsConfigService.userPoolClientId,
      Username: email,
    };

    const command = new ForgotPasswordCommand(params);

    return this.cognitoClient.send(command);
  }

  async createUser(
    email: string,
    password: string,
    name: string,
  ): Promise<AdminCreateUserCommandOutput> {
    const params: AdminCreateUserCommandInput = {
      UserPoolId: this.awsConfigService.userPoolId,
      Username: email,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'name', Value: name },
      ],
      TemporaryPassword: password,
    };

    const command = new AdminCreateUserCommand(params);

    return this.cognitoClient.send(command);
  }

  async updateUser(email: string, name: string): Promise<AdminUpdateUserAttributesCommandOutput> {
    const params: AdminUpdateUserAttributesCommandInput = {
      UserPoolId: this.awsConfigService.userPoolId,
      Username: email,
      UserAttributes: [{ Name: 'name', Value: name }],
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
    const params: AdminInitiateAuthCommandInput = {
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId: this.awsConfigService.userPoolClientId,
      UserPoolId: this.awsConfigService.userPoolId,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
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
}
