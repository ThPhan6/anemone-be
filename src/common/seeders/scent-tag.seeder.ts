import { DataSource } from 'typeorm';

import { Category } from '../entities/category.entity';
import { CategoryType } from '../enum/category.enum';
import { BaseSeeder } from './base.seeder';

export class ScentTagSeeder extends BaseSeeder {
  protected async execute(dataSource: DataSource): Promise<any> {
    const categoryRepository = dataSource.getRepository(Category);

    const categories = [
      'Woody',
      'Green',
      'Mint',
      'Marine',
      'Floral',
      'Citrus',
      'Fruity',
      'Musky',
      'Spicy',
      'Herbal',
      'Aromatic',
      'Ambery',
      'Aldehydic',
    ];

    for (const name of categories) {
      await categoryRepository.save({ name, type: CategoryType.ScentTag });
    }
  }
}
