import { DataSource } from 'typeorm';

import { ProductVariant } from '../../modules/product-variant/entities/product-variant.entity';
import { BaseSeeder } from './base.seeder';

const records = [
  {
    name: 'device-1',
    image: 'device-1.png',
    color: 'white',
  },
  {
    name: 'device-2',
    image: 'device-2.png',
    color: 'yellow',
  },
];

export class ProductVariantSeeder extends BaseSeeder {
  protected async execute(dataSource: DataSource): Promise<any> {
    const productVariantRepository = dataSource.getRepository(ProductVariant);

    const existingRecords = await productVariantRepository.find({
      where: records.map((record) => ({ name: record.name })),
    });

    // Process records in a single loop
    for (const record of records) {
      const existingRecord = existingRecords.find((r) => r.name === record.name);

      if (existingRecord) {
        await productVariantRepository.update(existingRecord.id, record);
      } else {
        const entity = productVariantRepository.create(record);
        await productVariantRepository.save(entity);
      }
    }
  }
}
