import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecurityGroupEntity } from 'common/entities/permissions/security-groups.entity';

import { SecurityGroupMemberModule } from '../security-group-members/security-group-members.module';
import { SecurityGroupsService } from './security-groups.service';

@Module({
  imports: [TypeOrmModule.forFeature([SecurityGroupEntity]), forwardRef(() => SecurityGroupMemberModule)],
  controllers: [],
  providers: [SecurityGroupsService],
  exports: [SecurityGroupsService],
})
export class SecurityGroupsModule {}
