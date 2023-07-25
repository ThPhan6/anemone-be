import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionEntity } from 'common/entities/permissions/permissions.entity';

import { PermissionsService } from './permissions.service';

@Module({
  imports: [TypeOrmModule.forFeature([PermissionEntity])],
  controllers: [],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
