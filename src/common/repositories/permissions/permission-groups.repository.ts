import { Injectable } from '@nestjs/common';
import { PermissionGroupEntity } from 'common/entities/permissions/permission-groups.entity';
import { DataSource } from 'typeorm';

import { BaseRepository } from '../base.repository';

@Injectable()
export class PermissionGroupRepository extends BaseRepository<PermissionGroupEntity> {
  constructor(dataSource: DataSource) {
    super(PermissionGroupEntity, dataSource);
  }
}
