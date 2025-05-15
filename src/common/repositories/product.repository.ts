import { Injectable } from '@nestjs/common';
import { DataSource, Not } from 'typeorm';

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
    props: {
      id?: string;
      sku?: string;
      batchId?: string;
    } = {},
  ): Promise<string | null> {
    const { id, batchId, sku } = props;

    // For cartridge type products, use the format: <sku>-<batchID>
    if (productType === ProductType.CARTRIDGE && sku && batchId) {
      const serialNumber = `${sku}-${batchId}`;

      // Check if this serial number already exists in the database
      const exists = await this.findOne({
        where: { serialNumber, id: Not(id) },
      });

      if (exists) {
        throw new Error(`Serial number ${serialNumber} already exists.`);
      }

      return serialNumber;
    }

    return null;
  }
}
