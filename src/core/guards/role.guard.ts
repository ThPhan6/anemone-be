import {
  CognitoIdentityProviderClient,
  GetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { logger } from 'core/logger/index.logger';

import { UserRole } from '../../common/enums/user.enum';
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
      }

      const userInfo = await this.getUser(token);
      if (!userInfo) {
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

      const role = userInfo.UserAttributes.find((x) => x.Name === 'custom:role')?.Value as UserRole;

      const user = context.getArgs()[0]?.user as UserDto;
      user.role = role;
      user.isAdmin = role === UserRole.ADMIN;

      // set user role
      request.user = user;

      const hasPermission = roles.includes(role);

      return hasPermission;
    } catch (error) {
      logger.error('RoleGuard failed', error);

      return false;
    }
  }

  private async getUser(token: string) {
    try {
      const params = {
        AccessToken: token,
      };

      return this.cognitoClient.send(new GetUserCommand(params));
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
