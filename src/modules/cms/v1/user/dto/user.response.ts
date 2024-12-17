import { Type } from 'class-transformer';
import { ExposeApi } from 'core/decorator/property.decorator';
import { Pagination, StringIdResponse } from 'core/types/response.type';

export class UserProfileDto {
  @ExposeApi()
  name: string;
}

export class UserDetailResDto extends StringIdResponse {
  @ExposeApi()
  email: string;

  @ExposeApi()
  @Type(() => UserProfileDto)
  profile: UserProfileDto;
}

export class UserListItemDto extends StringIdResponse {
  @ExposeApi()
  public email: string;

  @ExposeApi()
  @Type(() => UserProfileDto)
  profile: UserProfileDto;
}

export class UserCreateResDto extends StringIdResponse {}

export class UserUpdateResDto extends UserDetailResDto {}

export class UserDeleteResDto extends StringIdResponse {}

export class UserListResDto extends Pagination<UserListItemDto> {
  @ExposeApi({ apiOption: { type: [UserListItemDto] } })
  @Type(() => UserListItemDto)
  items: UserListItemDto[];
}
