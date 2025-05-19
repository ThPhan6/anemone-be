import { Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { BaseController } from 'core/controllers/base.controller';
import { ApiController } from 'core/decorator/apiController.decorator';
import { MemberRoleGuard } from 'core/decorator/auth.decorator';
import { UserService } from 'modules/user/service/user.service';

import { AuthUser } from '../../core/decorator/auth-user.decorator';
import { UserDto } from './dto/user.dto';

@MemberRoleGuard()
@ApiController({
  name: 'users',
})
export class UserController extends BaseController {
  constructor(private readonly service: UserService) {
    super();
  }

  @Get('/me')
  @ApiOperation({ summary: 'Get mobile user profile' })
  getMe(@AuthUser() user: UserDto) {
    return this.service.getMobileProfile(user);
  }
}
