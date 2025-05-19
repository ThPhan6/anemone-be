import { Body, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { BaseController } from 'core/controllers/base.controller';
import { ApiController } from 'core/decorator/apiController.decorator';
import { AdminRoleGuard } from 'core/decorator/auth.decorator';
import { UserService } from 'modules/user/service/user.service';

import { CognitoService } from '../auth/cognito.service';
import { CreateUserDto, UpdateUserDto, UserGetListQueries } from './dto/user.request';

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
  async getAllUsers(@Query() query: UserGetListQueries) {
    return this.service.getAllUsers(query);
  }

  @Get('/profile')
  @ApiOperation({ summary: 'Get user profile' })
  async getProfile(@Query('token') token: string) {
    return await this.cognitoService.getProfile(token);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get user details by id' })
  async getUserDetailsById(@Param('id') id: string) {
    return this.service.getUserById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create user' })
  async createUser(
    @Body()
    body: CreateUserDto,
  ) {
    return this.service.createUser(body);
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Update CMS user by id' })
  async updateCmsUserId(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.service.updateCmsUserById(id, body);
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete user by id' })
  async deleteUser(@Param('id') id: string) {
    return this.service.deleteUserById(id);
  }
}
