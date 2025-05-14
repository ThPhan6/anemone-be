import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { parse as csvParse } from 'csv-parse/sync';
import { orderBy } from 'lodash';
import { In, IsNull } from 'typeorm';

import { MESSAGE } from '../../common/constants/message.constant';
import { DeviceCartridgeRepository } from '../../common/repositories/device-cartridge.repository';
import { ProductRepository } from '../../common/repositories/product.repository';
import { ProductVariantRepository } from '../../common/repositories/product-variant.repository';
import { ScentConfigRepository } from '../../common/repositories/scent-config.repository';
import { transformImageUrls } from '../../common/utils/helper';
import { BaseService } from '../../core/services/base.service';
import { IotService } from '../../core/services/iot-core.service';
import { ApiBaseGetListQueries } from '../../core/types/apiQuery.type';
import { ImportDeviceDto } from '../device/dto/import-device.dto';
import { Product, ProductType } from '../device/entities/product.entity';
import { CertificateStorageService } from '../storage/services/certificate-storage.service';
import { CreateProductDto, UpdateProductDto } from './dto/product-request.dto';

@Injectable()
export class ProductService extends BaseService<Product> {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: ProductRepository,
    private readonly scentConfigRepository: ScentConfigRepository,
    private readonly productVariantRepository: ProductVariantRepository,
    private readonly deviceCartridgeRepository: DeviceCartridgeRepository,
    private readonly certificateStorageService: CertificateStorageService,
    private readonly iotService: IotService,
  ) {
    super(productRepository);
  }

  async findAll(query: ApiBaseGetListQueries & { type: ProductType }) {
    // Get all products with their device relationship
    const data = await super.findAll(
      query,
      {
        scentConfig: true,
        productVariant: true,
        device: true,
        cartridges: true,
      },
      ['name', 'sku', 'serialNumber'],
    );

    // First, extract all device IDs from products that are of type DEVICE
    const deviceIds = data.items
      .filter((item) => item.type === ProductType.DEVICE && item.device)
      .map((item) => item.device.id);

    // Get all device cartridges in a single database call
    let deviceCartridgesMap = {};

    const allCartridges = await this.deviceCartridgeRepository.find({
      where: { device: { id: In(deviceIds) } },
      relations: { device: true },
    });

    // Create a map of device ID to its cartridges for quick lookup
    deviceCartridgesMap = allCartridges.reduce((map, cartridge) => {
      const deviceId = cartridge.device?.id;
      if (!deviceId) {
        return map;
      }

      if (!map[deviceId]) {
        map[deviceId] = [];
      }

      map[deviceId].push({
        id: cartridge.id,
        serialNumber: cartridge.serialNumber,
        position: cartridge.position,
        percentage: cartridge.percentage,
        eot: cartridge.eot,
        ert: cartridge.ert,
      });

      return map;
    }, {});

    // Transform the products with device and cartridge info
    const transformedItems = data.items.map((item) => {
      const result = {
        ...item,
        scentConfig: transformImageUrls(item.scentConfig, ['background', 'image']),
        productVariant: transformImageUrls(item.productVariant),
      };

      if (item.type === ProductType.DEVICE) {
        result['device'] = item?.device || null;
        result['registeredBy'] = item?.device?.registeredBy || null;
        result['deviceCartridges'] = item?.device?.id
          ? orderBy(deviceCartridgesMap[item.device.id], 'position', 'asc')
          : [];
      }

      if (item.type === ProductType.CARTRIDGE) {
        result['activatedQuantity'] = item.cartridges?.length || 0;
      }

      return result;
    });

    return {
      ...data,
      items: transformedItems,
    };
  }

  async create(data: CreateProductDto) {
    const { type, name, sku, scentConfigId, productVariantId, batchId } = data;

    const existingProduct = await this.findOne({
      where: [{ name, type }],
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

    newProduct.serialNumber = await this.productRepository.generateSerialNumber(type, sku, batchId);

    return super.create(newProduct);
  }

  async getById(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['device', 'cartridges', 'scentConfig', 'productVariant'],
    });

    if (!product) {
      throw new HttpException(MESSAGE.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const canEditManufacturerInfo = product.device?.id && product.cartridges.length === 0;

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
    };

    // Apply type-specific transformations
    switch (product.type) {
      case ProductType.DEVICE:
        // For DEVICE type, focus on product variant and fetch certificate if exists
        result['productVariant'] = transformImageUrls(product.productVariant);
        if (product.certificateId) {
          const key = this.certificateStorageService.generateCertificateKey(
            product.serialNumber,
            product.certificateId,
            'cert',
          );
          try {
            const downloadedCertificate =
              await this.certificateStorageService.generateCertificateDownloadUrl(key);
            const describeCertificate = await this.iotService.describeCertificate(
              product.certificateId,
            );
            result['certificate'] = {
              url: downloadedCertificate,
              status: describeCertificate.status,
              createdAt: describeCertificate.creationDate,
            };
          } catch (error) {
            this.logger.error(
              `Failed to fetch certificate for product ${product.id}: ${error.message}`,
            );
          }
        }

        // Include registeredBy field for DEVICE type products
        if (product.device) {
          result['registeredBy'] = product.device.registeredBy || null;
        }

        break;

      case ProductType.CARTRIDGE:
        // For CARTRIDGE type, focus on scent config with specific image fields
        result['scentConfig'] = transformImageUrls(product.scentConfig, ['background', 'image']);
        // Add activatedQuantity - number of cartridges connected to devices
        result['activatedQuantity'] = product?.cartridges?.length || 0;
        break;
    }

    return result;
  }

  async update(id: string, data: UpdateProductDto) {
    const product = await this.getProductForUpdate(id);

    this.validateRestrictedFieldsUpdate(product, data);

    await this.checkProductUniqueness(id, product, data);

    const updateData = await this.prepareProductUpdateData(data, product);

    // Update serial number for cartridges if relevant fields are changed
    if (
      product.type === ProductType.CARTRIDGE &&
      (data.sku || data.manufacturerId || data.batchId)
    ) {
      // Use current values for any fields that aren't being updated
      const sku = data.sku || product.sku;
      const batchId = data.batchId || product.batchId;

      // Generate the new serial number using the format: <sku>-<batchID>
      updateData.serialNumber = await this.productRepository.generateSerialNumber(
        ProductType.CARTRIDGE,
        sku,
        batchId,
      );
    }

    return this.repository.update(id, updateData);
  }

  /**
   * Find the product by ID for updating
   */
  private async getProductForUpdate(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['device'],
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
    if (!product.device?.id) {
      return;
    }

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

  /**
   * Check for uniqueness conflicts with existing products
   */
  private async checkProductUniqueness(
    id: string,
    product: Product,
    data: UpdateProductDto,
  ): Promise<void> {
    const { name, type } = data;

    if (name || type) {
      const existingProduct = await this.productRepository.findOne({
        where: [
          {
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
      relations: ['device', 'cartridges'],
    });

    if (!product) {
      throw new HttpException(MESSAGE.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    switch (product.type) {
      case ProductType.DEVICE:
        // For DEVICE type, check if it's connected to any devices
        if (product.device?.id) {
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

  async importDevicesFromCsv(fileBuffer: Buffer): Promise<{
    successRecords: Product[];
    failedRecords: Array<{ csvRowIdentifier: string; errors: string[] }>;
  }> {
    try {
      const importDtos: ImportDeviceDto[] = [];
      const failedParseRecords: Array<{ csvRowIdentifier: string; errors: string[] }> = [];

      const rows = csvParse(fileBuffer.toString(), {
        columns: true,
        skip_empty_lines: true,
      });

      for (const row of rows) {
        const importDto = new ImportDeviceDto();
        // Handle both camelCase and space-separated column names
        importDto.deviceId = (row['Device ID'] || row['deviceId'])?.trim();
        importDto.manufacturerId = (row['Manufacturer ID'] || row['manufacturerId'])?.trim();
        importDto.batchId = (row['Batch ID'] || row['batchId'])?.trim();

        if (importDto.deviceId) {
          importDtos.push(importDto);
        } else {
          failedParseRecords.push({
            csvRowIdentifier: row['Device ID'] || row['deviceId'] || 'unknown',
            errors: ['Missing required field: Device ID'],
          });
        }
      }

      const { newDevices, existingDevices, lookupFailures } =
        await this._segregateNewAndExisting(importDtos);

      const newResults = await this._handleImportNew(newDevices);
      const existingResults = await this._handleImportExisted(existingDevices);

      return {
        successRecords: [...newResults.successes, ...existingResults.successes],
        failedRecords: [
          ...newResults.failures,
          ...existingResults.failures,
          ...failedParseRecords,
          ...lookupFailures,
        ],
      };
    } catch (error) {
      throw new HttpException(
        `Failed to process CSV file: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async _segregateNewAndExisting(dtos: ImportDeviceDto[]): Promise<{
    newDevices: ImportDeviceDto[];
    existingDevices: ImportDeviceDto[];
    lookupFailures: Array<{ csvRowIdentifier: string; errors: string[] }>;
  }> {
    const deviceIds = dtos.map((dto) => dto.deviceId);
    const existingProducts = await this.productRepository.find({
      where: { serialNumber: In(deviceIds) },
    });
    const existingSerialNumberMap = new Map(
      existingProducts.map((product) => [product.serialNumber, product]),
    );

    const newDevices: ImportDeviceDto[] = [];
    const existingDevices: ImportDeviceDto[] = [];
    const lookupFailures: Array<{ csvRowIdentifier: string; errors: string[] }> = [];

    for (const dto of dtos) {
      if (existingSerialNumberMap.has(dto.deviceId)) {
        existingDevices.push(dto);
      } else {
        newDevices.push(dto);
      }
    }

    return { newDevices, existingDevices, lookupFailures };
  }

  private _validateNewDevice(dto: ImportDeviceDto): string[] {
    const errors: string[] = [];
    if (!dto.manufacturerId) {
      errors.push('Manufacturer ID is required for new devices');
    }

    if (!dto.batchId) {
      errors.push('Batch ID is required for new devices');
    }

    return errors;
  }

  private async _handleImportNew(records: ImportDeviceDto[]): Promise<{
    successes: Product[];
    failures: Array<{ csvRowIdentifier: string; errors: string[] }>;
  }> {
    const successes: Product[] = [];
    const failures: Array<{ csvRowIdentifier: string; errors: string[] }> = [];

    const defaultVariant = await this.productVariantRepository.findOne({
      where: { deletedAt: IsNull() },
      order: { createdAt: 'ASC' },
    });

    if (!defaultVariant) {
      return {
        successes: [],
        failures: records.map((record) => ({
          csvRowIdentifier: record.deviceId,
          errors: ['No product variant found in the system'],
        })),
      };
    }

    for (const record of records) {
      const validationErrors = this._validateNewDevice(record);
      if (validationErrors.length > 0) {
        failures.push({
          csvRowIdentifier: record.deviceId,
          errors: validationErrors,
        });
        continue;
      }

      try {
        // Create the product first
        const newProduct = this.productRepository.create({
          serialNumber: record.deviceId,
          manufacturerId: record.manufacturerId,
          batchId: record.batchId,
          name: record.deviceId,
          type: ProductType.DEVICE,
          sku: defaultVariant.name,
          productVariant: { id: defaultVariant.id },
        });

        // Create certificate using IoT Core service
        const certResult = await this.iotService.createThingAndCertificate(record.deviceId);

        // Store certificate in S3
        await this.certificateStorageService.storeCertificate(
          record.deviceId,
          certResult.certificateId,
          certResult.certificatePem,
        );

        // Store private key in S3 (temporary)
        await this.certificateStorageService.storePrivateKey(
          record.deviceId,
          certResult.certificateId,
          certResult.privateKey,
        );

        // Update product with certificate ID
        newProduct.certificateId = certResult.certificateId;

        const savedProduct = await this.productRepository.save(newProduct);
        successes.push(savedProduct);
      } catch (error) {
        failures.push({
          csvRowIdentifier: record.deviceId,
          errors: [`Error creating device: ${error.message}`],
        });
      }
    }

    return { successes, failures };
  }

  private async _handleImportExisted(records: ImportDeviceDto[]): Promise<{
    successes: Product[];
    failures: Array<{ csvRowIdentifier: string; errors: string[] }>;
  }> {
    const successes: Product[] = [];
    const failures: Array<{ csvRowIdentifier: string; errors: string[] }> = [];

    const existingProducts = await this.productRepository.find({
      where: { serialNumber: In(records.map((r) => r.deviceId)) },
      relations: ['device'],
    });

    const existingProductMap = new Map(
      existingProducts.map((product) => [product.serialNumber, product]),
    );

    for (const record of records) {
      const existingProduct = existingProductMap.get(record.deviceId);
      if (!existingProduct) {
        failures.push({
          csvRowIdentifier: record.deviceId,
          errors: ['Product not found (this should not happen after segregation)'],
        });
        continue;
      }

      try {
        const updates: Partial<Product> = {};

        if (record.manufacturerId && record.manufacturerId !== existingProduct.manufacturerId) {
          updates.manufacturerId = record.manufacturerId;
        }

        if (record.batchId && record.batchId !== existingProduct.batchId) {
          updates.batchId = record.batchId;
        }

        if (Object.keys(updates).length > 0) {
          Object.assign(existingProduct, updates);
          const updatedProduct = await this.productRepository.save(existingProduct);
          successes.push(updatedProduct);
        } else {
          successes.push(existingProduct); // No changes needed
        }
      } catch (error) {
        failures.push({
          csvRowIdentifier: record.deviceId,
          errors: [`Error updating device: ${error.message}`],
        });
      }
    }

    return { successes, failures };
  }
}
