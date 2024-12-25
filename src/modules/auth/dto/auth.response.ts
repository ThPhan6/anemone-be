import { ExposeApi } from 'core/decorator/property.decorator';

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
