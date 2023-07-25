import { Injectable } from '@nestjs/common';
import { SecurityGroupEntity } from 'common/entities/permissions/security-groups.entity';
import { DataSource } from 'typeorm';

import { BaseRepository } from '../base.repository';

@Injectable()
export class SecurityGroupRepository extends BaseRepository<SecurityGroupEntity> {
  constructor(dataSource: DataSource) {
    super(SecurityGroupEntity, dataSource);
  }
}
