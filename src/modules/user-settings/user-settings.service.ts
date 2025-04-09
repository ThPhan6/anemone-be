import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserSetting } from '../../common/entities/user-setting.entity';
import { UpdateVisibilityDto } from './dto/update-visibility.dto';

@Injectable()
export class UserSettingsService {
  constructor(
    @InjectRepository(UserSetting)
    private readonly userSettingsRepository: Repository<UserSetting>,
  ) {}

  async updateVisibility(userId: string, dto: UpdateVisibilityDto) {
    const found = await this.userSettingsRepository.findOne({ where: { userId } });

    if (found) {
      found.isPublic = dto.isPublic;

      await this.userSettingsRepository.update(found.id, {
        isPublic: dto.isPublic,
      });

      return true;
    } else {
      const newUserSetting = new UserSetting();

      newUserSetting.userId = userId;

      newUserSetting.isPublic = dto.isPublic;

      await this.userSettingsRepository.save(newUserSetting);

      return true;
    }
  }
}
