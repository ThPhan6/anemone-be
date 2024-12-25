import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UserRole } from 'common/enums/user.enum';

import { PERM_KEY, PERM_OPTION_KEY, RoleGuard } from '../guards/role.guard';

export type PermDecoratorOptions = { skipClassContext?: boolean };

export function Rbac(roles: UserRole[] = [], options?: PermDecoratorOptions) {
  return applyDecorators(
    SetMetadata(PERM_KEY, roles),
    SetMetadata(PERM_OPTION_KEY, options),
    UseGuards(...[AuthGuard('jwt'), RoleGuard]),
    ApiBearerAuth(),
    ApiUnauthorizedResponse(),
  );
}

export function RbacAdmin(options?: PermDecoratorOptions) {
  return applyDecorators(
    SetMetadata(PERM_KEY, [UserRole.ADMIN]),
    SetMetadata(PERM_OPTION_KEY, options),
    UseGuards(...[AuthGuard('jwt'), RoleGuard]),
    ApiBearerAuth(),
    ApiUnauthorizedResponse(),
  );
}

export function RbacStaff(options?: PermDecoratorOptions) {
  return applyDecorators(
    SetMetadata(PERM_KEY, [UserRole.ADMIN, UserRole.STAFF]),
    SetMetadata(PERM_OPTION_KEY, options),
    UseGuards(...[AuthGuard('jwt'), RoleGuard]),
    ApiBearerAuth(),
    ApiUnauthorizedResponse(),
  );
}

export function RbacMember(options?: PermDecoratorOptions) {
  return applyDecorators(
    SetMetadata(PERM_KEY, [UserRole.MEMBER]),
    SetMetadata(PERM_OPTION_KEY, options),
    UseGuards(...[AuthGuard('jwt'), RoleGuard]),
    ApiBearerAuth(),
    ApiUnauthorizedResponse(),
  );
}
