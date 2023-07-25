import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PolicyPermissionEntity } from 'common/entities/permissions/policy-permission.entity';

import { PolicyPermissionsService } from './policy-permission.service';

@Module({
  imports: [TypeOrmModule.forFeature([PolicyPermissionEntity])],
  controllers: [],
  providers: [PolicyPermissionsService],
  exports: [PolicyPermissionsService],
})
export class PolicyPermissionsModule {}
