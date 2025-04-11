import { BaseController } from 'core/controllers/base.controller';
import { ApiController } from 'core/decorator/apiController.decorator';
import { UserService } from 'modules/user/service/user.service';

import { RolesGuard } from '../../core/decorator/auth.decorator';

@ApiController({
  name: 'profile',
})
@RolesGuard()
export class UserController extends BaseController {
  constructor(private readonly service: UserService) {
    super();
  }

  // @Get()
  // async getProfile(@AuthUser() user: UserDto) {
  //   const userDetail = await this.service.getUserDetailBy({
  //     cogId: user.username,
  //   });
  //   if (!userDetail) {
  //     throw new ApiNotFoundException(MessageCode.notFound, 'User not found');
  //   }
  //   return this.dataType(UserDetailResDto, userDetail);
  // }
}
