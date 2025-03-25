import { ExposeApi } from 'core/decorator/property.decorator';

export class AuthChallengeRequiredDto {
  @ExposeApi()
  ChallengeName: string;

  @ExposeApi()
  Session: string;
}

export class AuthResponseDto {
  @ExposeApi()
  accessToken: string;

  @ExposeApi()
  idToken: string;

  @ExposeApi()
  expiresIn: number;

  @ExposeApi()
  refreshToken: string;
}
