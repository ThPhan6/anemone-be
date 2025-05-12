import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { ScentConfig } from '../../modules/system/entities/scent-config.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class ScentConfigRepository extends BaseRepository<ScentConfig> {
  constructor(dataSource: DataSource) {
    super(ScentConfig, dataSource);
  }
}
