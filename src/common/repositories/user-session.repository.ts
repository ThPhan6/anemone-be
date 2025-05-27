import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { UserSession } from '../entities/user-session.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class UserSessionRepository extends BaseRepository<UserSession> {
  constructor(dataSource: DataSource) {
    super(UserSession, dataSource);
  }
}
