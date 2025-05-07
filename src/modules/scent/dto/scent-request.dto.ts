import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { IsString } from 'class-validator';

export class CreateScentDto {
  @ApiProperty({ example: 'Scent name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  intensity: number;

  @ApiProperty({ example: '[{ "id": "dc27e054-5482-4e0e-bd14-59e72645425a", "intensity": 1 }]' })
  @IsString()
  @IsNotEmpty()
  cartridgeInfo: string;

  @ApiProperty({
    example: '["e79aff4f-b840-4083-93e2-d11a4939cd79", "b10c6c5d-3617-4168-bd8b-a4cd017403e7"]',
  })
  @IsString()
  @IsNotEmpty()
  tags: string;

  @ApiProperty({ example: 'Scent description' })
  @IsString()
  @IsNotEmpty()
  description: string;
}

export class UpdateScentDto {
  @ApiProperty({ example: 'Scent name' })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(5)
  intensity: number;

  @ApiProperty({ example: '[{ "serialNumber": "SN1234567890", "intensity": 1 }]' })
  @IsString()
  @IsOptional()
  cartridgeInfo: string;

  @ApiProperty({
    example: '["e79aff4f-b840-4083-93e2-d11a4939cd79", "b10c6c5d-3617-4168-bd8b-a4cd017403e7"]',
  })
  @IsString()
  @IsOptional()
  tags: string;

  @ApiProperty({ example: 'Scent description' })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  isRemoveImage: boolean;
}

export class CartridgeInfoDto {
  @ApiProperty({ example: 'dc27e054-5482-4e0e-bd14-59e72645425a' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  intensity: number;
}

export class TestScentDto {
  @ApiProperty({ example: 'device-001' })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  intensity: number;

  @ApiProperty({ example: [{ id: 'dc27e054-5482-4e0e-bd14-59e72645425a', intensity: 1 }] })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CartridgeInfoDto)
  cartridgeInfo: CartridgeInfoDto[];
}
