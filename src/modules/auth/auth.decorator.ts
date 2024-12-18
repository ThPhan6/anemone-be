import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UserRole } from 'common/enums/user.enum';
import { PermissionGuard } from 'core/guards/permission.guard';

import { PERM_KEY, PERM_OPTION_KEY } from './permission.guard';

export type PermDecoratorOptions = { skipClassContext?: boolean };

export function Rbac(roles: UserRole[] = [], options?: PermDecoratorOptions) {
  return applyDecorators(
    SetMetadata(PERM_KEY, roles),
    SetMetadata(PERM_OPTION_KEY, options),
    UseGuards(...[AuthGuard('jwt'), PermissionGuard]),
    ApiBearerAuth(),
    ApiUnauthorizedResponse(),
  );
}
