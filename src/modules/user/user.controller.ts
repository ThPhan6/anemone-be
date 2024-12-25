import { Get } from '@nestjs/common';
import { MessageCode } from 'common/constants/messageCode';
import { ApiNotFoundException } from 'common/types/apiException.type';
import { BaseController } from 'core/controllers/base.controller';
import { ApiController } from 'core/decorator/apiController.decorator';
import { Rbac } from 'core/decorator/auth.decorator';
import { AuthUser } from 'core/decorator/auth-user.decorator';
import { UserDto } from 'modules/auth/dto/auth-user.dto';
import { UserService } from 'modules/user/service/user.service';

import { UserDetailResDto } from './dto/user.response';

@Rbac()
@ApiController({
  name: 'profile',
  isMobile: true,
})
export class UserController extends BaseController {
  constructor(private readonly service: UserService) {
    super();
  }

  @Get()
  async getProfile(@AuthUser() user: UserDto) {
    const userDetail = await this.service.getUserDetailBy({
      cogId: user.username,
    });
    if (!userDetail) {
      throw new ApiNotFoundException(MessageCode.notFound, 'User not found');
    }

    return this.dataType(UserDetailResDto, userDetail);
  }
}
