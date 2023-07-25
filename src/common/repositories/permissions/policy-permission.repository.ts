import { Injectable } from '@nestjs/common';
import { PolicyPermissionEntity } from 'common/entities/permissions/policy-permission.entity';
import { DataSource } from 'typeorm';

import { BaseRepository } from '../base.repository';

@Injectable()
export class PolicyPermissionRepository extends BaseRepository<PolicyPermissionEntity> {
  constructor(dataSource: DataSource) {
    super(PolicyPermissionEntity, dataSource);
  }
}
