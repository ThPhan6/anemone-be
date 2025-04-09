import { Body, Get, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { BaseController } from '../../core/controllers/base.controller';
import { ApiController } from '../../core/decorator/apiController.decorator';
import { MemberRoleGuard } from '../../core/decorator/auth.decorator';
import { AuthUser } from '../../core/decorator/auth-user.decorator';
import { UserDto } from '../auth/dto/auth-user.dto';
import { CategoryService } from './category.service';
import { QuestionnaireAnswerDto } from './dto/questionnaire-answer.dto';
@MemberRoleGuard()
@ApiController({
  name: 'categories',
})
export class CategoryController extends BaseController {
  constructor(private readonly categoryService: CategoryService) {
    super();
  }

  @Get('/questionnaire')
  async getQuestionnaires() {
    const questionnaires = await this.categoryService.getQuestionnaires();

    return questionnaires;
  }

  @Get('scent-tag')
  @ApiOperation({ summary: 'Get all scent tags' })
  async getScentTags() {
    const scentTags = await this.categoryService.getScentTags();

    return scentTags;
  }

  @Get('/questionnaire/result')
  async getQuestionnaireResultByUserId(@AuthUser() user: UserDto) {
    const questionnaireAnswers = await this.categoryService.getQuestionnaireResultByUserId(
      user.sub,
    );

    return questionnaireAnswers;
  }

  @Post('/questionnaire')
  async createQuestionnaireAnswer(
    @AuthUser() user: UserDto,
    @Body() bodyRequest: QuestionnaireAnswerDto,
  ) {
    const { answers } = bodyRequest;

    const questionnaireAnswer = await this.categoryService.createQuestionnaireAnswer(
      user.sub,
      answers,
    );

    return questionnaireAnswer;
  }
}
