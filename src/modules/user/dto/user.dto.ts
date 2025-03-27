import { Expose } from 'class-transformer';

export class UserDto {
  @Expose()
  sub: string;

  @Expose()
  email: string;

  @Expose()
  username: string;

  @Expose()
  role: string;

  @Expose()
  isAdmin: boolean;
}
