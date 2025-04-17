import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class DeviceCartridgeDto {
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
  @IsNotEmpty()
  serialNumber: string;
}

export class DeviceCartridgesDto {
  @ApiProperty({ type: [DeviceCartridgeDto] })
  @IsNotEmpty()
  cartridges: DeviceCartridgeDto[];
}
