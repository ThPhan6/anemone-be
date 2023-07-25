import { Injectable } from '@nestjs/common';
import { SecurityGroupPolicyEntity } from 'common/entities/permissions/security-group-policy.entity';
import { DataSource } from 'typeorm';

import { BaseRepository } from '../base.repository';

@Injectable()
export class SecurityGroupPolicyRepository extends BaseRepository<SecurityGroupPolicyEntity> {
  constructor(dataSource: DataSource) {
    super(SecurityGroupPolicyEntity, dataSource);
  }
}
