import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { logger } from 'core/logger/index.logger';
import { Observable } from 'rxjs';

import { PermDecoratorOptions } from './auth.decorator';
import { UserDto } from './auth-user.dto';

export const PERM_KEY = 'roles';
export const PERM_OPTION_KEY = 'roles_options';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    try {
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

      if (!roles.length) {
        return true;
      }

      const role = context.getArgs()[0]?.user as UserDto;

      const hasPermission = roles.includes(role);

      return hasPermission;
    } catch (error) {
      logger.error('RoleGuard failed', error);

      return false;
    }
  }
}
