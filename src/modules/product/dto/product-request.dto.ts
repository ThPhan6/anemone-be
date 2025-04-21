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
  @IsOptional()
  sku: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  batchId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
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
  sku: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  batchId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  manufacturerId: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(ProductType, { message: 'Type must be a valid ProductType' })
  type: ProductType;
}
