import { Type } from 'class-transformer';
import { ExposeApi } from 'core/decorator/property.decorator';
import { StringIdResponse } from 'core/types/response.type';

export class AuthChallengeRequiredDto {
  @ExposeApi()
  ChallengeName: string;

  @ExposeApi()
  Session: string;
}

export class AuthResponseDto {
  @ExposeApi()
  AccessToken: string;

  @ExposeApi()
  IdToken: string;

  @ExposeApi()
  ExpiresIn: number;

  @ExposeApi()
  RefreshToken: string;
}

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
