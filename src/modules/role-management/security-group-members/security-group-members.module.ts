import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecurityGroupMemberEntity } from 'common/entities/permissions/security-group-member.entity';

import { SecurityGroupMemberService } from './security-group-members.service';

@Module({
  imports: [TypeOrmModule.forFeature([SecurityGroupMemberEntity])],
  controllers: [],
  providers: [SecurityGroupMemberService],
  exports: [SecurityGroupMemberService],
})
export class SecurityGroupMemberModule {}
