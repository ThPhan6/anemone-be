import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { omit, orderBy } from 'lodash';
import { In, Repository } from 'typeorm';

import { SystemSettingsType } from '../../common/enum/system-settings.enum';
import { paginate, transformImageUrls } from '../../common/utils/helper';
import { ApiBaseGetListQueries } from '../../core/types/apiQuery.type';
import { ScentConfig } from '../scent-config/entities/scent-config.entity';
import { SettingDefinition } from '../setting-definition/entities/setting-definition.entity';
import { SettingValue } from '../setting-definition/entities/setting-value.entity';

@Injectable()
export class SystemSettingsService {
  constructor(
    @InjectRepository(SettingDefinition)
    private readonly settingDefinitionRepository: Repository<SettingDefinition>,
    @InjectRepository(SettingValue)
    private readonly settingValueRepository: Repository<SettingValue>,
    @InjectRepository(ScentConfig)
    private readonly scentConfigRepository: Repository<ScentConfig>,
  ) {}

  async get(queries: ApiBaseGetListQueries, type: SystemSettingsType) {
    if (type === SystemSettingsType.SCENT_CONFIG) {
      const { items, pagination } = await paginate(this.scentConfigRepository, {
        params: queries,
      });

      return {
        items: items.map((item) => transformImageUrls(item, ['background', 'image'])),
        pagination,
      };
    }

    const { items, pagination } = await paginate(this.settingDefinitionRepository, {
      where: {
        type: type as any,
      },
      params: queries,
    });

    const values = await this.settingValueRepository.find({
      where: {
        settingDefinition: In(items.map((setting) => setting.id)),
      },
      relations: ['settingDefinition'],
    });

    const result = items.map((question) => {
      const data = values.filter((value) => value.settingDefinition.id === question.id);

      return {
        ...omit(question, ['deletedAt', 'values', 'type']),
        settingDefinition: data.map((item) => omit(item, ['deletedAt', 'settingDefinition'])),
      };
    });

    const sortedResult = orderBy(result, [(item) => item.metadata?.index || 0], ['asc']);

    return {
      items: transformImageUrls(sortedResult),
      pagination,
    };
  }
}
