import { Injectable } from '@nestjs/common';
import { SecurityGroupMemberEntity } from 'common/entities/permissions/security-group-member.entity';
import { DataSource } from 'typeorm';

import { BaseRepository } from '../base.repository';

@Injectable()
export class SecurityGroupMemberRepository extends BaseRepository<SecurityGroupMemberEntity> {
  constructor(dataSource: DataSource) {
    super(SecurityGroupMemberEntity, dataSource);
  }
}
