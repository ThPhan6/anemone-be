import { Injectable } from '@nestjs/common';
import { ActivityLog } from 'common/entities/activity-log.entity';
import { ActivityLogRepository } from 'common/repositories/activity-log.repository';

import { BaseService } from './base.service';

@Injectable()
export class ActivityLogService extends BaseService<ActivityLog> {
  constructor(repo: ActivityLogRepository) {
    super(repo);
  }
}
