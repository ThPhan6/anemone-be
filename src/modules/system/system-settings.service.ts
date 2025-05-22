import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { omit, orderBy } from 'lodash';
import { In, Repository } from 'typeorm';

import { SystemSettingsType } from '../../common/enum/system-settings.enum';
import { paginate, transformImageUrls } from '../../common/utils/helper';
import { ApiBaseGetListQueries } from '../../core/types/apiQuery.type';
import { ScentConfigService } from '../scent-config/scent-config.service';
import { SettingDefinition } from './entities/setting-definition.entity';
import { SettingValue } from './entities/setting-value.entity';
import { SettingDefinitionService } from './setting-definition.service';

@Injectable()
export class SystemSettingsService {
  constructor(
    @InjectRepository(SettingDefinition)
    private readonly settingDefinitionRepository: Repository<SettingDefinition>,
    @InjectRepository(SettingValue)
    private readonly settingValueRepository: Repository<SettingValue>,
    private readonly settingDefinitionService: SettingDefinitionService,
    private readonly scentConfigService: ScentConfigService,
  ) {}

  async get(queries: ApiBaseGetListQueries) {
    const { _type, ...restQueries } = queries;

    if (Number(_type) === SystemSettingsType.SCENT_CONFIG) {
      if (queries.page && queries.perPage) {
        return this.scentConfigService.findAll(restQueries);
      }

      return this.scentConfigService.find();
    }

    const { items, pagination } = await paginate(this.settingDefinitionRepository, {
      where: {
        type: Number(_type) as any,
      },
      params: restQueries,
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
        ...omit(question, ['deletedAt', 'values', '_type']),
        settingDefinition: data.map((item) => omit(item, ['deletedAt', 'settingDefinition'])),
      };
    });

    const sortedResult = orderBy(result, [(item) => item.metadata?.index || 0], ['asc']);

    return {
      items: transformImageUrls(sortedResult),
      pagination,
    };
  }

  async getById(id: string, type: SystemSettingsType) {
    if (Number(type) === SystemSettingsType.SCENT_CONFIG) {
      const scentConfig = await this.scentConfigService.findOne({
        where: { id },
      });

      if (!scentConfig) {
        throw new HttpException('Scent config not found', HttpStatus.NOT_FOUND);
      }

      return scentConfig;
    }

    const settingDefinition = await this.settingDefinitionRepository.findOne({
      where: { id },
      relations: ['values'],
    });

    if (!settingDefinition) {
      throw new HttpException('System settings not found', HttpStatus.NOT_FOUND);
    }

    return transformImageUrls(settingDefinition);
  }
}
