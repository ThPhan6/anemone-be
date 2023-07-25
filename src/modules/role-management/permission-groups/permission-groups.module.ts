import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionGroupEntity } from 'common/entities/permissions/permission-groups.entity';

import { PermissionGroupsService } from './permission-groups.service';

@Module({
  imports: [TypeOrmModule.forFeature([PermissionGroupEntity])],
  controllers: [],
  providers: [PermissionGroupsService],
  exports: [PermissionGroupsService],
})
export class PermissionGroupsModule {}
