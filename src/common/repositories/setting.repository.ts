import { Injectable } from '@nestjs/common';
import { Setting } from 'common/entities/setting.entity';
import { DataSource } from 'typeorm';

import { BaseRepository } from './base.repository';

@Injectable()
export class SettingRepository extends BaseRepository<Setting> {
  constructor(dataSource: DataSource) {
    super(Setting, dataSource);
  }
}
