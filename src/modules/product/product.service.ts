import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { MESSAGE } from '../../common/constants/message.constant';
import { paginate } from '../../common/utils/helper';
import { ApiBaseGetListQueries } from '../../core/types/apiQuery.type';
import { Product, ProductType } from '../device/entities/product.entity';
import { CreateProductDto } from './dto/product-request.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async get(type: ProductType, queries: ApiBaseGetListQueries) {
    const search = queries.search;

    const result = await paginate(this.productRepository, {
      where: { type, ...(search ? { name: ILike(`%${search}%`) } : {}) },
      params: queries,
    });

    return result;
  }

  async create(data: CreateProductDto) {
    const { type, serialNumber } = data;

    const existing = await this.productRepository.findOne({
      where: { serialNumber, type },
    });

    if (existing) {
      const message =
        type === ProductType.DEVICE
          ? MESSAGE.DEVICE.ALREADY_EXISTS
          : MESSAGE.CARTRIDGE.ALREADY_EXISTS;

      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }

    const product = this.productRepository.create(data);

    return this.productRepository.save(product);
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

    Object.assign(product, data);

    return this.productRepository.save(product);
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

    const result = await this.productRepository.softDelete(id);

    return result;
  }
}
