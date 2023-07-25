import { Injectable } from '@nestjs/common';
import { PermissionSecurityGroupEntity } from 'common/entities/permissions/permission-security-group.entity';
import { DataSource } from 'typeorm';

import { BaseRepository } from '../base.repository';

@Injectable()
export class PermissionSecurityGroupRepository extends BaseRepository<PermissionSecurityGroupEntity> {
  constructor(dataSource: DataSource) {
    super(PermissionSecurityGroupEntity, dataSource);
  }
}
