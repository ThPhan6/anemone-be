import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { MESSAGE } from '../../common/constants/message.constant';
import { UserSetting } from '../../common/entities/user-setting.entity';
import { QuestionnaireAnswerItem } from './dto/questionnaire-answer.dto';
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

  async get(type: string[]) {
    const settings = await this.settingDefinitionRepository.find({
      where: {
        type: In(type),
      },
    });

    const settingIds = settings.map((setting) => setting.id);

    const settingValues = await this.settingValueRepository.find({
      where: {
        settingDefinition: In(settingIds),
      },
      relations: ['settingDefinition'],
    });

    const result = settings.map((setting) => {
      const settingValue = settingValues.find((value) => value.settingDefinition.id === setting.id);

      return {
        id: setting.id,
        name: setting.name,
        answers: settingValue?.value?.split('//') ?? [],
      };
    });

    return result;
  }

  async getQuestionnaires() {
    const questionnaires = await this.settingDefinitionRepository.find({
      where: {
        type: ESystemDefinitionType.QUESTIONNAIRE,
      },
    });

    const settingIds = questionnaires.map((questionnaire) => questionnaire.id);

    const settingValues = await this.settingValueRepository.find({
      where: {
        settingDefinition: In(settingIds),
      },
      relations: ['settingDefinition'],
    });

    const questionnaire = questionnaires.map((questionnaire) => {
      const settingValue = settingValues.find(
        (value) => value.settingDefinition.id === questionnaire.id,
      );

      return {
        id: questionnaire.id,
        question: questionnaire.name,
        answers: settingValue?.value?.split('//') ?? [],
      };
    });

    return questionnaire;
  }

  async createQuestionnaireAnswer(userId: string, bodyRequest: QuestionnaireAnswerItem[]) {
    // Check all questions before saving to database
    for (const el of bodyRequest) {
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
      system: bodyRequest,
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
