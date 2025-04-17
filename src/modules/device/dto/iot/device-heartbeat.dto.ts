import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';

import { DeviceCartridgeDto } from './device-cartridges.dto';

export enum DeviceStatus {
  idle,
  play,
}

export class DeviceHeartbeatDto {
  @ApiProperty({ example: 0 })
  @IsEnum(DeviceStatus)
  @IsNotEmpty()
  deviceStatus: DeviceStatus;

  @ApiProperty({ type: [DeviceCartridgeDto], required: false })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DeviceCartridgeDto)
  cartridges?: DeviceCartridgeDto[];
}
