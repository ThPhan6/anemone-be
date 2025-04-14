import { DataSource } from 'typeorm';

import { Scent } from '../entities/scent.entity';
import { UserSetting } from '../entities/user-setting.entity';
import { BaseSeeder } from './base.seeder';

export class PulicScentSeeder extends BaseSeeder {
  async execute(dataSource: DataSource): Promise<any> {
    const scents = dataSource.getRepository(Scent);
    const userSetting = dataSource.getRepository(UserSetting);

    const createdBy = '3f8c9a72-0d23-4e58-91b4-05e9f7b6a7a4';

    const publicScents = [
      {
        name: 'blanket weather',
        image: '',
        intensity: 1,
        cartridgeInfo: '',
        tags: '["relaxing", "floral"]',
        description: '',
        createdBy,
      },
      {
        name: 'bare bloom',
        image: '',
        intensity: 1,
        cartridgeInfo: '',
        tags: '["relaxing", "floral"]',
        description: '',
        createdBy,
      },
      {
        name: 'milk & honey',
        image: '',
        intensity: 1,
        cartridgeInfo: '',
        tags: '["relaxing", "floral"]',
        description: '',
        createdBy,
      },
      {
        name: 'ivory mist',
        image: '',
        intensity: 1,
        cartridgeInfo: '',
        tags: '["relaxing", "floral"]',
        description: '',
        createdBy,
      },
    ];

    for (const scent of publicScents) {
      await scents.save(scent);
    }

    await userSetting.save({
      userId: createdBy,
      isPublic: true,
    });
  }
}
