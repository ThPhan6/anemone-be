import { Injectable } from '@nestjs/common';
import { ActivityLog } from 'common/entities/activity-log.entity';
import { DataSource } from 'typeorm';

import { BaseRepository } from './base.repository';

@Injectable()
export class ActivityLogRepository extends BaseRepository<ActivityLog> {
  constructor(dataSource: DataSource) {
    super(ActivityLog, dataSource);
  }
}
