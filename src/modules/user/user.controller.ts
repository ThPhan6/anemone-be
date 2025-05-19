import { BaseController } from 'core/controllers/base.controller';
import { ApiController } from 'core/decorator/apiController.decorator';
import { AdminRoleGuard } from 'core/decorator/auth.decorator';
import { UserService } from 'modules/user/service/user.service';

@AdminRoleGuard()
@ApiController({
  name: 'users',
})
export class UserController extends BaseController {
  constructor(private readonly service: UserService) {
    super();
  }
}
