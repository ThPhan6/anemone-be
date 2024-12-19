import { Get } from '@nestjs/common';
import { MessageCode } from 'common/constants/messageCode';
import { ApiNotFoundException } from 'common/types/apiException.type';
import { BaseController } from 'core/controllers/base.controller';
import { ApiController } from 'core/decorator/apiController.decorator';
import { UserService } from 'core/services/user.service';
import { Rbac } from 'modules/auth/auth.decorator';
import { AuthUser } from 'modules/auth/auth-user.decorator';
import { UserDto } from 'modules/auth/auth-user.dto';

import { UserDetailResDto } from './dto/user.response';

@Rbac()
@ApiController({
  name: 'user-profile',
})
export class UserProfileController extends BaseController {
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
