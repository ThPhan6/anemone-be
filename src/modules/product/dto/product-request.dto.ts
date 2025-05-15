import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';
import { IsNotEmpty } from 'class-validator';

import { ProductType } from '../../device/entities/product.entity';

export class CreateProductDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty({ message: 'Serial Number is required' })
  @ValidateIf((o) => o.type === ProductType.DEVICE)
  serialNumber: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty({ message: 'Batch ID is required' })
  batchId: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty({ message: 'Manufacturer ID is required' })
  manufacturerId: string;

  @ApiProperty({ required: true })
  @IsString()
  @ValidateIf((o) => o.type === ProductType.CARTRIDGE)
  @IsNotEmpty({ message: 'Scent configuration ID is required for cartridges' })
  scentConfigId: string;

  @ApiProperty({ required: true })
  @IsString()
  @ValidateIf((o) => o.type === ProductType.DEVICE)
  @IsNotEmpty({ message: 'Product variant is required for devices' })
  productVariantId: string;

  @ApiProperty()
  @IsEnum(ProductType, { message: 'Type is required and must be a valid ProductType' })
  @IsNotEmpty({ message: 'Type is required' })
  type: ProductType;
}

export class UpdateProductDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Batch ID must not be empty' })
  batchId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Manufacturer ID must not be empty' })
  manufacturerId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.type === ProductType.CARTRIDGE || o.type === undefined)
  @IsNotEmpty({ message: 'Scent configuration ID must not be empty for cartridges' })
  scentConfigId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.type === ProductType.DEVICE || o.type === undefined)
  @IsNotEmpty({ message: 'Product variant must not be empty for devices' })
  productVariantId: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(ProductType, { message: 'Type must be a valid ProductType' })
  type: ProductType;
}
