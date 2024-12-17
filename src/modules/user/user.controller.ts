import { BaseController } from 'core/controllers/base.controller';
import { ApiController } from 'core/decorator/apiController.decorator';

import { UserService } from './user.service';

@ApiController({
  name: 'Users',
  // authRequired: true,
})
export class UserController extends BaseController {
  constructor(private readonly service: UserService) {
    super();
  }

  //   Create User

  // @ApiBaseOkResponse({
  //   description: 'create user',
  //   type: UserCreateResDto,
  //   messageCodeRemark: `
  //   ${MessageCode.permissionDenied}
  //   `,
  // })
  // @Post()
  // @AuthPermission(RoleCode.user)
  // async create(@Request() { user }: { user: IDataSign }, @Body() body: UserCreateReqDto) {
  //   return this.dataType(UserCreateResDto, await this.service.create(body, user));
  // }

  // //   Get User Detail

  // @ApiBaseOkResponse({
  //   description: 'Get user detail',
  //   type: UserDetailResDto,
  //   messageCodeRemark: `
  //   ${MessageCode.notFound}
  //   ${MessageCode.permissionDenied}
  //   `,
  // })
  // @Get(':id')
  // @AuthPermission(RoleCode.user)
  // async detail(@Param('id') id: string) {
  //   return this.dataType(UserDetailResDto, await this.service.getDetail(id));
  // }

  // //   Update User

  // @ApiBaseOkResponse({
  //   description: 'update user',
  //   type: UserUpdateResDto,
  //   messageCodeRemark: `
  //   ${MessageCode.permissionDenied}
  //   ${MessageCode.notFound}
  //   `,
  // })
  // @Put(':id')
  // @AuthPermission(RoleCode.user)
  // async update(@Param('id') id: string, @Request() { user }: { user: IDataSign }, @Body() body: UserUpdateReqDto) {
  //   return this.dataType(UserUpdateResDto, await this.service.update(id, body, user));
  // }

  // //   Delete User

  // @ApiBaseOkResponse({
  //   description: 'Delete user',
  //   type: UserDeleteResDto,
  //   messageCodeRemark: `
  //   ${MessageCode.notFound}
  //   ${MessageCode.permissionDenied}
  //   `,
  // })
  // @Delete(':id')
  // @AuthPermission(RoleCode.user)
  // async delete(@Param('id') id: string) {
  //   return this.dataType(UserDeleteResDto, {
  //     id: await this.service.delete(id),
  //   });
  // }

  // // Get list

  // @ApiBaseOkResponse({
  //   description: 'Get list user',
  //   type: UserListItemDto,
  //   wrapType: ApiDataWrapType.pagination,
  //   messageCodeRemark: `
  //   ${MessageCode.userNotFound}
  //   `,
  // })
  // @Get()
  // @AuthPermission(RoleCode.user)
  // async list(@Query() queries: UserGetListQueries) {
  //   return this.dataType(UserListResDto, await this.service.getList(queries));
  // }
}
