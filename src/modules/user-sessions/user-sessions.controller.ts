import { Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { User } from '@sentry/nestjs';

import { BaseController } from '../../core/controllers/base.controller';
import { ApiController } from '../../core/decorator/apiController.decorator';
import { MemberRoleGuard } from '../../core/decorator/auth.decorator';
import { AuthUser } from '../../core/decorator/auth-user.decorator';
import { UserSessionsService } from './user-sessions.service';

@MemberRoleGuard()
@ApiController({
  name: 'user-sessions',
})
export class UserSessionsController extends BaseController {
  constructor(private readonly userSessionsService: UserSessionsService) {
    super();
  }

  @Get()
  @ApiOperation({
    summary:
      'Get the current information about the album device, playlist, and scent the user is playing.',
  })
  async getUserSession(@AuthUser() user: User) {
    return this.userSessionsService.getUserSession(user.sub);
  }
}
