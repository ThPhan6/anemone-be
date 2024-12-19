import { Type } from 'class-transformer';
import { ExposeApi } from 'core/decorator/property.decorator';
import { StringIdResponse } from 'core/types/response.type';

export class UserProfileDto {
  @ExposeApi()
  name: string;
}

export class UserDetailResDto extends StringIdResponse {
  @ExposeApi()
  email: string;

  @ExposeApi()
  role: string;

  @ExposeApi()
  @Type(() => UserProfileDto)
  profile: UserProfileDto;
}
