import { Injectable } from '@nestjs/common';
import { UsageHistory } from 'common/entities/usage-history.entity';
import { DataSource } from 'typeorm';

import { BaseRepository } from './base.repository';

@Injectable()
export class UsageHistoryRepository extends BaseRepository<UsageHistory> {
  constructor(dataSource: DataSource) {
    super(UsageHistory, dataSource);
  }
}
