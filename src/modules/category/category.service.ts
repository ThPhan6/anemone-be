import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { MESSAGE } from '../../common/constants/message.constant';
import { Category } from '../../common/entities/category.entity';
import { SystemSetting } from '../../common/entities/system-setting.entity';
import { UserSetting } from '../../common/entities/user-setting.entity';
import { CategoryType } from '../../common/enum/category.enum';
import { QuestionnaireAnswerItem } from './dto/questionnaire-answer.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(SystemSetting)
    private systemSettingRepository: Repository<SystemSetting>,
    @InjectRepository(UserSetting)
    private userSettingRepository: Repository<UserSetting>,
  ) {}

  async getQuestionnaires() {
    const questionnaires = await this.categoryRepository.find({
      where: {
        type: CategoryType.Questionnaire,
      },
    });

    const categoryIds = questionnaires.map((questionnaire) => questionnaire.id);

    const systemSettings = await this.systemSettingRepository.find({
      where: {
        category: In(categoryIds),
      },
      relations: ['category'],
    });

    const questionnaire = questionnaires.map((questionnaire) => {
      const systemSetting = systemSettings.find(
        (systemSetting) => systemSetting.category.id === questionnaire.id,
      );

      return {
        id: questionnaire.id,
        question: questionnaire.name,
        answers: systemSetting.name.split('//'),
      };
    });

    return questionnaire;
  }

  async createQuestionnaireAnswer(userId: string, answers: QuestionnaireAnswerItem[]) {
    // Check all questions before saving to database
    for (const el of answers) {
      const question = await this.categoryRepository.findOne({
        where: {
          id: el.questionId,
        },
      });

      // If a question does not exist, throw an error immediately
      if (!question) {
        throw new HttpException(MESSAGE.CATEGORY.NOT_FOUND_QUESTION, HttpStatus.NOT_FOUND);
      }
    }

    // If all questions are valid, save data to database
    const answer = await this.userSettingRepository.create({
      userId,
      system: answers,
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
      throw new HttpException(MESSAGE.CATEGORY.NOT_FOUND_USER_SETTING, HttpStatus.NOT_FOUND);
    }

    const answers = userSetting.system;

    const categories = await this.categoryRepository.find({
      where: {
        type: CategoryType.Questionnaire,
      },
    });

    const result = categories.map((category) => {
      const answer = answers.find((answer) => answer.questionId === category.id);

      return {
        id: category.id,
        question: category.name,
        answer: answer.answer,
      };
    });

    return result;
  }
}
