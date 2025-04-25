import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { MESSAGE } from '../../common/constants/message.constant';
import { UserSetting } from '../../common/entities/user-setting.entity';
import { transformImageUrls } from '../../common/utils/helper';
import { QuestionnaireAnswerItem } from './dto/questionnaire-answer.dto';
import { SettingWithAnswersDto } from './dto/questionnaire-with-answers.dto';
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

  async get(type: string[]): Promise<SettingWithAnswersDto[]> {
    // Get all questions that match the specified types
    const questions = await this.settingDefinitionRepository.find({
      where: {
        type: In(type),
      },
    });

    // Get all answers related to these questions
    const answers = await this.settingValueRepository.find({
      where: {
        settingDefinition: In(questions.map((question) => question.id)),
      },
      relations: ['settingDefinition'],
    });

    // Map questions to include their answers
    const result: SettingWithAnswersDto[] = questions.map((question) => {
      // Find all answers that belong to this question
      const questionAnswers = answers.filter(
        (answer) => answer.settingDefinition.id === question.id,
      );

      // Return the question with its answers
      return {
        id: question.id,
        name: question.name,
        metadata: question.metadata,
        answers: questionAnswers.map((answer) => ({
          id: answer.id,
          value: answer.value,
          metadata: answer.metadata,
        })),
      };
    });

    // Transform all image URLs in the result and return as the proper type
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
