import { Body, Delete, Get, Param, Put, Query } from '@nestjs/common';

import { BaseController } from '../../core/controllers/base.controller';
import { ApiController } from '../../core/decorator/apiController.decorator';
import { ApiBaseOkResponse } from '../../core/decorator/apiDoc.decorator';
import { AdminRoleGuard } from '../../core/decorator/auth.decorator';
import { ApiBaseGetListQueries } from '../../core/types/apiQuery.type';
import { UpdateProductVariantDto } from './dto/product-variant-request.dto';
import { ProductVariantService } from './product-variant.service';

@AdminRoleGuard()
@ApiController({
  name: 'product-variants',
})
export class ProductVariantController extends BaseController {
  constructor(private readonly productVariantService: ProductVariantService) {
    super();
  }

  @ApiBaseOkResponse({
    description: 'Get all product variants',
  })
  @Get()
  getAll(@Query() queries: ApiBaseGetListQueries & { productId?: string }) {
    const { productId, ...restQueries } = queries;

    return this.productVariantService.findVariants(restQueries, productId);
  }

  @ApiBaseOkResponse({
    description: 'Get product variant by id',
  })
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.productVariantService.getById(id);
  }

  @ApiBaseOkResponse({
    description: 'Update product variant',
  })
  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateProductVariantDto) {
    return this.productVariantService.update(id, data);
  }

  @ApiBaseOkResponse({
    description: 'Delete product variant',
  })
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.productVariantService.delete(id);
  }
}
