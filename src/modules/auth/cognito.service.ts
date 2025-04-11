import {
  AdminCreateUserCommand,
  AdminCreateUserCommandInput,
  AdminCreateUserCommandOutput,
  AdminDeleteUserCommand,
  AdminDeleteUserCommandInput,
  AdminDeleteUserCommandOutput,
  AdminGetUserCommand,
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
  GetUserCommand,
  GlobalSignOutCommand,
  InitiateAuthCommand,
  InitiateAuthCommandInput,
  RespondToAuthChallengeCommand,
  RespondToAuthChallengeCommandInput,
  RespondToAuthChallengeCommandOutput,
  RevokeTokenCommand,
  SignUpCommand,
  SignUpCommandInput,
  SignUpCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AwsConfigService } from 'common/config/aws.config';
import { UserRole } from 'modules/user/user.type';

import { logger } from '../../core/logger/index.logger';
import { AuthResponseDto } from './dto/auth.response';

@Injectable()
export class CognitoService {
  private readonly cognitoClient: CognitoIdentityProviderClient;

  constructor(private readonly awsConfigService: AwsConfigService) {
    this.cognitoClient = this.awsConfigService.getCognitoIdentityServiceProvider();
  }

  async isUserEmailVerified(email: string, cms = false): Promise<boolean> {
    try {
      const params = {
        UserPoolId: cms
          ? this.awsConfigService.userCmsPoolId
          : this.awsConfigService.userMobilePoolId,
        Username: email,
      };

      const command = new AdminGetUserCommand(params);
      const result = await this.cognitoClient.send(command);

      logger.info(`result: ${JSON.stringify(result, null, 2)}`);

      return result.UserAttributes.some(
        (attr) => attr.Name === 'email_verified' && attr.Value === 'true',
      );
    } catch (error) {
      logger.error(`Error fetching user details from Cognito: ${JSON.stringify(error, null, 2)}`);
      throw new Error('Could not verify email status');
    }
  }

  async signIn(email: string, password: string): Promise<AuthResponseDto> {
    const params: InitiateAuthCommandInput = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: this.awsConfigService.userCmsPoolClientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    };

    const command = new InitiateAuthCommand(params);
    const result = await this.cognitoClient.send(command);
    // Only handle successful authentication
    if (!result.AuthenticationResult) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Return only the authentication result
    return {
      accessToken: result.AuthenticationResult.AccessToken,
      idToken: result.AuthenticationResult.IdToken,
      refreshToken: result.AuthenticationResult.RefreshToken,
      expiresIn: result.AuthenticationResult.ExpiresIn,
    };
  }

  async respondToNewPasswordChallenge(
    email: string,
    newPassword: string,
    session: string,
  ): Promise<RespondToAuthChallengeCommandOutput> {
    const params: RespondToAuthChallengeCommandInput = {
      ChallengeName: 'NEW_PASSWORD_REQUIRED',
      ClientId: this.awsConfigService.userCmsPoolClientId,
      ChallengeResponses: {
        USERNAME: email,
        NEW_PASSWORD: newPassword,
      },
      Session: session,
    };

    const command = new RespondToAuthChallengeCommand(params);

    return this.cognitoClient.send(command);
  }

  async changePassword(email: string, newPassword: string) {
    const params: AdminSetUserPasswordCommandInput = {
      UserPoolId: this.awsConfigService.userCmsPoolId,
      Username: email,
      Password: newPassword,
      // Permanent: true, Set to true if you want the password to be permanent
    };

    const command = new AdminSetUserPasswordCommand(params);

    return this.cognitoClient.send(command);
  }

  async resetPassword(email: string): Promise<ForgotPasswordCommandOutput> {
    const params: ForgotPasswordCommandInput = {
      ClientId: this.awsConfigService.userCmsPoolClientId,
      Username: email,
    };

    const command = new ForgotPasswordCommand(params);

    return this.cognitoClient.send(command);
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  }): Promise<SignUpCommandOutput> {
    const { email, password, firstName, lastName, role } = data;
    const params: SignUpCommandInput = {
      ClientId: this.awsConfigService.userCmsPoolClientId,
      Username: email,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'name', Value: firstName },
        { Name: 'given_name', Value: lastName },
        { Name: 'custom:role', Value: role },
        { Name: 'phone_number', Value: '' },
      ],
      Password: password,
    };

    const command = new SignUpCommand(params);

    const result = await this.cognitoClient.send(command);

    return result;
  }

  async createUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  }): Promise<AdminCreateUserCommandOutput> {
    const { email, password, firstName, lastName, role } = data;
    const params: AdminCreateUserCommandInput = {
      UserPoolId: this.awsConfigService.userCmsPoolId,
      Username: email,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'name', Value: firstName },
        { Name: 'given_name', Value: lastName },
        { Name: 'custom:role', Value: role },
      ],
      TemporaryPassword: password,
    };

    const command = new AdminCreateUserCommand(params);

    const result = await this.cognitoClient.send(command);

    return result;
  }

  async updateUser(data: {
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  }): Promise<AdminUpdateUserAttributesCommandOutput> {
    const { email, firstName, lastName, role } = data;
    const params: AdminUpdateUserAttributesCommandInput = {
      UserPoolId: this.awsConfigService.userCmsPoolId,
      Username: email,
      UserAttributes: [
        { Name: 'name', Value: firstName },
        { Name: 'given_name', Value: lastName },
        { Name: 'custom:role', Value: role },
      ],
    };

    const command = new AdminUpdateUserAttributesCommand(params);

    return this.cognitoClient.send(command);
  }

  async deleteUser(email: string): Promise<AdminDeleteUserCommandOutput> {
    const params: AdminDeleteUserCommandInput = {
      UserPoolId: this.awsConfigService.userCmsPoolId,
      Username: email,
    };

    const command = new AdminDeleteUserCommand(params);

    return this.cognitoClient.send(command);
  }

  async refreshToken(
    refreshToken: string,
    username: string,
  ): Promise<AdminInitiateAuthCommandOutput> {
    const params: AdminInitiateAuthCommandInput = {
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId: this.awsConfigService.userCmsPoolClientId,
      UserPoolId: this.awsConfigService.userCmsPoolId,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
        USERNAME: username,
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
      ClientId: this.awsConfigService.userCmsPoolClientId,
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

  async getProfile(accessToken: string) {
    try {
      const command = new GetUserCommand({
        AccessToken: accessToken,
      });

      const response = await this.cognitoClient.send(command);

      const attrMap = response.UserAttributes?.reduce(
        (acc, attr) => {
          if (attr.Name && attr.Value) {
            acc[attr.Name] = attr.Value;
          }

          return acc;
        },
        {} as Record<string, string>,
      );

      return {
        id: attrMap.sub,
        email: attrMap.email,
        name: attrMap.name,
        givenName: attrMap.given_name,
        role: attrMap['custom:role'],
        emailVerified: attrMap.email_verified === 'true',
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid access token');
    }
  }
}
