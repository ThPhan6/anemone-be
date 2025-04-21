import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { IsString } from 'class-validator';

export class CreateScentMobileDto {
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

  @ApiProperty({ example: '[{ "serialNumber": "SN1234567890", "intensity": 1 }]' })
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

export class UpdateScentMobileDto {
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
  @ApiProperty({ example: 'SN1234567890' })
  @IsString()
  @IsNotEmpty()
  serialNumber: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  intensity: number;
}
