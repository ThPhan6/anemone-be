import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class DeviceCartridgeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  scentId: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  remainingVolume: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  eot: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  ert: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  percentage: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  position: number;

  @ApiProperty()
  @IsString()
  serialNumber: string;
}

export class DeviceCartridgesDto {
  @ApiProperty({ type: [DeviceCartridgeDto] })
  @IsNotEmpty()
  cartridges: DeviceCartridgeDto[];
}
