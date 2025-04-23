import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { MESSAGE } from '../../common/constants/message.constant';
import { ProductRepository } from '../../common/repositories/product.repository';
import { ScentConfigRepository } from '../../common/repositories/scent-config.repository';
import { generateNumericSerialNumber } from '../../common/utils/helper';
import { BaseService } from '../../core/services/base.service';
import { ApiBaseGetListQueries } from '../../core/types/apiQuery.type';
import { Product, ProductType } from '../device/entities/product.entity';
import { CreateProductDto } from './dto/product-request.dto';
@Injectable()
export class ProductService extends BaseService<Product> {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: ProductRepository,
    private readonly scentConfigRepository: ScentConfigRepository,
  ) {
    super(productRepository);
  }

  async findAll(query: ApiBaseGetListQueries & { type: ProductType }) {
    return super.findAll(query, undefined, ['name', 'sku']);
  }

  async create(data: CreateProductDto) {
    const { type, name, sku } = data;

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

    const scentConfigs = await this.scentConfigRepository.find();
    if (!scentConfigs.length) {
      throw new HttpException('No scent configurations available', HttpStatus.BAD_REQUEST);
    }
    //TODO: validate scent config

    const newProduct = this.productRepository.create({
      ...data,
      scentConfig: { id: scentConfigs[0].id },
      serialNumber: type === ProductType.CARTRIDGE ? generateNumericSerialNumber() : null,
    });

    return super.create(newProduct);
  }

  async getById(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['devices', 'cartridges'],
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
    };
  }

  async update(id: string, data: Partial<Product>) {
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
      const restrictedFields = ['manufacturerId', 'batchId', 'serialNumber'];

      for (const field of restrictedFields) {
        if (field in data && data[field] !== product[field]) {
          throw new HttpException(
            `Cannot update "${field}" for a product already in use`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    }

    if (data.serialNumber && data.serialNumber !== product.serialNumber) {
      const exists = await this.productRepository.findOne({
        where: { serialNumber: data.serialNumber, type: product.type },
      });

      if (exists) {
        throw new HttpException(
          product.type === ProductType.CARTRIDGE
            ? MESSAGE.CARTRIDGE.ALREADY_EXISTS
            : MESSAGE.DEVICE.ALREADY_EXISTS,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    return super.update(id, data);
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
