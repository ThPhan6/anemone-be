import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { IsNotEmpty } from 'class-validator';

export class CreatePlaylistDto {
  @ApiProperty({
    example: 'Playlist 1',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
