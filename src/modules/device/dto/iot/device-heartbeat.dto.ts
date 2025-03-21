import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';

import { DeviceCartridgeDto } from './device-cartridges.dto';

export class DeviceHeartbeatDto {
  @ApiProperty({ type: [DeviceCartridgeDto], required: false })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DeviceCartridgeDto)
  cartridges?: DeviceCartridgeDto[];
}
