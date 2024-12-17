import { Injectable } from '@nestjs/common';
import { Scent } from 'common/entities/scent.entity';
import { DataSource } from 'typeorm';

import { BaseRepository } from './base.repository';

@Injectable()
export class ScentRepository extends BaseRepository<Scent> {
  constructor(dataSource: DataSource) {
    super(Scent, dataSource);
  }
}
