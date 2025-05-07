import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { IsString } from 'class-validator';

export class AddPlaylistToAlbumDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  playlistId: string;
}
