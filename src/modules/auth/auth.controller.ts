import { Body, Post } from '@nestjs/common';
import { MessageCode } from 'common/constants/messageCode';
import { ApiBadRequestException } from 'common/types/apiException.type';
import { BaseController } from 'core/controllers/base.controller';
import { ApiController } from 'core/decorator/apiController.decorator';
import { ApiBaseOkResponse } from 'core/decorator/apiDoc.decorator';
import { UserService } from 'modules/user/service/user.service';

import { logger } from '../../core/logger/index.logger';
import { UserRole } from '../user/entities/user.entity';
import { CognitoService } from './cognito.service';
import {
  ChangePasswordDto,
  RefreshTokenDto,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
} from './dto/auth.request';
import { AuthResponseDto } from './dto/auth.response';

@ApiController({
  name: 'auth',
})
export class AuthController extends BaseController {
  constructor(
    private readonly cognitoService: CognitoService,
    private readonly userService: UserService,
  ) {
    super();
  }

  private handleCognitoError(error: any) {
    logger.error(`handleCognitoError: ${JSON.stringify(error, null, 2)}`);
    throw new ApiBadRequestException(
      MessageCode.badRequest,
      error.message || 'Something went wrong while creating user',
    );
  }

  @ApiBaseOkResponse({
    description: 'Sign in user',
    type: SignInDto,
  })
  @Post('login')
  async login(@Body() body: SignInDto) {
    const isVerified = await this.cognitoService.isUserEmailVerified(body.email, true);
    if (!isVerified) {
      throw new ApiBadRequestException(MessageCode.badRequest, 'User is not verified');
    }

    try {
      const clientType = body.clientType || 'cms'; // default to CMS

      const result = await this.cognitoService.signIn(body.email, body.password, clientType);

      return this.dataType(AuthResponseDto, result);
    } catch (error) {
      this.handleCognitoError(error);
    }
  }

  @ApiBaseOkResponse({
    description: 'Register Mobile App User',
    type: SignInDto,
  })
  @Post('register')
  async register(@Body() body: SignUpDto) {
    const newBody = Object.assign(body, {
      role: UserRole.MEMBER,
      firstName: body.firstName,
      lastName: body.lastName,
    });
    try {
      const result = await this.cognitoService.register(newBody);

      logger.info(`result: ${JSON.stringify(result, null, 2)}`);

      if (!result.UserSub) {
        throw new ApiBadRequestException(
          MessageCode.badRequest,
          'Something went wrong while creating user',
        );
      }

      return this.ok();
    } catch (error) {
      this.handleCognitoError(error);
    }
  }

  @ApiBaseOkResponse({
    description: 'Change password',
    type: ChangePasswordDto,
  })
  @Post('forgot-password')
  async forgotPassword(@Body() body: ChangePasswordDto) {
    await this.cognitoService.respondToNewPasswordChallenge(
      body.email,
      body.password,
      body.session,
    );

    return this.ok();
  }

  @ApiBaseOkResponse({
    description: 'Reset password',
    type: ResetPasswordDto,
  })
  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    const result = await this.cognitoService.resetPassword(body.email);

    if (!result.CodeDeliveryDetails) {
      throw new ApiBadRequestException(MessageCode.badRequest, 'Invalid email');
    }

    return this.ok();
  }

  @ApiBaseOkResponse({
    description: 'Refresh token',
    type: RefreshTokenDto,
  })
  @Post('refresh-token')
  async refreshToken(@Body() body: RefreshTokenDto) {
    const result = await this.cognitoService.refreshToken(body.refreshToken, body.email);

    if (!result.AuthenticationResult) {
      throw new ApiBadRequestException(MessageCode.badRequest, 'Invalid refresh token');
    }

    return this.dataType(AuthResponseDto, result.AuthenticationResult);
  }
}
