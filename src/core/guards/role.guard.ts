import {
  CognitoIdentityProviderClient,
  GetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { logger } from 'core/logger/index.logger';

import { ApiUnauthorizedException } from '../../common/types/apiException.type';
import { UserRole } from '../../modules/user/user.type';
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
      const request = context.switchToHttp().getRequest();
      const options = this.reflector.get<PermDecoratorOptions>(
        PERM_OPTION_KEY,
        context.getHandler(),
      );

      const roles = options?.skipClassContext
        ? this.reflector.get(PERM_KEY, context.getHandler())
        : this.reflector.getAllAndMerge<string[]>(PERM_KEY, [
            context.getClass(),
            context.getHandler(),
          ]);

      // set user to request (UserDto)
      request.user = context.getArgs()[0]?.user;

      if (request.user.token_use !== 'access') {
        throw new ApiUnauthorizedException();
      }

      const token = request.headers.authorization.split(' ')[1];

      if (!roles.length || roles[0] === UserRole.MEMBER) {
        return true;
      }

      const userInfo = await this.getUser(token);

      const role = userInfo.UserAttributes.find((x) => x.Name === 'custom:role')?.Value as UserRole;

      request.user.role = role;
      request.user.isAdmin = role === UserRole.ADMIN;

      return roles.includes(role);
    } catch (error) {
      logger.error('RoleGuard failed', error);

      return false;
    }
  }

  private async getUser(token: string) {
    try {
      return this.cognitoClient.send(new GetUserCommand({ AccessToken: token }));
    } catch (error) {
      if (
        error.name === 'NotAuthorizedException' &&
        error.message === 'Access Token has been revoked'
      ) {
        return null;
      }

      throw error;
    }
  }
}
