import { Get, Query } from '@nestjs/common';
import { BaseController } from 'core/controllers/base.controller';
import { ApiController } from 'core/decorator/apiController.decorator';
import { RolesGuard } from 'core/decorator/auth.decorator';
import { UserService } from 'modules/user/service/user.service';

import { CognitoService } from '../auth/cognito.service';

@RolesGuard()
@ApiController({
  name: 'profile',
})
export class UserCMSController extends BaseController {
  constructor(
    private readonly service: UserService,
    private readonly cognitoService: CognitoService,
  ) {
    super();
  }

  @Get()
  async getProfile(@Query('token') token: string) {
    const user = await this.cognitoService.getProfile(token);

    return user;
  }
}
