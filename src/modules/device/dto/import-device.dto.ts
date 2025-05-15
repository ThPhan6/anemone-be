import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ImportDeviceDto {
  @ApiProperty({ description: 'Device ID from CSV, maps to serialNumber in DB' })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ required: false, description: 'Manufacturer ID' })
  @IsOptional()
  @IsString()
  manufacturerId?: string;

  @ApiProperty({ required: false, description: 'Batch ID' })
  @IsOptional()
  @IsString()
  batchId?: string;
}
