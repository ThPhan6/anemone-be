import { Injectable } from '@nestjs/common';
import { SendgridEntity } from 'common/entities/sendgrid.entity';
import { DataSource } from 'typeorm';

import { BaseRepository } from './base.repository';

@Injectable()
export class SendgridRepository extends BaseRepository<SendgridEntity> {
  constructor(dataSource: DataSource) {
    super(SendgridEntity, dataSource);
  }
}
