import { Body, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';

import { BaseController } from '../../core/controllers/base.controller';
import { ApiController } from '../../core/decorator/apiController.decorator';
import { ApiBaseOkResponse } from '../../core/decorator/apiDoc.decorator';
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

  @ApiBaseOkResponse({
    description: 'Get all products',
  })
  @Get()
  getAll(@Query() queries: ApiBaseGetListQueries & { type: ProductType }) {
    return this.productService.getAll(queries);
  }

  @ApiBaseOkResponse({
    description: 'Get product by id',
  })
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.productService.getById(id);
  }

  @ApiBaseOkResponse({
    description: 'Create new product',
  })
  @Post()
  create(@Body() data: CreateProductDto) {
    return this.productService.create(data);
  }

  @ApiBaseOkResponse({
    description: 'Update product',
  })
  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateProductDto) {
    return this.productService.update(id, data);
  }

  @ApiBaseOkResponse({
    description: 'Delete product',
  })
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.productService.delete(id);
  }
}
