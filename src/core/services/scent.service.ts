import { Injectable } from '@nestjs/common';
import { Scent } from 'common/entities/scent.entity';
import { ScentRepository } from 'common/repositories/scent.repository';

import { BaseService } from './base.service';

@Injectable()
export class ScentService extends BaseService<Scent> {
  constructor(repo: ScentRepository) {
    super(repo);
  }
}
