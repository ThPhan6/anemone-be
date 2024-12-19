import { Expose } from 'class-transformer';

export class UserDto {
  @Expose()
  username: string;

  @Expose()
  iss: string;

  @Expose()
  sub: string;

  @Expose()
  aud: string[];

  @Expose()
  scope: string;

  @Expose()
  azp: string;

  @Expose()
  iat: number;

  @Expose()
  exp: number;
}
