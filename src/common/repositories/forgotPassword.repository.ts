import { Injectable } from '@nestjs/common';
import { ForgotPasswordEntity } from 'common/entities/forgotPassword.entity';
import { DataSource } from 'typeorm';

import { BaseRepository } from './base.repository';

@Injectable()
export class ForgotPasswordRepository extends BaseRepository<ForgotPasswordEntity> {
  constructor(dataSource: DataSource) {
    super(ForgotPasswordEntity, dataSource);
  }
}
