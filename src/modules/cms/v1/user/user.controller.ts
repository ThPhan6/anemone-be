import { Body, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { MessageCode } from 'common/constants/messageCode';
import { ApiNotFoundException } from 'common/types/apiException.type';
import { BaseController } from 'core/controllers/base.controller';
import { ApiController } from 'core/decorator/apiController.decorator';
import { ApiBaseOkResponse, ApiDataWrapType } from 'core/decorator/apiDoc.decorator';
import { AuthService } from 'core/services/auth.service';
import { UserProfileService } from 'core/services/user-profile.service';
import { UserService } from 'modules/user/user.service';

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
  // authRequired: true,
})
export class UserController extends BaseController {
  constructor(
    private readonly service: UserService,
    private readonly profileService: UserProfileService,
    private readonly authService: AuthService,
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
  async create(@Body() body: CreateUserDto) {
    const result = await this.authService.createUser(body.email, body.password, body.name);
    if (!result.User) {
      throw new Error('Create user failed');
    }

    const cogId = result.User.Attributes.find((x) => x.Name === 'sub')?.Value;

    const user = await this.service.create({
      ...body,
      cogId,
      isActive: true,
      profile: {
        name: body.name,
      },
    });

    if (!user) {
      throw new Error('Create user failed');
    }

    await this.profileService.create({
      user: user,
      name: body.name,
    });

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
  async list(@Query() queries: UserGetListQueries) {
    return this.dataType(UserListResDto, await this.service.getListUser(queries));
  }

  @Get()
  async findAll(@Query() query: UserGetListQueries) {
    const results = await this.service.findAll(query);

    return this.dataType(UserListResDto, results);
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
  async detail(@Param('id') id: string) {
    return this.dataType(UserDetailResDto, await this.service.getUserDetail(id));
  }

  @ApiBaseOkResponse({
    description: 'update a user',
    type: UserUpdateResDto,
    messageCodeRemark: `
    ${MessageCode.notFound}
    `,
  })
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    const user = await this.service.findById(id);
    if (!user) {
      throw new ApiNotFoundException(MessageCode.notFound, 'User not found');
    }

    const result = await this.authService.updateUser(user.email, body.name);
    if (!result) {
      throw new Error('Update user failed');
    }

    const { name, role } = body;

    if (role !== user.role) {
      await this.service.update(user.id, { role });
    }

    await this.profileService.updateByUserId(id, { name });

    return this.dataType(UserUpdateResDto, await this.service.getUserDetail(id));
  }

  @ApiBaseOkResponse({
    description: 'Delete a user',
    type: UserDeleteResDto,
    messageCodeRemark: `
    ${MessageCode.notFound}
    `,
  })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    const user = await this.service.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    const authResponse = await this.authService.deleteUser(user.email);
    if (!authResponse) {
      throw new Error('Delete user failed');
    }

    const result = await this.service.delete(id);

    return this.dataType(UserDeleteResDto, result);
  }
}
