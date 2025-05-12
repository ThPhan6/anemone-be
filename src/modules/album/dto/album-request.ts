import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { IsString } from 'class-validator';

export class CreateAlbumDto {
  @ApiProperty({ example: 'Album name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Image URL' })
  @IsString()
  @IsOptional()
  image: string;
}

export class UpdateAlbumDto {
  @ApiProperty({ example: 'Album name' })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({ example: 'Image URL' })
  @IsString()
  @IsOptional()
  image: string;
}
