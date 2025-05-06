import { Body, Patch, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { BaseController } from '../../core/controllers/base.controller';
import { ApiController } from '../../core/decorator/apiController.decorator';
import { MemberRoleGuard } from '../../core/decorator/auth.decorator';
import { AuthUser } from '../../core/decorator/auth-user.decorator';
import { UserDto } from '../auth/dto/auth-user.dto';
import { QuestionnaireCreateDto } from './dto/questionnaire.dto';
import { UpdateUserSettingsDto } from './dto/update-visibility.dto';
import { UserSettingsService } from './user-settings.service';

@MemberRoleGuard()
@ApiController({
  name: 'user-settings',
})
export class UserSettingsController extends BaseController {
  constructor(private readonly userSettingsService: UserSettingsService) {
    super();
  }

  @Patch()
  @ApiOperation({ summary: 'Partially update user settings data' })
  async update(@AuthUser() user: UserDto, @Body() body: UpdateUserSettingsDto) {
    return this.userSettingsService.update(user.sub, body);
  }

  @Post('/questionnaire')
  async createQuestionnaireAnswer(@AuthUser() user: UserDto, @Body() body: QuestionnaireCreateDto) {
    const { answers } = body;
    const questionnaireAnswer = await this.userSettingsService.createQuestionnaireAnswer(
      user.sub,
      answers,
    );

    return questionnaireAnswer;
  }
}
