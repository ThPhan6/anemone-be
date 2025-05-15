import { DataSource } from 'typeorm';

import { ScentConfig } from '../../modules/system/entities/scent-config.entity';
import {
  ESystemDefinitionType,
  SettingDefinition,
} from '../../modules/system/entities/setting-definition.entity';
import { Scent } from '../entities/scent.entity';
import { UserSetting } from '../entities/user-setting.entity';
import { BaseSeeder } from './base.seeder';
export class PublicScentSeeder extends BaseSeeder {
  async execute(dataSource: DataSource): Promise<any> {
    const scents = dataSource.getRepository(Scent);
    const userSetting = dataSource.getRepository(UserSetting);

    const createdBy = '3f8c9a72-0d23-4e58-91b4-05e9f7b6a7a4';

    const scentConfigs = await dataSource.getRepository(ScentConfig).find();

    const settingDefinitions = await dataSource.getRepository(SettingDefinition).find({
      where: {
        type: ESystemDefinitionType.SCENT_TAG,
      },
    });

    const scentConfigIds = scentConfigs.map((c) => ({ id: c.id }));

    const settingDefIds = settingDefinitions.map((t) => t.id);

    const publicScents = [
      {
        name: 'blanket weather',
        image: '',
        intensity: 3,
        cartridgeInfo: '',
        tags: '',
        description: '',
        createdBy,
      },
      {
        name: 'bare bloom',
        image: '',
        intensity: 3,
        cartridgeInfo: '',
        tags: '',
        description: '',
        createdBy,
      },
      {
        name: 'milk & honey',
        image: '',
        intensity: 3,
        cartridgeInfo: '',
        tags: '',
        description: '',
        createdBy,
      },
      {
        name: 'ivory mist',
        image: '',
        intensity: 3,
        cartridgeInfo: '',
        tags: '',
        description: '',
        createdBy,
      },
    ];

    const existingRecords = await scents.find({
      where: publicScents.map((s) => ({ name: s.name })),
    });

    for (const scent of publicScents) {
      const existingRecord = existingRecords.find((r) => r.name === scent.name);

      const payload = {
        name: scent.name,
        image: scent.image,
        intensity: scent.intensity,
        cartridgeInfo: `[{"id": "${scentConfigIds[0].id}", "intensity": 1}, {"id": "${scentConfigIds[1].id}", "intensity": 1}]`,
        tags: `["${settingDefIds[0]}", "${settingDefIds[1]}"]`,
        description: scent.description,
        createdBy,
      } as Scent;

      if (existingRecord) {
        await scents.update(existingRecord.id, payload);
      } else {
        await scents.save(payload);
      }
    }

    const existingSetting = await userSetting.findOne({ where: { userId: createdBy } });

    if (existingSetting) {
      await userSetting.update(existingSetting.id, { isPublic: true });
    } else {
      await userSetting.save({
        userId: createdBy,
        isPublic: true,
      });
    }
  }
}
