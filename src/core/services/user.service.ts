import { Injectable } from '@nestjs/common';
import { User } from 'common/entities/user.entity';
import { UserRepository } from 'common/repositories/user.repository';

import { BaseService } from './base.service';

@Injectable()
export class ContainerService extends BaseService<User> {
  constructor(repo: UserRepository) {
    super(repo);
  }
}
