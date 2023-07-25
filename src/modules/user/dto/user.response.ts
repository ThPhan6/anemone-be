import { Type } from 'class-transformer';
import { ExposeApi } from 'core/decorator/property.decorator';
import { Pagination, StringIdResponse } from 'core/types/response.type';

export class UserDetailResDto extends StringIdResponse {
  @ExposeApi()
  userName: string;

  @ExposeApi()
  password: string;

  @ExposeApi()
  mailAddress: string;

  @ExposeApi()
  loginName: string;

  @ExposeApi()
  note: string;

  @ExposeApi()
  invalidFlg: boolean;
}

export class UserListItemDto extends StringIdResponse {
  @ExposeApi()
  public userName: string;

  @ExposeApi()
  public mailAddress: string;
}

export class UserCreateResDto extends StringIdResponse {}

export class UserUpdateResDto extends UserDetailResDto {}

export class UserDeleteResDto extends StringIdResponse {}

export class UserListResDto extends Pagination<UserListItemDto> {
  @ExposeApi({ apiOption: { type: [UserListItemDto] } })
  @Type(() => UserListItemDto)
  items: UserListItemDto[];
}
