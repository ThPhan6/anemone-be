import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class DeviceCommandDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  command: string;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  payload?: Record<string, any>;
}
