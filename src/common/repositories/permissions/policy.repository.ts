import { Injectable } from '@nestjs/common';
import { PolicyEntity } from 'common/entities/permissions/policy.entity';
import { DataSource } from 'typeorm';

import { BaseRepository } from '../base.repository';

@Injectable()
export class PolicyRepository extends BaseRepository<PolicyEntity> {
  constructor(dataSource: DataSource) {
    super(PolicyEntity, dataSource);
  }
}
