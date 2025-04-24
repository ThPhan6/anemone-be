import { DataSource } from 'typeorm';

import {
  ESystemDefinitionType,
  SettingDefinition,
} from '../../modules/setting-definition/entities/setting-definition.entity';
import { BaseSeeder } from './base.seeder';

export class ScentTagSeeder extends BaseSeeder {
  protected async execute(dataSource: DataSource): Promise<any> {
    const settingDefinition = dataSource.getRepository(SettingDefinition);

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

    const existingRecords = await settingDefinition.find({
      where: categories.map((c) => ({ name: c })),
    });

    for (const name of categories) {
      const existingRecord = existingRecords.find((r) => r.name === name);

      if (!existingRecord) {
        await settingDefinition.save({
          name,
          type: ESystemDefinitionType.SCENT_TAG,
        });
      }
    }
  }
}
