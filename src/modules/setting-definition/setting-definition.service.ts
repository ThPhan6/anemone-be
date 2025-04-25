import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { omit } from 'lodash';
import { In, Repository } from 'typeorm';

import { MESSAGE } from '../../common/constants/message.constant';
import { UserSetting } from '../../common/entities/user-setting.entity';
import { transformImageUrls } from '../../common/utils/helper';
import { QuestionnaireAnswerItem } from './dto/questionnaire-answer.dto';
import { SettingDefinitionResDto } from './dto/questionnaire-with-answers.dto';
import { ESystemDefinitionType, SettingDefinition } from './entities/setting-definition.entity';
import { SettingValue } from './entities/setting-value.entity';

@Injectable()
export class SettingDefinitionService {
  constructor(
    @InjectRepository(SettingDefinition)
    private settingDefinitionRepository: Repository<SettingDefinition>,
    @InjectRepository(SettingValue)
    private settingValueRepository: Repository<SettingValue>,
    @InjectRepository(UserSetting)
    private userSettingRepository: Repository<UserSetting>,
  ) {}

  async get(type: string[]): Promise<SettingDefinitionResDto[]> {
    const settings = await this.settingDefinitionRepository.find({
      where: {
        type: In(type),
      },
    });

    const values = await this.settingValueRepository.find({
      where: {
        settingDefinition: In(settings.map((setting) => setting.id)),
      },
      relations: ['settingDefinition'],
    });

    const result = settings.map((question) => {
      const data = values.filter((value) => value.settingDefinition.id === question.id);

      return {
        ...omit(question, ['deletedAt', 'values', 'type']),
        settingDefinition: data.map((item) => omit(item, ['deletedAt', 'settingDefinition'])),
      };
    });

    return transformImageUrls(result);
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

    // If all questions are valid, save data to database
    const answer = await this.userSettingRepository.create({
      userId,
      system: body,
    });

    await this.userSettingRepository.save(answer);

    return answer;
  }

  async getQuestionnaireResultByUserId(userId: string) {
    const userSetting = await this.userSettingRepository.findOne({
      where: {
        userId,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    if (!userSetting) {
      throw new HttpException(MESSAGE.SYSTEM_SETTINGS.NOT_FOUND_USER_SETTING, HttpStatus.NOT_FOUND);
    }

    const answers = userSetting.system;

    const settings = await this.settingDefinitionRepository.find({
      where: {
        type: ESystemDefinitionType.QUESTIONNAIRE,
      },
    });

    const result = settings.map((setting) => {
      const answer = answers.find((answer) => answer.questionId === setting.id);

      return {
        id: setting.id,
        question: setting.name,
        answers: answer?.answers ?? [],
      };
    });

    return result;
  }

  async getScentTags() {
    const scentTags = await this.settingDefinitionRepository.find({
      where: {
        type: ESystemDefinitionType.SCENT_TAG,
      },
    });

    return scentTags.map((scentTag) => ({
      id: scentTag.id,
      name: scentTag.name,
    }));
  }
}
