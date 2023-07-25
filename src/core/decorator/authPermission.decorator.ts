import { SetMetadata } from '@nestjs/common';
import { RoleCode } from 'common/types/menuCode.type';

export const AuthPermission = (roleCode: RoleCode) => SetMetadata('auth_permission', { roleCode });
