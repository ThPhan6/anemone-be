import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { Product } from '../../modules/device/entities/product.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class ProductRepository extends BaseRepository<Product> {
  constructor(dataSource: DataSource) {
    super(Product, dataSource);
  }

  /**
   * Generates a unique diffuser serial number with format ANE-YYYYMM-XXXX
   * @returns A promise that resolves to a unique diffuser serial number
   */
  async generateSerialNumber(): Promise<string> {
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
