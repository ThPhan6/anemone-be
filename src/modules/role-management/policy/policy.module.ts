import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PolicyEntity } from 'common/entities/permissions/policy.entity';

import { PolicyService } from './policy.service';

@Module({
  imports: [TypeOrmModule.forFeature([PolicyEntity])],
  controllers: [],
  providers: [PolicyService],
  exports: [PolicyService],
})
export class PolicyModule {}
