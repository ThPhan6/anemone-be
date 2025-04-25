import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { isEmpty } from 'lodash';

import { ProductRepository } from '../../common/repositories/product.repository';
import { ProductVariantRepository } from '../../common/repositories/product-variant.repository';
import { transformImageUrls } from '../../common/utils/helper';
import { BaseService } from '../../core/services/base.service';
import { ApiBaseGetListQueries } from '../../core/types/apiQuery.type';
import { Pagination } from '../../core/types/response.type';
import { ProductType } from '../device/entities/product.entity';
import {
  CreateProductVariantDto,
  UpdateProductVariantDto,
} from './dto/product-variant-request.dto';
import { ProductVariant } from './entities/product-variant.entity';

@Injectable()
export class ProductVariantService extends BaseService<ProductVariant> {
  constructor(
    private readonly productVariantRepository: ProductVariantRepository,
    private readonly productRepository: ProductRepository,
  ) {
    super(productVariantRepository);
  }

  async findVariants(
    query?: ApiBaseGetListQueries & {
      productId?: string;
    },
  ): Promise<ProductVariant | ProductVariant[] | Pagination<ProductVariant>> {
    const { productId, ...restQuery } = query || {};
    if (productId) {
      const product = await this.productRepository.findOne({
        where: { id: productId },
        relations: ['productVariant'],
      });

      if (!product || !product.productVariant) {
        return [];
      }

      return transformImageUrls(product.productVariant);
    }

    if (!isEmpty(restQuery)) {
      const data = await super.findAll(restQuery, {}, ['name']);

      return {
        ...data,
        items: transformImageUrls(data.items),
      };
    }

    return transformImageUrls(await super.find());
  }

  async createForProduct(productId: string, data: CreateProductVariantDto) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new HttpException('Product not found', HttpStatus.BAD_REQUEST);
    }

    // Only DEVICE type products can have variants
    if (product.type !== ProductType.DEVICE) {
      throw new HttpException('Only device products can have variants', HttpStatus.BAD_REQUEST);
    }

    // Create the new variant
    const newVariant = this.productVariantRepository.create(data);
    const savedVariant = await this.productVariantRepository.save(newVariant);

    // Update the product to reference this variant
    await this.productRepository.update(productId, {
      productVariant: savedVariant,
    });

    return savedVariant;
  }

  async getById(id: string) {
    const variant = await this.productVariantRepository.findOne({
      where: { id },
    });

    if (!variant) {
      throw new HttpException('Product variant not found', HttpStatus.NOT_FOUND);
    }

    return variant;
  }

  async update(id: string, data: UpdateProductVariantDto) {
    const variant = await this.productVariantRepository.findOne({
      where: { id },
    });

    if (!variant) {
      throw new HttpException('Product variant not found', HttpStatus.NOT_FOUND);
    }

    return super.update(id, data);
  }

  async delete(id: string) {
    const variant = await this.productVariantRepository.findOne({
      where: { id },
    });

    if (!variant) {
      throw new HttpException('Product variant not found', HttpStatus.NOT_FOUND);
    }

    // Find only DEVICE type products referencing this variant
    const productsWithVariant = await this.productRepository.find({
      where: {
        productVariant: { id },
        type: ProductType.DEVICE,
      },
    });

    // Clear the reference from products to this variant
    for (const product of productsWithVariant) {
      await this.productRepository.update(product.id, { productVariant: null });
    }

    return super.delete(id);
  }
}
