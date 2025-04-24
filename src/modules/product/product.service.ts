import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { MESSAGE } from '../../common/constants/message.constant';
import { ProductRepository } from '../../common/repositories/product.repository';
import { ScentConfigRepository } from '../../common/repositories/scent-config.repository';
import { transformScentConfig } from '../../common/utils/helper';
import { BaseService } from '../../core/services/base.service';
import { ApiBaseGetListQueries } from '../../core/types/apiQuery.type';
import { Product, ProductType } from '../device/entities/product.entity';
import { CreateProductDto, UpdateProductDto } from './dto/product-request.dto';
@Injectable()
export class ProductService extends BaseService<Product> {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly scentConfigRepository: ScentConfigRepository,
  ) {
    super(productRepository);
  }

  async findAll(query: ApiBaseGetListQueries & { type: ProductType }) {
    const data = await super.findAll(query, { scentConfig: true }, ['name', 'sku']);

    return {
      ...data,
      items: data.items.map((item) => ({
        ...item,
        scentConfig: transformScentConfig(item.scentConfig),
      })),
    };
  }

  async create(data: CreateProductDto) {
    const { type, name, sku, scentConfigId } = data;

    const existingProduct = await this.productRepository.findOne({
      where: [{ sku, name, type }],
    });

    if (existingProduct) {
      const message =
        type === ProductType.DEVICE
          ? MESSAGE.DEVICE.ALREADY_EXISTS
          : MESSAGE.CARTRIDGE.ALREADY_EXISTS;
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }

    const scentConfig = await this.scentConfigRepository.findOne({
      where: { id: scentConfigId },
    });

    if (!scentConfig) {
      throw new HttpException('Scent configuration not found', HttpStatus.BAD_REQUEST);
    }

    let serialNumber = null;
    if (type === ProductType.CARTRIDGE) {
      serialNumber = await this.productRepository.generateSerialNumber();
    }

    const newProduct = this.productRepository.create({
      ...data,
      scentConfig,
      serialNumber,
    });

    return super.create(newProduct);
  }

  async getById(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['devices', 'cartridges', 'scentConfig'],
    });

    if (!product) {
      throw new HttpException(
        product.type === ProductType.CARTRIDGE
          ? MESSAGE.CARTRIDGE.NOT_FOUND
          : MESSAGE.DEVICE.NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    const canEditManufacturerInfo = product.devices.length === 0 && product.cartridges.length === 0;

    return {
      id: product.id,
      manufacturerId: product.manufacturerId,
      batchId: product.batchId,
      serialNumber: product.serialNumber,
      name: product.name,
      type: product.type,
      sku: product.sku,
      configTemplate: product.configTemplate,
      supportedFeatures: product.supportedFeatures,
      canEditManufacturerInfo,
      scentConfig: transformScentConfig(product.scentConfig),
    };
  }

  async update(id: string, data: UpdateProductDto) {
    const { type, name, sku, scentConfigId } = data;
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['devices', 'cartridges'],
    });

    if (!product) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    // Check if product is already linked
    const hasRelations = product.devices.length > 0 || product.cartridges.length > 0;

    if (hasRelations) {
      // Check if restricted fields are being updated
      const restrictedFields = ['manufacturerId', 'batchId'];

      for (const field of restrictedFields) {
        if (field in data && data[field] !== product[field]) {
          throw new HttpException(
            `Cannot update "${field}" for a product already in use`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    }

    const existingProduct = await this.productRepository.findOne({
      where: [{ sku, name, type }],
    });

    if (existingProduct && existingProduct.id !== id) {
      const message =
        type === ProductType.DEVICE
          ? MESSAGE.DEVICE.ALREADY_EXISTS
          : MESSAGE.CARTRIDGE.ALREADY_EXISTS;
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }

    const updateData: Partial<Product> = { ...data };

    if (scentConfigId) {
      const scentConfig = await this.scentConfigRepository.findOne({
        where: { id: scentConfigId },
      });

      if (!scentConfig) {
        throw new HttpException('Scent configuration not found', HttpStatus.BAD_REQUEST);
      }

      delete (updateData as any).scentConfigId;

      updateData.scentConfig = scentConfig;
    }

    return super.update(id, updateData);
  }

  async delete(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['devices', 'cartridges'],
    });

    if (!product) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    if (product.devices.length > 0) {
      throw new HttpException(MESSAGE.DEVICE.USED, HttpStatus.BAD_REQUEST);
    }

    if (product.cartridges.length > 0) {
      throw new HttpException(MESSAGE.CARTRIDGE.USED, HttpStatus.BAD_REQUEST);
    }

    return super.delete(id);
  }
}
