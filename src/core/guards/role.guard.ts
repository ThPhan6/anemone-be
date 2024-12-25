import {
  CognitoIdentityProviderClient,
  GetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { logger } from 'core/logger/index.logger';

import { ApiUnauthorizedException } from '../../common/types/apiException.type';
import { UserDto } from '../../modules/auth/dto/auth-user.dto';
import { PermDecoratorOptions } from '../decorator/auth.decorator';

export const PERM_KEY = 'roles';
export const PERM_OPTION_KEY = 'roles_options';

@Injectable()
export class RoleGuard implements CanActivate {
  private readonly cognitoClient: CognitoIdentityProviderClient;

  constructor(private readonly reflector: Reflector) {
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  async canActivate(context: ExecutionContext) {
    try {
      const options = this.reflector.get<PermDecoratorOptions>(
        PERM_OPTION_KEY,
        context.getHandler(),
      );

      const request = context.switchToHttp().getRequest();
      const token = request.headers['authorization']?.split(' ')[1];

      if (!token) {
        throw new ApiUnauthorizedException();
      } // Check if the token has been revoked

      const isRevoked = await this.isTokenRevoked(token);
      if (isRevoked) {
        throw new ApiUnauthorizedException();
      }

      const roles = options?.skipClassContext
        ? this.reflector.get(PERM_KEY, context.getHandler())
        : this.reflector.getAllAndMerge<string[]>(PERM_KEY, [
            context.getClass(),
            context.getHandler(),
          ]);

      if (!roles.length) {
        return true;
      }

      const user = context.getArgs()[0]?.user as UserDto;

      const hasPermission = roles.includes(user.role);

      return hasPermission;
    } catch (error) {
      logger.error('RoleGuard failed', error);

      return false;
    }
  }

  private async isTokenRevoked(token: string): Promise<boolean> {
    try {
      const params = {
        AccessToken: token,
      };

      await this.cognitoClient.send(new GetUserCommand(params));

      return false;
    } catch (error) {
      if (
        error.name === 'NotAuthorizedException' &&
        error.message === 'Access Token has been revoked'
      ) {
        return true;
      }

      throw error;
    }
  }
}
