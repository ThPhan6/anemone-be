import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionSecurityGroupEntity } from 'common/entities/permissions/permission-security-group.entity';

import { PermissionSecurityGroupsService } from './permission-security-groups.service';

@Module({
  imports: [TypeOrmModule.forFeature([PermissionSecurityGroupEntity])],
  controllers: [],
  providers: [PermissionSecurityGroupsService],
  exports: [PermissionSecurityGroupsService],
})
export class PermissionSecurityGroupsModule {}
