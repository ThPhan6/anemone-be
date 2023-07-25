import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecurityGroupPolicyEntity } from 'common/entities/permissions/security-group-policy.entity';

import { SecurityGroupPolicyService } from './security-group-policy.service';

@Module({
  imports: [TypeOrmModule.forFeature([SecurityGroupPolicyEntity])],
  controllers: [],
  providers: [SecurityGroupPolicyService],
  exports: [SecurityGroupPolicyService],
})
export class SecurityGroupPolicyModule {}
