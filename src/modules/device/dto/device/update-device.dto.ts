import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateDeviceDto {
  @ApiProperty({ required: false, example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  @IsOptional()
  spaceId?: string | null;

  @ApiProperty({ required: false, example: true })
  @IsBoolean()
  @IsOptional()
  isConnected?: boolean;
}
