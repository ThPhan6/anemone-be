import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { Product, ProductType } from '../../modules/device/entities/product.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class ProductRepository extends BaseRepository<Product> {
  constructor(dataSource: DataSource) {
    super(Product, dataSource);
  }

  /**
   * Generates a unique diffuser serial number with format ANE-YYYYMM-XXXX
   * For cartridges, uses format <sku>-<batchID>
   * @returns A promise that resolves to a unique diffuser serial number
   */
  async generateSerialNumber(
    productType: ProductType,
    sku?: string,
    batchId?: string,
  ): Promise<string> {
    // For cartridge type products, use the format: <sku>-<batchID>
    if (productType === ProductType.CARTRIDGE && sku && batchId) {
      const serialNumber = `${sku}-${batchId}`;

      // Check if this serial number already exists in the database
      const exists = await this.findOne({
        where: { serialNumber },
      });

      if (exists) {
        throw new Error(`Serial number ${serialNumber} already exists.`);
      }

      return serialNumber;
    }

    // For device type products or when required fields for cartridges are missing, use the original format
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Ensure two digits
    const prefix = `ANE-${year}${month}-`;

    let isUnique = false;
    let serialNumber = '';

    while (!isUnique) {
      // Generate a random 4-character alphanumeric hash
      const hash = Math.random().toString(36).substring(2, 6).toUpperCase();
      serialNumber = `${prefix}${hash}`;

      // Check if this serial number already exists in the database
      const exists = await this.findOne({
        where: { serialNumber },
      });

      if (!exists) {
        isUnique = true;
      }
    }

    return serialNumber;
  }
}
