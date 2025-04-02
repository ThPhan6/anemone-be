import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSpaceDto {
  @ApiProperty({ example: 'Living room' })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateSpaceDto {
  @ApiProperty({ example: 'Living room' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
