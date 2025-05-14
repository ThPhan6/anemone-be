import { Body, Post } from '@nestjs/common';
import { ApiOperation, ApiProperty } from '@nestjs/swagger';
import { User } from '@sentry/nestjs';

import { BaseController } from '../../core/controllers/base.controller';
import { ApiController } from '../../core/decorator/apiController.decorator';
import { MemberRoleGuard } from '../../core/decorator/auth.decorator';
import { AuthUser } from '../../core/decorator/auth-user.decorator';
import { MockService } from './mock.service';

class MockDeviceRequestDto {
  @ApiProperty({
    example: 'Device 01',
  })
  name: string;
}

@MemberRoleGuard()
@ApiController({
  name: 'mock',
})
export class MockController extends BaseController {
  constructor(private readonly mockService: MockService) {
    super();
  }

  @Post('devices')
  @ApiOperation({ summary: 'Create mock devices' })
  createDevice(@AuthUser() user: User, @Body() body: MockDeviceRequestDto) {
    return this.mockService.mockDeviceWithCartridges(user.sub, body.name);
  }
}
