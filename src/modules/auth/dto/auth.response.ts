import { ExposeApi } from 'core/decorator/property.decorator';

export class LoginResDto {
  @ExposeApi()
  userId: string;

  @ExposeApi()
  refreshToken: string;

  @ExposeApi()
  accessToken: string;
}
