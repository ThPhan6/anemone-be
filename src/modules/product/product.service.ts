import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { parse as csvParse } from 'csv-parse/sync';
import * as fs from 'fs/promises';
import { orderBy } from 'lodash';
import * as path from 'path';
import { In, IsNull } from 'typeorm';

import { MESSAGE } from '../../common/constants/message.constant';
import { DeviceCartridgeRepository } from '../../common/repositories/device-cartridge.repository';
import { ProductRepository } from '../../common/repositories/product.repository';
import { ProductVariantRepository } from '../../common/repositories/product-variant.repository';
import { ScentConfigRepository } from '../../common/repositories/scent-config.repository';
import { createFile, downloadFile, transformImageUrls, zipFiles } from '../../common/utils/helper';
import { BaseService } from '../../core/services/base.service';
import { IotService } from '../../core/services/iot-core.service';
import { ApiBaseGetListQueries } from '../../core/types/apiQuery.type';
import { ImportDeviceDto } from '../device/dto/import-device.dto';
import { Product, ProductType } from '../device/entities/product.entity';
import { ProductVariant } from '../product-variant/entities/product-variant.entity';
import { CertificateStorageService } from '../storage/services/certificate-storage.service';
import { CreateProductDto, UpdateProductDto } from './dto/product-request.dto';
import { DeviceImportResult, FailedImportRecord } from './types/product.type';

@Injectable()
export class ProductService extends BaseService<Product> {
  private readonly logger = new Logger(ProductService.name);

  constructor(
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
      [
        'serialNumber',
        'batchId',
        'manufacturerId',
        'productVariant.name',
        'scentConfig.name',
        'scentConfig.code',
      ],
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
    const { type, scentConfigId, productVariantId, batchId, serialNumber } = data;

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
      newProduct.serialNumber = serialNumber;

      const certResult = await this._createCert(serialNumber);
      newProduct.certificateId = certResult.certificateId;
    }

    // CARTRIDGE type requires scent config(dont have serialNumber in payload)
    if (type === ProductType.CARTRIDGE) {
      const scentConfig = await this.scentConfigRepository.findOne({
        where: { id: scentConfigId },
      });

      if (!scentConfig) {
        throw new HttpException('Scent configuration not found', HttpStatus.BAD_REQUEST);
      }

      newProduct.scentConfig = scentConfig;
      newProduct.serialNumber = await this.productRepository.generateSerialNumber(
        ProductType.CARTRIDGE,
        {
          sku: newProduct.scentConfig.code,
          batchId,
        },
      );
    }

    return super.create(newProduct);
  }

  async update(id: string, data: UpdateProductDto) {
    const product = await this.getProductInfo(id);

    this.validateRestrictedFieldsUpdate(product, data);

    const updateData = await this.prepareProductUpdateData(data, product);

    if (data.scentConfigId && product.scentConfig.id !== data.scentConfigId) {
      updateData.scentConfig = await this.scentConfigRepository.findOne({
        where: {
          id: data.scentConfigId,
        },
      });
    }

    if (data.type === ProductType.CARTRIDGE) {
      updateData.serialNumber = await this.productRepository.generateSerialNumber(
        ProductType.CARTRIDGE,
        {
          id,
          sku: updateData.scentConfig.code || product.scentConfig.code,
          batchId: data.batchId || product.batchId,
        },
      );
    }

    return this.repository.update(id, updateData);
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
      type: product.type,
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
            const zipFileName = await this._processZipDevice(product.serialNumber, key);

            const describeCertificate = await this.iotService.describeCertificate(
              product.certificateId,
            );

            result['certificate'] = {
              fileName: zipFileName,
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

  private async _processZipDevice(serialNumber: string, key: string) {
    const zipFolder = path.join(process.cwd(), 'src', 'zips');
    const zipName = `${serialNumber}.zip`;
    const zipPath = path.join(zipFolder, zipName);

    const permPath = `${serialNumber}.perm`;
    const keyPath = `${serialNumber}.key`;
    const deviceNamePath = `${serialNumber}.txt`;

    try {
      // Check if zip already exists
      try {
        await fs.access(zipPath);

        return zipName; // Return existing zip file path
      } catch {
        // Zip doesn't exist, proceed to create it
      }

      // Download files and create txt
      const downloadedCertificate =
        await this.certificateStorageService.generateCertificateDownloadUrl(key);
      const downloadedPrivateKey =
        await this.certificateStorageService.generatePrivateKeyDownloadUrl(key);

      await downloadFile(downloadedCertificate, permPath);
      await downloadFile(downloadedPrivateKey, keyPath);
      await createFile(deviceNamePath, serialNumber);

      // Zip files
      const zipFilePath = await zipFiles(
        [deviceNamePath, permPath, keyPath],
        `${serialNumber}.zip`,
      );

      // Clean up temp files
      await Promise.all([fs.unlink(permPath), fs.unlink(keyPath), fs.unlink(deviceNamePath)]);

      return zipFilePath;
    } catch (error) {
      // Optional: try to clean up files if partially created
      try {
        await Promise.all([
          fs.unlink(permPath).catch(() => {}),
          fs.unlink(keyPath).catch(() => {}),
          fs.unlink(deviceNamePath).catch(() => {}),
        ]);
      } catch {}
      throw error;
    }
  }

  /**
   * Find the product by ID for updating
   */
  private async getProductInfo(id: string): Promise<Product> {
    const product = await this.repository.findOne({
      where: { id },
      relations: ['productVariant', 'scentConfig'],
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

  async importDevicesFromCsv(fileBuffer: Buffer): Promise<DeviceImportResult> {
    try {
      // Parse CSV and perform basic validation
      const { importDtos, failedRecords } = await this._parseCsvAndValidate(fileBuffer);

      // If we already have failures from basic validation, return without processing DB
      if (failedRecords.length > 0) {
        return { successRecords: [], failedRecords };
      }

      // Separate records into new and existing
      const { newDevices, existingDevices } = await this._segregateNewAndExisting(importDtos);

      // Process records and collect results
      const successRecords: Product[] = [];

      // Process new devices
      const newDevicesResult = await this._processNewDevices(newDevices);
      successRecords.push(...newDevicesResult.successes);
      failedRecords.push(...newDevicesResult.failures);

      // Process existing devices
      const existingDevicesResult = await this._processExistingDevices(existingDevices);
      successRecords.push(...existingDevicesResult.successes);
      failedRecords.push(...existingDevicesResult.failures);

      return { successRecords, failedRecords };
    } catch (error) {
      throw new HttpException(
        `Failed to process CSV file: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Parse CSV data and perform basic validation
   */
  private async _parseCsvAndValidate(fileBuffer: Buffer): Promise<{
    importDtos: ImportDeviceDto[];
    failedRecords: FailedImportRecord[];
  }> {
    const importDtos: ImportDeviceDto[] = [];
    const failedRecords: FailedImportRecord[] = [];

    const rows = csvParse(fileBuffer.toString(), {
      columns: true,
      skip_empty_lines: true,
    });

    let expectedBatchId: string | undefined;

    // First step: Basic validation and collecting all records
    for (const row of rows) {
      const importDto = new ImportDeviceDto();
      // Handle both camelCase and space-separated column names
      importDto.deviceId = row['deviceId']?.trim();
      importDto.sku = row['sku']?.trim();
      importDto.manufacturerId = row['manufacturerId']?.trim();
      importDto.batchId = row['batchId']?.trim();

      // Check for required fields
      if (!importDto.deviceId || !importDto.sku) {
        const errors = [
          !importDto.deviceId ? 'Missing required field: deviceId' : '',
          !importDto.sku ? 'Missing required field: sku' : '',
        ].filter(Boolean);

        failedRecords.push({
          deviceId: importDto.deviceId || 'unknown',
          sku: importDto.sku,
          batchId: importDto.batchId,
          manufacturerId: importDto.manufacturerId,
          errors: errors,
        });
        // Don't return immediately, we still want to validate all records first
      } else {
        importDtos.push(importDto);
      }

      this._validateBatchIdConsistency(importDto, expectedBatchId);

      // Set expected batch ID if this is the first record with a batch ID
      if (expectedBatchId === undefined && importDto.batchId) {
        expectedBatchId = importDto.batchId;
      }
    }

    return { importDtos, failedRecords };
  }

  /**
   * Validate batch ID consistency across records
   */
  private _validateBatchIdConsistency(
    importDto: ImportDeviceDto,
    expectedBatchId: string | undefined,
  ): void {
    if (importDto.batchId && expectedBatchId && importDto.batchId !== expectedBatchId) {
      throw new HttpException(
        'All records in the CSV must have the same Batch ID.',
        HttpStatus.BAD_REQUEST,
      );
    } else if (expectedBatchId !== undefined && !importDto.batchId) {
      throw new HttpException(
        'All records in the CSV must have a Batch ID if one is present.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Process and validate new devices
   */
  private async _processNewDevices(newDevices: ImportDeviceDto[]): Promise<{
    successes: Product[];
    failures: FailedImportRecord[];
  }> {
    const successes: Product[] = [];
    const failures: FailedImportRecord[] = [];

    for (const record of newDevices) {
      const productVariant = await this._findProductVariantBySku(record.sku);
      const validationErrors = this._validateNewDevice(record, productVariant);

      if (validationErrors.length > 0) {
        failures.push({
          deviceId: record.deviceId,
          sku: record.sku,
          batchId: record.batchId,
          manufacturerId: record.manufacturerId,
          errors: validationErrors,
        });
      } else if (productVariant) {
        try {
          const newProduct = this.productRepository.create({
            serialNumber: record.deviceId,
            manufacturerId: record.manufacturerId!,
            batchId: record.batchId!,
            type: ProductType.DEVICE,
            productVariant: { id: productVariant.id },
          });

          const certResult = await this._createCert(record.deviceId);
          newProduct.certificateId = certResult.certificateId;

          const savedProduct = await this.productRepository.save(newProduct);
          successes.push(savedProduct);
        } catch (error) {
          failures.push({
            deviceId: record.deviceId,
            sku: record.sku,
            batchId: record.batchId,
            manufacturerId: record.manufacturerId,
            errors: [`Error creating device: ${error.message}`],
          });
        }
      }
    }

    return { successes, failures };
  }

  /**
   * Process and update existing devices
   */
  private async _processExistingDevices(
    existingDevices: { dto: ImportDeviceDto; existingProduct: Product }[],
  ): Promise<{
    successes: Product[];
    failures: FailedImportRecord[];
  }> {
    const successes: Product[] = [];
    const failures: FailedImportRecord[] = [];

    for (const { dto, existingProduct } of existingDevices) {
      try {
        const productVariant = await this._findProductVariantBySku(dto.sku);
        if (!productVariant) {
          failures.push({
            deviceId: dto.deviceId,
            sku: dto.sku,
            batchId: dto.batchId,
            manufacturerId: dto.manufacturerId,
            errors: [`SKU '${dto.sku}' not found in the system`],
          });
          continue;
        }

        const updates = this._prepareExistingDeviceUpdates(dto, existingProduct, productVariant);

        if (Object.keys(updates).length > 0) {
          Object.assign(existingProduct, updates);
          const updatedProduct = await this.productRepository.save(existingProduct);
          successes.push(updatedProduct);
        } else {
          successes.push(existingProduct); // No changes needed
        }
      } catch (error) {
        failures.push({
          deviceId: dto.deviceId,
          sku: dto.sku,
          batchId: dto.batchId,
          manufacturerId: dto.manufacturerId,
          errors: [`Error updating device: ${error.message}`],
        });
      }
    }

    return { successes, failures };
  }

  /**
   * Prepare updates for an existing device
   */
  private _prepareExistingDeviceUpdates(
    dto: ImportDeviceDto,
    existingProduct: Product,
    productVariant: ProductVariant,
  ): Partial<Product> {
    const updates: Partial<Product> = {};

    if (dto.manufacturerId && dto.manufacturerId !== existingProduct.manufacturerId) {
      updates.manufacturerId = dto.manufacturerId;
    }

    if (dto.batchId && dto.batchId !== existingProduct.batchId) {
      updates.batchId = dto.batchId;
    }

    if (existingProduct.productVariant?.id !== productVariant.id) {
      updates.productVariant = productVariant;
    }

    return updates;
  }

  private async _segregateNewAndExisting(dtos: ImportDeviceDto[]): Promise<{
    newDevices: ImportDeviceDto[];
    existingDevices: { dto: ImportDeviceDto; existingProduct: Product }[];
  }> {
    const deviceIds = dtos.map((dto) => dto.deviceId);
    const existingProducts = await this.productRepository.find({
      where: { serialNumber: In(deviceIds) }, // Find existing products by deviceId (serialNumber)
      relations: ['productVariant'],
    });
    const existingProductMap = new Map(
      existingProducts.map((product) => [product.serialNumber, product]),
    );

    const newDevices: ImportDeviceDto[] = [];
    const existingDevices: { dto: ImportDeviceDto; existingProduct: Product }[] = [];

    for (const dto of dtos) {
      const existingProduct = existingProductMap.get(dto.deviceId);
      if (existingProduct) {
        existingDevices.push({ dto, existingProduct });
      } else {
        newDevices.push(dto);
      }
    }

    return { newDevices, existingDevices };
  }

  private async _findProductVariantBySku(sku: string): Promise<ProductVariant | null> {
    return this.productVariantRepository.findOne({
      where: { name: sku, deletedAt: IsNull() },
    });
  }

  private _validateNewDevice(
    dto: ImportDeviceDto,
    productVariant: ProductVariant | null,
  ): string[] {
    const errors: string[] = [];
    if (!dto.manufacturerId) {
      errors.push('Manufacturer ID is required for new devices');
    }

    if (!dto.batchId) {
      errors.push('Batch ID is required for new devices');
    }

    if (!productVariant) {
      errors.push(`SKU '${dto.sku}' not found in the system`);
    }

    return errors;
  }

  private async _createCert(deviceId: string) {
    // Create certificate using IoT Core service
    const certResult = await this.iotService.createThingAndCertificate(deviceId);

    // Store certificate in S3
    await this.certificateStorageService.storeCertificate(
      deviceId,
      certResult.certificateId,
      certResult.certificatePem,
    );

    // Store private key in S3 (temporary)
    await this.certificateStorageService.storePrivateKey(
      deviceId,
      certResult.certificateId,
      certResult.privateKey,
    );

    return certResult;
  }
}
