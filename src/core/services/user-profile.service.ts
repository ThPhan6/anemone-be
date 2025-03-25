import { Injectable } from '@nestjs/common';
import { UserProfile } from 'common/entities/user-profile.entity';
import { UserProfileRepository } from 'common/repositories/user-profile.repository';

import { BaseService } from './base.service';

@Injectable()
export class UserProfileService extends BaseService<UserProfile> {
  constructor(repo: UserProfileRepository) {
    super(repo);
  }

  updateByUserId(userId: string, data: Partial<UserProfile>) {
    return this.repository.update(
      {
        userId,
      },
      data,
    );
  }
}
