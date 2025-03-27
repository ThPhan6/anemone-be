import { Expose } from 'class-transformer';

export class UserDto {
  @Expose()
  id: string;

  @Expose()
  sub: string;

  @Expose()
  email: string;

  @Expose()
  role: string;
}
