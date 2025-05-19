import { DataSource } from 'typeorm';

import {
  ESystemDefinitionType,
  SettingDefinition,
} from '../../modules/system/entities/setting-definition.entity';
import { BaseSeeder } from './base.seeder';

const records = [
  {
    name: 'Floral',
    metadata: {
      image: 'mask-10.png',
      name: 'Short description about scent playlist adipiscing elit, sed diam nonummy.',
    },
  },
  {
    name: 'Citrus',
    metadata: {
      image: 'mask-11.png',
      name: 'Short description about scent playlist adipiscing elit, sed diam nonummy.',
    },
  },
  {
    name: 'Fruity',
    metadata: {
      image: 'scent-1.png',
      name: 'Short description about scent playlist adipiscing elit, sed diam nonummy.',
    },
  },
  {
    name: 'Woody',
    metadata: {
      image: 'scent-2.png',
      name: 'Short description about scent playlist adipiscing elit, sed diam nonummy.',
    },
  },
  {
    name: 'Green',
    metadata: {
      image: 'scent-3.png',
      name: 'Short description about scent playlist adipiscing elit, sed diam nonummy.',
    },
  },
  {
    name: 'Mint',
    metadata: {
      image: 'scent-4.png',
      name: 'Short description about scent playlist adipiscing elit, sed diam nonummy.',
    },
  },
  {
    name: 'Marine',
    metadata: {
      image: 'scent-5.png',
      name: 'Short description about scent playlist adipiscing elit, sed diam nonummy.',
    },
  },
  {
    name: 'Musky',
    metadata: {
      image: 'scent-6.png',
      name: 'Short description about scent playlist adipiscing elit, sed diam nonummy.',
    },
  },
  {
    name: 'Spicy',
    metadata: {
      image: 'mask-11.png',
      name: 'Short description about scent playlist adipiscing elit, sed diam nonummy.',
    },
  },
  {
    name: 'Herbal',
    metadata: {
      image: 'mask-10.png',
      name: 'Short description about scent playlist adipiscing elit, sed diam nonummy.',
    },
  },
  {
    name: 'Aromatic',
    metadata: {
      image: 'mask-10.png',
      name: 'Short description about scent playlist adipiscing elit, sed diam nonummy.',
    },
  },
  {
    name: 'Ambery',
    metadata: {
      image: 'mask-10.png',
      name: 'Short description about scent playlist adipiscing elit, sed diam nonummy.',
    },
  },
  {
    name: 'Aldehydic',
    metadata: {
      image: 'mask-11.png',
      name: 'Short description about scent playlist adipiscing elit, sed diam nonummy.',
    },
  },
  {
    name: 'Gourmand',
    metadata: {
      image: 'mask-10.png',
      name: 'Short description about scent playlist adipiscing elit, sed diam nonummy.',
    },
  },
  {
    name: 'Balsamic',
    metadata: {
      image: 'mask-11.png',
      name: 'Short description about scent playlist adipiscing elit, sed diam nonummy.',
    },
  },
];

export class ScentTagSeeder extends BaseSeeder {
  protected async execute(dataSource: DataSource): Promise<any> {
    const settingDefinitionRepo = dataSource.getRepository(SettingDefinition);

    // Get all existing records in a single query
    const existingRecords = await settingDefinitionRepo.find({
      where: {
        type: ESystemDefinitionType.SCENT_TAG,
      },
    });

    // Create a map for faster lookups
    const existingMap = new Map(existingRecords.map((record) => [record.name, record]));

    // Create arrays for bulk operations
    const toInsert = [];
    const toUpdate = [];

    // Process each record
    for (const record of records) {
      const existing = existingMap.get(record.name);

      if (!existing) {
        // New record to insert
        toInsert.push({
          ...record,
          type: ESystemDefinitionType.SCENT_TAG,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else if (JSON.stringify(existing.metadata) !== JSON.stringify(record.metadata)) {
        // Only update if metadata has changed
        existing.metadata = {
          ...existing.metadata,
          ...record.metadata,
        };
        existing.updatedAt = new Date();
        toUpdate.push(existing);
      }
    }

    // Perform bulk operations
    if (toInsert.length > 0) {
      await settingDefinitionRepo.insert(toInsert);
    }

    if (toUpdate.length > 0) {
      await settingDefinitionRepo.save(toUpdate);
    }
  }
}
