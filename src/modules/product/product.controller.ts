import { Body, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';

import { BaseController } from '../../core/controllers/base.controller';
import { ApiController } from '../../core/decorator/apiController.decorator';
import { AdminRoleGuard } from '../../core/decorator/auth.decorator';
import { ApiBaseGetListQueries } from '../../core/types/apiQuery.type';
import { ProductType } from '../device/entities/product.entity';
import { CreateProductDto, UpdateProductDto } from './dto/product-request.dto';
import { ProductService } from './product.service';

@AdminRoleGuard()
@ApiController({
  name: 'products',
})
export class ProductController extends BaseController {
  constructor(private readonly productService: ProductService) {
    super();
  }

  @Get()
  getProducts(@Query() queries: ApiBaseGetListQueries, @Query('type') type: ProductType) {
    return this.productService.get(type, queries);
  }

  @Get(':id')
  getDetail(@Param('id') id: string) {
    return this.productService.getById(id);
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.productService.delete(id);
  }
}
