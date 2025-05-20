import { Body, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { BaseController } from 'core/controllers/base.controller';
import { ApiController } from 'core/decorator/apiController.decorator';
import { AdminRoleGuard } from 'core/decorator/auth.decorator';
import { UserService } from 'modules/user/service/user.service';

import { CognitoService } from '../auth/cognito.service';
import { CreateUserDto, UpdateUserDto, UserGetListQueries } from './dto/user.request';
import { UserType } from './entities/user.entity';

@AdminRoleGuard()
@ApiController({
  name: 'users',
  admin: true,
})
export class UserAdminController extends BaseController {
  constructor(
    private readonly service: UserService,
    private readonly cognitoService: CognitoService,
  ) {
    super();
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({
    name: 'type',
    enum: UserType,
    type: 'enum',
    required: true,
    description: '1: CMS, 2: APP',
  })
  getAllUsers(@Query() query: UserGetListQueries) {
    return this.service.getAllUsers(query);
  }

  @Get('/profile')
  @ApiOperation({ summary: 'Get user profile' })
  getProfile(@Query('token') token: string) {
    return this.cognitoService.getProfile(token);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get user details by id' })
  getUserDetailsById(@Param('id') id: string) {
    return this.service.getUserById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create user' })
  createUser(
    @Body()
    body: CreateUserDto,
  ) {
    return this.service.createUser(body);
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Update CMS user by id' })
  updateCmsUserId(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.service.updateCmsUserById(id, body);
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete user by id' })
  deleteUser(@Param('id') id: string) {
    return this.service.deleteUserById(id);
  }

  @Get('/:id/enabled')
  @ApiOperation({ summary: 'Enable mobile user by id' })
  blockUser(@Param('id') id: string) {
    return this.service.blockUserById(id);
  }
}
