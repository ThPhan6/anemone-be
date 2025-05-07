import { IsNotEmpty } from 'class-validator';
import { IsString } from 'class-validator';

export class CreateAlbumDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
