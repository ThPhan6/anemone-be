import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MESSAGE } from '../../common/constants/message.constant';
import { UserSetting } from '../../common/entities/user-setting.entity';
import { SettingDefinition } from '../system/entities/setting-definition.entity';
import { QuestionnaireAnswerItem } from './dto/questionnaire.dto';
import { UpdateUserSettingsDto } from './dto/update-visibility.dto';

@Injectable()
export class UserSettingsService {
  constructor(
    @InjectRepository(UserSetting)
    private readonly userSettingsRepository: Repository<UserSetting>,
    @InjectRepository(SettingDefinition)
    private readonly settingDefinitionRepository: Repository<SettingDefinition>,
  ) {}

  async get(userId: string) {
    const settings = await this.userSettingsRepository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    if (!settings) {
      const defaultSettings = await this.userSettingsRepository.create({ userId });

      return this.userSettingsRepository.save(defaultSettings);
    }

    return settings;
  }

  async update(userId: string, dto: UpdateUserSettingsDto) {
    let settings = await this.userSettingsRepository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    if (!settings) {
      settings = this.userSettingsRepository.create({ userId });
    }

    Object.assign(settings, dto);

    return await this.userSettingsRepository.save(settings);
  }

  async createQuestionnaireAnswer(userId: string, body: QuestionnaireAnswerItem[]) {
    // Check all questions before saving to database
    for (const el of body) {
      if (!Array.isArray(el.answers)) {
        throw new HttpException(MESSAGE.SYSTEM_SETTINGS.INVALID_ANSWER, HttpStatus.BAD_REQUEST);
      }

      const question = await this.settingDefinitionRepository.findOne({
        where: {
          id: el.questionId,
        },
      });

      // If a question does not exist, throw an error immediately
      if (!question) {
        throw new HttpException(MESSAGE.SYSTEM_SETTINGS.NOT_FOUND_QUESTION, HttpStatus.NOT_FOUND);
      }
    }

    let user = await this.userSettingsRepository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    if (!user) {
      // If all questions are valid, save data to database
      user = await this.userSettingsRepository.create({
        userId,
        questionnaire: body,
        onboarded: true,
      });

      await this.userSettingsRepository.save(user);
    } else {
      await this.userSettingsRepository.update(user.id, {
        questionnaire: body,
        onboarded: true,
      });

      user = await this.userSettingsRepository.findOne({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
    }

    return user;
  }
}
