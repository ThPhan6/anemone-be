import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { IsNotEmpty } from 'class-validator';

import { ProductType } from '../../device/entities/product.entity';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'SKU is required' })
  sku: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Batch ID is required' })
  batchId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Manufacturer ID is required' })
  manufacturerId: string;

  @ApiProperty()
  @IsEnum(ProductType, { message: 'Type is required and must be a valid ProductType' })
  @IsNotEmpty({ message: 'Type is required' })
  type: ProductType;
}

export class UpdateProductDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Name must not be empty' })
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'SKU must not be empty' })
  sku: string;

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
  @IsOptional()
  @IsEnum(ProductType, { message: 'Type must be a valid ProductType' })
  type: ProductType;
}
