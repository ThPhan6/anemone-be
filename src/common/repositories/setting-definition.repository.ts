import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { SettingDefinition } from '../../modules/setting-definition/entities/setting-definition.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class SettingDefinitionRepository extends BaseRepository<SettingDefinition> {
  constructor(dataSource: DataSource) {
    super(SettingDefinition, dataSource);
  }
}
