import { Injectable } from '@nestjs/common';
import { PermissionEntity } from 'common/entities/permissions/permissions.entity';
import { DataSource } from 'typeorm';

import { BaseRepository } from '../base.repository';

@Injectable()
export class PermissionRepository extends BaseRepository<PermissionEntity> {
  constructor(dataSource: DataSource) {
    super(PermissionEntity, dataSource);
  }
}
