import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { DeviceProvisioningStatus } from '../../entities/device.entity';

export class CreateDeviceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Serial number is required' })
  serialNumber: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  thingName?: string;

  @ApiProperty({
    required: false,
    enum: DeviceProvisioningStatus,
    default: DeviceProvisioningStatus.PENDING,
  })
  @IsEnum(DeviceProvisioningStatus)
  @IsOptional()
  provisioningStatus?: DeviceProvisioningStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  firmwareVersion?: string;

  @ApiProperty({ required: false, default: false })
  @IsBoolean()
  @IsOptional()
  isConnected?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  lastPingAt?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  warrantyExpirationDate?: Date;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  registeredBy?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  spaceId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  familyId?: string;
}

export class UpdateDeviceDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  thingName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  firmwareVersion?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isConnected?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  lastPingAt?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  warrantyExpirationDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(DeviceProvisioningStatus)
  provisioningStatus?: DeviceProvisioningStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  registeredBy?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  spaceId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  familyId?: string;
}

export class RegisterDeviceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  deviceId: string;
}
