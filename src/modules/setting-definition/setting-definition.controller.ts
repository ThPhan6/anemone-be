import { Body, Get, Post, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { BaseController } from '../../core/controllers/base.controller';
import { ApiController } from '../../core/decorator/apiController.decorator';
import { AuthUser } from '../../core/decorator/auth-user.decorator';
import { UserDto } from '../auth/dto/auth-user.dto';
import { QuestionnaireCreateDto } from './dto/questionnaire-answer.dto';
import { SettingDefinitionService } from './setting-definition.service';
// @MemberRoleGuard()
// @AdminRoleGuard()
@ApiController({
  name: 'setting-definitions',
})
export class SettingDefinitionController extends BaseController {
  constructor(private readonly settingDefinitionService: SettingDefinitionService) {
    super();
  }

  @Get('/')
  @ApiOperation({ summary: 'Get all setting definitions' })
  async get(@Query('type') type: string[]) {
    const settings = await this.settingDefinitionService.get(type);

    return settings;
  }

  @Get('scent-tag')
  @ApiOperation({ summary: 'Get all scent tags' })
  async getScentTags() {
    const scentTags = await this.settingDefinitionService.getScentTags();

    return scentTags;
  }

  @Get('/questionnaire/result')
  async getQuestionnaireResultByUserId(@AuthUser() user: UserDto) {
    const questionnaireAnswers = await this.settingDefinitionService.getQuestionnaireResultByUserId(
      user.sub,
    );

    return questionnaireAnswers;
  }

  @Post('/questionnaire')
  async createQuestionnaireAnswer(@AuthUser() user: UserDto, @Body() body: QuestionnaireCreateDto) {
    const { answers } = body;
    const questionnaireAnswer = await this.settingDefinitionService.createQuestionnaireAnswer(
      user.sub,
      answers,
    );

    return questionnaireAnswer;
  }
}
