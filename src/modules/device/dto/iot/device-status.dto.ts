import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class DeviceStatusDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  playlistId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  scentId?: string;
}
