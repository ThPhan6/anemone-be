import { Body, Post } from '@nestjs/common';
import { MessageCode } from 'common/constants/messageCode';
import { ApiBadRequestException } from 'common/types/apiException.type';
import { BaseController } from 'core/controllers/base.controller';
import { ApiController } from 'core/decorator/apiController.decorator';
import { ApiBaseOkResponse } from 'core/decorator/apiDoc.decorator';
import { UserProfileService } from 'core/services/user-profile.service';
import { UserService } from 'modules/user/service/user.service';
import { UserRole } from 'modules/user/user.type';

import { CognitoService } from './cognito.service';
import {
  ChangePasswordDto,
  RefreshTokenDto,
  ResetPasswordDto,
  SignInDto,
  SignOutDto,
  SignUpDto,
} from './dto/auth.request';
import { AuthChallengeRequiredDto, AuthResponseDto } from './dto/auth.response';

@ApiController({
  name: 'auth',
  isMobile: true,
})
export class AuthController extends BaseController {
  constructor(
    private readonly cognitoService: CognitoService,
    private readonly userService: UserService,
    private readonly userProfileService: UserProfileService,
  ) {
    super();
  }

  @ApiBaseOkResponse({
    description: 'Sign in user',
    type: SignInDto,
  })
  @Post('sign-in')
  async signIn(@Body() body: SignInDto) {
    // Check user is exist
    const userExisted = await this.userService.getUserDetailByEmail(body.email);
    if (!userExisted) {
      throw new ApiBadRequestException(MessageCode.badRequest, 'Invalid email or password');
    }

    if (!userExisted.isActive) {
      throw new ApiBadRequestException(MessageCode.badRequest, 'User is not active');
    }

    const result = await this.cognitoService.signIn(body.email, body.password);
    if (result.ChallengeName) {
      return this.dataType(AuthChallengeRequiredDto, result);
    }

    if (!result.AuthenticationResult) {
      throw new ApiBadRequestException(MessageCode.badRequest, 'Invalid email or password');
    }

    return this.dataType(AuthResponseDto, result.AuthenticationResult);
  }

  @ApiBaseOkResponse({
    description: 'Sign up',
    type: SignInDto,
  })
  @Post('sign-up')
  async signUp(@Body() body: SignUpDto) {
    const newBody = Object.assign(body, {
      role: UserRole.MEMBER,
    });
    const result = await this.cognitoService.createUser(newBody);
    if (!result.User) {
      throw new ApiBadRequestException(
        MessageCode.badRequest,
        'Something went wrong while creating user',
      );
    }

    const user = await this.userService.create({
      ...body,
      cogId: result.User.Username,
      isActive: true,
    });
    if (!user) {
      throw new ApiBadRequestException(
        MessageCode.badRequest,
        'Something went wrong while creating user',
      );
    }

    await this.userProfileService.create({
      user: user,
      name: body.name,
    });

    return this.ok();
  }

  @ApiBaseOkResponse({
    description: 'Change password',
    type: ChangePasswordDto,
  })
  @Post('change-password')
  async changePassword(@Body() body: ChangePasswordDto) {
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
    description: 'Sign out',
  })
  @Post('sign-out')
  async signOut(@Body() body: SignOutDto) {
    const error = await this.cognitoService.signOut(body);

    if (!error) {
      return this.ok();
    }

    throw new ApiBadRequestException(MessageCode.badRequest, error.message);
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
