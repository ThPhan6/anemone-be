import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { MESSAGE } from '../../common/constants/message.constant';
import { ProductRepository } from '../../common/repositories/product.repository';
import { ProductVariantRepository } from '../../common/repositories/product-variant.repository';
import { ScentConfigRepository } from '../../common/repositories/scent-config.repository';
import { transformImageUrls } from '../../common/utils/helper';
import { BaseService } from '../../core/services/base.service';
import { ApiBaseGetListQueries } from '../../core/types/apiQuery.type';
import { Product, ProductType } from '../device/entities/product.entity';
import { CreateProductDto, UpdateProductDto } from './dto/product-request.dto';

@Injectable()
export class ProductService extends BaseService<Product> {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly scentConfigRepository: ScentConfigRepository,
    private readonly productVariantRepository: ProductVariantRepository,
  ) {
    super(productRepository);
  }

  async findAll(query: ApiBaseGetListQueries & { type: ProductType }) {
    const data = await super.findAll(query, { scentConfig: true, productVariant: true }, [
      'name',
      'sku',
    ]);

    return {
      ...data,
      items: data.items.map((item) => ({
        ...item,
        scentConfig: transformImageUrls(item.scentConfig, ['background', 'image']),
        productVariant: transformImageUrls(item.productVariant),
      })),
    };
  }

  async create(data: CreateProductDto) {
    const { type, name, sku, scentConfigId, productVariantId } = data;

    // Check if product already exists
    const existingProduct = await this.productRepository.findOne({
      where: [{ sku }, { name, type }],
    });

    if (existingProduct) {
      const message =
        type === ProductType.DEVICE
          ? MESSAGE.DEVICE.ALREADY_EXISTS
          : MESSAGE.CARTRIDGE.ALREADY_EXISTS;
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }

    const newProduct: Partial<Product> = { ...data };

    // DEVICE type requires product variant
    if (type === ProductType.DEVICE) {
      const productVariant = await this.productVariantRepository.findOne({
        where: { id: productVariantId },
      });

      if (!productVariant) {
        throw new HttpException('Product variant not found', HttpStatus.BAD_REQUEST);
      }

      newProduct.productVariant = productVariant;
    }

    // CARTRIDGE type requires scent config
    if (type === ProductType.CARTRIDGE) {
      const scentConfig = await this.scentConfigRepository.findOne({
        where: { id: scentConfigId },
      });

      if (!scentConfig) {
        throw new HttpException('Scent configuration not found', HttpStatus.BAD_REQUEST);
      }

      newProduct.scentConfig = scentConfig;
    }

    newProduct.serialNumber = await this.productRepository.generateSerialNumber();

    return super.create(newProduct as Product);
  }

  async getById(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['devices', 'cartridges', 'scentConfig', 'productVariant'],
    });

    if (!product) {
      throw new HttpException(MESSAGE.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const canEditManufacturerInfo = product.devices.length === 0 && product.cartridges.length === 0;

    // Create base response object
    const result = {
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
      scentConfig: null,
      productVariant: null,
    };

    // Apply type-specific transformations
    switch (product.type) {
      case ProductType.DEVICE:
        // For DEVICE type, focus on product variant
        result.productVariant = transformImageUrls(product.productVariant);
        break;

      case ProductType.CARTRIDGE:
        // For CARTRIDGE type, focus on scent config with specific image fields
        result.scentConfig = transformImageUrls(product.scentConfig, ['background', 'image']);
        break;
    }

    return result;
  }

  async update(id: string, data: UpdateProductDto) {
    const product = await this.getProductForUpdate(id);

    this.validateRestrictedFieldsUpdate(product, data);

    await this.checkProductUniqueness(id, product, data);

    const updateData = await this.prepareProductUpdateData(data, product);

    return super.update(id, updateData);
  }

  /**
   * Find the product by ID for updating
   */
  private async getProductForUpdate(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['devices', 'cartridges'],
    });

    if (!product) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    return product;
  }

  /**
   * Validate if restricted fields can be updated based on product relationships
   */
  private validateRestrictedFieldsUpdate(product: Product, data: UpdateProductDto): void {
    const hasRelations = product.devices.length > 0 || product.cartridges.length > 0;

    if (hasRelations) {
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
  }

  /**
   * Check for uniqueness conflicts with existing products
   */
  private async checkProductUniqueness(
    id: string,
    product: Product,
    data: UpdateProductDto,
  ): Promise<void> {
    const { name, sku, type } = data;

    if (name || sku || type) {
      const existingProduct = await this.productRepository.findOne({
        where: [
          {
            sku: sku || product.sku,
            name: name || product.name,
            type: type || product.type,
          },
        ],
      });

      if (existingProduct && existingProduct.id !== id) {
        const productType = type || product.type;
        const message =
          productType === ProductType.DEVICE
            ? MESSAGE.DEVICE.ALREADY_EXISTS
            : MESSAGE.CARTRIDGE.ALREADY_EXISTS;

        throw new HttpException(message, HttpStatus.BAD_REQUEST);
      }
    }
  }

  /**
   * Prepare the update data with type-specific handling
   */
  private async prepareProductUpdateData(
    data: UpdateProductDto,
    product: Product,
  ): Promise<Partial<Product>> {
    const updateData: Partial<Product> = { ...data };
    const productType = data.type !== undefined ? data.type : product.type;

    // Handle type-specific relationships
    switch (productType) {
      case ProductType.DEVICE:
        await this.handleDeviceRelationships(updateData, data.productVariantId);
        break;

      case ProductType.CARTRIDGE:
        await this.handleCartridgeRelationships(updateData, data.scentConfigId);
        break;
    }

    return updateData;
  }

  /**
   * Handle DEVICE type specific relationships (product variant)
   */
  private async handleDeviceRelationships(
    updateData: Partial<Product>,
    productVariantId: string,
  ): Promise<void> {
    if (productVariantId) {
      const productVariant = await this.productVariantRepository.findOne({
        where: { id: productVariantId },
      });

      if (!productVariant) {
        throw new HttpException('Product variant not found', HttpStatus.BAD_REQUEST);
      }

      delete (updateData as any).productVariantId;
      updateData.productVariant = productVariant;
    }
  }

  /**
   * Handle CARTRIDGE type specific relationships (scent config)
   */
  private async handleCartridgeRelationships(
    updateData: Partial<Product>,
    scentConfigId: string,
  ): Promise<void> {
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
  }

  async delete(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['devices', 'cartridges'],
    });

    if (!product) {
      throw new HttpException(MESSAGE.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    switch (product.type) {
      case ProductType.DEVICE:
        // For DEVICE type, check if it's connected to any devices
        if (product.devices.length > 0) {
          throw new HttpException(
            'Cannot delete device product that is in use',
            HttpStatus.BAD_REQUEST,
          );
        }

        break;

      case ProductType.CARTRIDGE:
        // For CARTRIDGE type, check if it's connected to any cartridges
        if (product.cartridges.length > 0) {
          throw new HttpException(
            'Cannot delete cartridge product that is in use',
            HttpStatus.BAD_REQUEST,
          );
        }

        break;
    }

    return super.delete(id);
  }
}
