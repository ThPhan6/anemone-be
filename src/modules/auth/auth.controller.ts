import { Body, Delete, Post, Put, Request } from '@nestjs/common';
import { MessageCode } from 'common/constants/messageCode';
import { IDataSign } from 'common/types/dataSign.type';
import { BaseController } from 'core/controllers/base.controller';
import { ApiController } from 'core/decorator/apiController.decorator';
import { ApiBaseOkResponse } from 'core/decorator/apiDoc.decorator';
import { AuthRequired } from 'core/decorator/authRequired.decorator';

import { AuthService } from './auth.service';
import { ChangePasswordReqDto, ForgotPasswordReqDto, LoginReqDto, ResetPasswordReqDto } from './dto/auth.request';
import { LoginResDto } from './dto/auth.response';

@ApiController({
  name: 'Auth',
})
export class AuthController extends BaseController {
  constructor(private readonly authService: AuthService) {
    super();
  }

  @ApiBaseOkResponse({
    description: 'Login',
    type: LoginResDto,
    messageCodeRemark: `
      ${MessageCode.wrongMailOrPassword}
      ${MessageCode.userIsDisabled}
    `,
  })
  @Post('login')
  async login(@Body() body: LoginReqDto) {
    return await this.authService.login(body.mailAddress, body.password);
  }

  @ApiBaseOkResponse({
    description: 'Request an email provides reset password link',
  })
  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordReqDto) {
    await this.authService.forgotPassword(body.mailAddress);

    return this.ok(true);
  }

  @ApiBaseOkResponse({
    description: 'Update password by forgot password token',
    messageCodeRemark: `
      ${MessageCode.invalidResetPasswordCode}
    `,
  })
  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordReqDto) {
    await this.authService.resetPassword(body.code, body.password);

    return this.ok(true);
  }

  @AuthRequired()
  @ApiBaseOkResponse({
    description: 'Update password for current user',
    messageCodeRemark: `
      ${MessageCode.wrongPassword}
    `,
  })
  @Put('change-password')
  async changePassword(@Request() { user }: { user: IDataSign }, @Body() body: ChangePasswordReqDto) {
    await this.authService.changePassword(user.userId, body.password, body.newPassword);

    return this.ok(true);
  }

  @AuthRequired()
  @ApiBaseOkResponse({
    description: 'Logout',
  })
  @Delete('logout')
  async logout() {
    return await this.authService.logout();
  }
}
