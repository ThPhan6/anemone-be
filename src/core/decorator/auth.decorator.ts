import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { UserRole } from '../../modules/user/entities/user.entity';
import { PERM_KEY, PERM_OPTION_KEY, RoleGuard } from '../guards/role.guard';

export type PermDecoratorOptions = { skipClassContext?: boolean };

export function RolesGuard(roles: UserRole[] = [], options?: PermDecoratorOptions) {
  return applyDecorators(
    SetMetadata(PERM_KEY, roles),
    SetMetadata(PERM_OPTION_KEY, options),
    UseGuards(...[AuthGuard('cms'), RoleGuard]),
    ApiBearerAuth(),
    ApiUnauthorizedResponse(),
  );
}

export function AdminRoleGuard(options?: PermDecoratorOptions) {
  return applyDecorators(
    SetMetadata(PERM_KEY, [UserRole.ADMIN]),
    SetMetadata(PERM_OPTION_KEY, options),
    UseGuards(...[AuthGuard('cms'), RoleGuard]),
    ApiBearerAuth(),
    ApiUnauthorizedResponse(),
  );
}

export function StaffRoleGuard(options?: PermDecoratorOptions) {
  return applyDecorators(
    SetMetadata(PERM_KEY, [UserRole.ADMIN, UserRole.STAFF]),
    SetMetadata(PERM_OPTION_KEY, options),
    UseGuards(...[AuthGuard('cms'), RoleGuard]),
    ApiBearerAuth(),
    ApiUnauthorizedResponse(),
  );
}

export function MemberRoleGuard(options?: PermDecoratorOptions) {
  return applyDecorators(
    SetMetadata(PERM_KEY, [UserRole.MEMBER]),
    SetMetadata(PERM_OPTION_KEY, options),
    UseGuards(...[AuthGuard('mobile'), RoleGuard]),
    ApiBearerAuth(),
    ApiUnauthorizedResponse(),
  );
}
