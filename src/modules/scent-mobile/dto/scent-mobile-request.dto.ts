import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { IsString } from 'class-validator';

export class CreateScentMobileDto {
  @ApiProperty({ example: 'Scent name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  intensity: number;

  // @ApiProperty({ example: ['cartridge1', 'cartridge2'] })
  // @IsNotEmpty()
  cartridgeInfo: any;

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
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  intensity: number;

  // @ApiProperty({ example: ['cartridge1', 'cartridge2'] })
  // @IsArray()
  // @IsNotEmpty()
  cartridgeInfo: any;

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

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  isRemoveImage: boolean;
}
