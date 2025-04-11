import { Body, Get, Put, Query } from '@nestjs/common';
import { MessageCode } from 'common/constants/messageCode';
import { ApiBadRequestException, ApiNotFoundException } from 'common/types/apiException.type';
import { BaseController } from 'core/controllers/base.controller';
import { ApiController } from 'core/decorator/apiController.decorator';
import { RolesGuard } from 'core/decorator/auth.decorator';
import { AuthUser } from 'core/decorator/auth-user.decorator';
import { UserDto } from 'modules/auth/dto/auth-user.dto';
import { UserService } from 'modules/user/service/user.service';

import { UserProfileService } from '../../core/services/user-profile.service';
import { CognitoService } from '../auth/cognito.service';
import { UpdateProfileDto } from './dto/user.request';
import { UserDetailResDto } from './dto/user.response';

@RolesGuard()
@ApiController({
  name: 'profile',
})
export class UserCMSController extends BaseController {
  constructor(
    private readonly service: UserService,
    private readonly cognitoService: CognitoService,
    private readonly profileService: UserProfileService,
  ) {
    super();
  }

  @Get()
  async getProfile(@Query('token') token: string) {
    const user = await this.cognitoService.getProfile(token);

    return user;
  }

  @Put()
  async updateProfile(@AuthUser() user: UserDto, @Body() body: UpdateProfileDto) {
    const userDetail = await this.service.getUserDetailBy({
      cogId: user.username,
    });
    if (!userDetail) {
      throw new ApiNotFoundException(MessageCode.notFound, 'User not found');
    }

    const result = await this.cognitoService.updateUser({
      email: userDetail.email,
      firstName: body.firstName,
      lastName: body.lastName,
      role: userDetail.role,
    });

    if (!result) {
      throw new ApiBadRequestException(MessageCode.badRequest, 'Update user failed');
    }

    await this.profileService.updateByUserId(userDetail.id, {
      firstName: body.firstName,
      lastName: body.lastName,
    });

    return this.dataType(UserDetailResDto, this.service.getUserDetailBy({ cogId: user.username }));
  }
}
