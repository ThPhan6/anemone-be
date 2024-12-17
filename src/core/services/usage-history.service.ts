import { Injectable } from '@nestjs/common';
import { UsageHistory } from 'common/entities/usage-history.entity';
import { UsageHistoryRepository } from 'common/repositories/usage-history.repository';

import { BaseService } from './base.service';

@Injectable()
export class UsageHistoryService extends BaseService<UsageHistory> {
  constructor(repo: UsageHistoryRepository) {
    super(repo);
  }
}
