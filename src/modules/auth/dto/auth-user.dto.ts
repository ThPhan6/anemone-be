import { Expose } from 'class-transformer';
import { UserRole } from 'modules/user/user.type';

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

  @Expose()
  role: UserRole;

  @Expose()
  isAdmin: boolean;
}
