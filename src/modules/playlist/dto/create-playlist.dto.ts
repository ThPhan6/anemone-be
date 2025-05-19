import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { IsNotEmpty } from 'class-validator';

export class CreatePlaylistDto {
  @ApiProperty({
    example: 'Playlist 1',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Image URL' })
  @IsString()
  @IsOptional()
  image: string;
}

export class UpdatePlaylistDto {
  @ApiProperty({
    example: 'Playlist 1',
  })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({ example: 'Image URL' })
  @IsString()
  @IsOptional()
  image: string;
}
