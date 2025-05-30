import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { orderBy } from 'lodash';
import { In, Repository } from 'typeorm';

import { SystemSettingsType } from '../../common/enum/system-settings.enum';
import { SettingDefinitionRepository } from '../../common/repositories/setting-definition.repository';
import { transformFormDataToJson, transformImageUrls } from '../../common/utils/helper';
import { BaseService } from '../../core/services/base.service';
import { ApiBaseGetListQueries } from '../../core/types/apiQuery.type';
import { CreateScentConfigDto, UpdateScentConfigDto } from '../scent-config/dto/scent-config.dto';
import { ScentConfigService } from '../scent-config/scent-config.service';
import { ESystemDefinitionType, SettingDefinition } from './entities/setting-definition.entity';
import { SettingValue } from './entities/setting-value.entity';
import { SettingDefinitionService } from './setting-definition.service';

@Injectable()
export class SystemSettingsAdminService extends BaseService<SettingDefinition> {
  constructor(
    private readonly settingDefinitionRepository: SettingDefinitionRepository,
    @InjectRepository(SettingValue)
    private readonly settingValueRepository: Repository<SettingValue>,
    private readonly settingDefinitionService: SettingDefinitionService,
    private readonly scentConfigService: ScentConfigService,
  ) {
    super(settingDefinitionRepository);
  }

  async get(queries: ApiBaseGetListQueries) {
    const { _type, ...restQueries } = queries;

    switch (Number(_type)) {
      case SystemSettingsType.QUESTIONNAIRE: {
        return this._getSettings({ ...restQueries, type: ESystemDefinitionType.QUESTIONNAIRE });
      }

      case SystemSettingsType.SCENT_TAG: {
        return this._getSettings({ ...restQueries, type: ESystemDefinitionType.SCENT_TAG });
      }

      case SystemSettingsType.SCENT_CONFIG: {
        if (queries.page && queries.perPage) {
          return this.scentConfigService.getAll(restQueries);
        }

        return this.scentConfigService.find();
      }

      case SystemSettingsType.SCENT_NOTES:

      default:
        return;
    }
  }

  async getById(id: string, _type: SystemSettingsType) {
    switch (Number(_type)) {
      case SystemSettingsType.QUESTIONNAIRE:

      case SystemSettingsType.SCENT_TAG:

      case SystemSettingsType.SCENT_NOTES: {
        const item = await super.findById(id);

        return transformImageUrls(item);
      }

      case SystemSettingsType.SCENT_CONFIG: {
        return this.scentConfigService.findById(id);
      }

      default:
        throw new Error('Not support this type');
    }
  }

  async createOne(_type: SystemSettingsType, body: { data?: any }, files?: Express.Multer.File[]) {
    switch (Number(_type)) {
      case SystemSettingsType.SCENT_CONFIG:
        const payload = transformFormDataToJson(CreateScentConfigDto, body.data);

        return this.scentConfigService.createOne(payload, files);

      case SystemSettingsType.SCENT_TAG:
        return this.settingDefinitionService.createScentTag(body.data, files[0]);

      case SystemSettingsType.QUESTIONNAIRE:
        return this.settingDefinitionService.createQuestionnaire(body.data, files);
    }
  }

  async updateOne(id: string, _type: SystemSettingsType, body: { data?: any }, files?: any) {
    switch (Number(_type)) {
      case SystemSettingsType.SCENT_CONFIG:
        const payload = transformFormDataToJson(UpdateScentConfigDto, body.data);
        const { deletedFiles, ...restPayload } = payload;

        return this.scentConfigService.updateOne(id, restPayload, files, deletedFiles);

      case SystemSettingsType.SCENT_TAG:
        return this.settingDefinitionService.updateScentTag(id, body.data, files?.[0]);

      case SystemSettingsType.QUESTIONNAIRE:
        return this.settingDefinitionService.updateQuestionnaire(body.data, files);
    }
  }

  async deleteOne(id: string, type: SystemSettingsType) {
    switch (type) {
      case SystemSettingsType.SCENT_CONFIG:
        return await this.scentConfigService.delete(id);

      case SystemSettingsType.QUESTIONNAIRE:
        return await this.settingDefinitionService.deleteQuestionnaire(id);

      case SystemSettingsType.SCENT_TAG:
        return await this.settingDefinitionService.deleteScentTag(id);
    }
  }

  private async _getSettings(queries: ApiBaseGetListQueries & { type: ESystemDefinitionType }) {
    if (queries.page && queries.perPage) {
      const res = await super.findAll(
        queries,
        {
          values: true,
        },
        ['name'],
      );

      const settingDefinitionIds = res.items.map((item) => item.id);
      const settingValues = await this.settingValueRepository.find({
        where: { settingDefinition: { id: In(settingDefinitionIds) } },
        relations: ['settingDefinition'],
      });

      const settingData = res.items.map((item) => {
        const values = settingValues.filter((v) => v.settingDefinition.id == item.id);

        return {
          ...item,
          values,
        };
      });

      const sortedItems = orderBy(settingData, [(item) => item.metadata?.index || 0], ['asc']);

      return {
        ...res,
        items: transformImageUrls(sortedItems),
      };
    }

    const items = await super.find({ where: { type: queries.type } });

    const settingDefinitionIds = items.map((item) => item.id);

    const settingValues = await this.settingValueRepository.find({
      where: { settingDefinition: { id: In(settingDefinitionIds) } },
      relations: ['settingDefinition'],
    });

    const settingData = items.map((item) => {
      const values = settingValues
        .filter((v) => v.settingDefinition.id == item.id)
        .map((el) => {
          const newEl = { ...el };
          delete newEl.settingDefinition;

          return newEl;
        });

      return {
        ...item,
        values,
      };
    });

    const sortedItems = orderBy(settingData, [(item) => item.metadata?.index || 0], ['asc']);

    return transformImageUrls(sortedItems);
  }
}
