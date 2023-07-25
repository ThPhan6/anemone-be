import { plainToInstance, Transform } from 'class-transformer';
import { ExposeApi, ExposeApiOptional } from 'core/decorator/property.decorator';

class Permissions {
  [key: string]: number;
}

export class UserResDto {
  @ExposeApi()
  id: number;

  @ExposeApi()
  userName: string;

  @ExposeApi()
  mailAddress: string;
}

export class GetMeResDto {
  @ExposeApi()
  user: UserResDto;

  @ExposeApiOptional()
  logo?: string;

  @ExposeApi()
  @Transform(data => plainToInstance(Permissions, data.obj.permissions))
  permissions: Permissions;
}
