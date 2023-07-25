import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthPermissionValue } from 'common/types/authPermissionValue.type';

@Injectable()
export class PermissionGuard implements CanActivate {
  public constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permission = this.reflector.get<{ value: number }>('auth_permission', context.getHandler());

    if (!permission) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const value = user?.permissions || 0;

    return (AuthPermissionValue.refer & value) != 0;
  }
}
