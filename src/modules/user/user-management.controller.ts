import { Body, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { MessageCode } from 'common/constants/messageCode';
import { ApiNotFoundException } from 'common/types/apiException.type';
import { BaseController } from 'core/controllers/base.controller';
import { ApiController } from 'core/decorator/apiController.decorator';
import { ApiBaseOkResponse, ApiDataWrapType } from 'core/decorator/apiDoc.decorator';
import { StaffRoleGuard } from 'core/decorator/auth.decorator';
import { AuthUser } from 'core/decorator/auth-user.decorator';
import { CognitoService } from 'modules/auth/cognito.service';
import { UserDto } from 'modules/auth/dto/auth-user.dto';
import { UserService } from 'modules/user/service/user.service';
import { UserRole } from 'modules/user/user.type';

import { randomPassword } from '../../common/utils/password';
import { logger } from '../../core/logger/index.logger';
import { CreateUserDto, UpdateUserDto, UserGetListQueries } from './dto/user.request';
import {
  UserCreateResDto,
  UserDeleteResDto,
  UserDetailResDto,
  UserListItemDto,
  UserListResDto,
  UserUpdateResDto,
} from './dto/user.response';

@ApiController({
  name: 'users',
})
@StaffRoleGuard()
export class UserManagementController extends BaseController {
  constructor(
    private readonly service: UserService,
    private readonly cognitoService: CognitoService,
  ) {
    super();
  }

  @ApiBaseOkResponse({
    description: 'create a user',
    type: UserCreateResDto,
    messageCodeRemark: `
    ${MessageCode.permissionDenied}
    `,
  })
  @Post()
  async create(@Body() body: CreateUserDto, @AuthUser() authUser: UserDto) {
    if (authUser.role !== UserRole.ADMIN) {
      body.role = UserRole.MEMBER;
    }

    const result = await this.cognitoService.createUser(body);
    if (!result) {
      throw new Error('Create user failed');
    }

    const cogId = result.User.Attributes.find((x) => x.Name === 'sub')?.Value;

    const user = await this.service.create({
      ...body,
      cogId,
    });

    if (!user) {
      throw new Error('Create user failed');
    }

    return this.dataType(UserCreateResDto, user);
  }

  @ApiBaseOkResponse({
    description: 'Get list users',
    type: UserListItemDto,
    wrapType: ApiDataWrapType.pagination,
    messageCodeRemark: `
    ${MessageCode.notFound}
    `,
  })
  @Get()
  async list(@Query() queries: UserGetListQueries, @AuthUser() { isAdmin }: UserDto) {
    return this.dataType(UserListResDto, await this.service.getListUser(queries, isAdmin));
  }

  @ApiBaseOkResponse({
    description: 'Get user detail',
    type: UserDetailResDto,
    messageCodeRemark: `
    ${MessageCode.notFound}
    ${MessageCode.permissionDenied}
    `,
  })
  @Get(':id')
  async detail(@Param('id') id: string, @AuthUser() { isAdmin }: UserDto) {
    return this.dataType(UserDetailResDto, await this.service.getUserDetail(id, isAdmin));
  }

  @ApiBaseOkResponse({
    description: 'update a user',
    type: UserUpdateResDto,
    messageCodeRemark: `
    ${MessageCode.notFound}
    `,
  })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
    @AuthUser() { isAdmin }: UserDto,
  ) {
    const user = await this.service.getUserDetail(id, isAdmin);
    if (!user) {
      throw new ApiNotFoundException(MessageCode.notFound, 'User not found');
    }

    const result = await this.cognitoService.updateUser({
      email: user.email,
      firstName: body.firstName,
      lastName: body.lastName,
      role: body.role,
    });
    if (!result) {
      throw new Error('Update user failed');
    }

    return this.dataType(UserUpdateResDto, await this.service.getUserDetail(id));
  }

  @ApiBaseOkResponse({
    description: 'Change password',
    type: UserUpdateResDto,
  })
  @Post(':id/change-password')
  async changePassword(@Param('id') id: string, @AuthUser() { isAdmin }: UserDto) {
    const user = await this.service.getUserDetail(id, isAdmin);
    if (!user) {
      throw new ApiNotFoundException(MessageCode.notFound, 'User not found');
    }

    const ranPassword = randomPassword(12);

    logger.info(`Change password for user ${user.email} to ${ranPassword}`);

    const result = await this.cognitoService.changePassword(user.email, ranPassword);
    if (!result) {
      throw new Error('Change password failed');
    }

    return this.ok();
  }

  @ApiBaseOkResponse({
    description: 'Delete a user',
    type: UserDeleteResDto,
    messageCodeRemark: `
    ${MessageCode.notFound}
    `,
  })
  @Delete(':id')
  async delete(@Param('id') id: string, @AuthUser() { isAdmin }: UserDto) {
    const user = await this.service.getUserDetail(id, isAdmin);
    if (!user) {
      throw new Error('User not found');
    }

    const authResponse = await this.cognitoService.deleteUser(user.email);
    if (!authResponse) {
      throw new Error('Delete user failed');
    }

    const result = await this.service.delete(id);

    return this.dataType(UserDeleteResDto, result);
  }
}
