import { Injectable } from '@nestjs/common';
import { Setting } from 'common/entities/setting.entity';
import { SettingRepository } from 'common/repositories/setting.repository';

import { BaseService } from './base.service';

@Injectable()
export class SettingService extends BaseService<Setting> {
  constructor(repo: SettingRepository) {
    super(repo);
  }
}
