import { Expose } from 'class-transformer';

export class UserDto {
  @Expose()
  'ATTR/email': string;

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

  @Expose()
  role: string;
}
