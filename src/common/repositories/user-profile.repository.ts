import { Injectable } from '@nestjs/common';
import { UserProfile } from 'common/entities/user-profile.entity';
import { DataSource } from 'typeorm';

import { BaseRepository } from './base.repository';

@Injectable()
export class UserProfileRepository extends BaseRepository<UserProfile> {
  constructor(dataSource: DataSource) {
    super(UserProfile, dataSource);
  }
}
