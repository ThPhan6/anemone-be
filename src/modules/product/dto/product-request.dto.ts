import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { IsNotEmpty } from 'class-validator';

import { ProductType } from '../../device/entities/product.entity';

export class CreateProductDto {
  @ApiProperty({
    example: 'Product 1',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'SKU123',
  })
  @IsString()
  @IsOptional()
  sku: string;

  @ApiProperty({
    example: 'SN335406615',
  })
  @IsString()
  @IsNotEmpty()
  serialNumber: string;

  @ApiProperty({
    example: 'BATCH-202504',
  })
  @IsString()
  @IsOptional()
  batchId: string;

  @ApiProperty({
    example: 'vitruvi',
  })
  @IsString()
  @IsOptional()
  manufacturerId: string;

  @ApiProperty({
    example: ProductType.DEVICE,
  })
  @IsEnum(ProductType)
  @IsNotEmpty()
  type: ProductType;
}

export class UpdateProductDto {
  @ApiProperty({
    example: 'Product 1',
  })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({
    example: 'SKU123',
  })
  @IsString()
  @IsOptional()
  sku: string;

  @ApiProperty({
    example: 'BATCH-202504',
  })
  @IsString()
  @IsOptional()
  batchId: string;

  @ApiProperty({
    example: 'vitruvi',
  })
  @IsString()
  @IsOptional()
  manufacturerId: string;
}
