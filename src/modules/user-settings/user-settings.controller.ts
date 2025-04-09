import { Body, Patch } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { BaseController } from '../../core/controllers/base.controller';
import { ApiController } from '../../core/decorator/apiController.decorator';
import { MemberRoleGuard } from '../../core/decorator/auth.decorator';
import { AuthUser } from '../../core/decorator/auth-user.decorator';
import { UserDto } from '../auth/dto/auth-user.dto';
import { UpdateVisibilityDto } from './dto/update-visibility.dto';
import { UserSettingsService } from './user-settings.service';

@MemberRoleGuard()
@ApiController({
  name: 'user-settings',
})
export class UserSettingsController extends BaseController {
  constructor(private readonly userSettingsService: UserSettingsService) {
    super();
  }
  @Patch('visibility')
  @ApiOperation({ summary: 'User can make their content public or private' })
  async updateVisibility(@AuthUser() user: UserDto, @Body() body: UpdateVisibilityDto) {
    return this.userSettingsService.updateVisibility(user.sub, body);
  }
}
