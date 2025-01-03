import { Injectable } from '@nestjs/common';
import { Setting } from 'common/entities/setting.entity';
import { SettingRepository } from 'common/repositories/setting.repository';
import { BaseService } from 'core/services/base.service';

import { SettingDataType } from '../../common/enums/setting.enum';
import {
  CreateMasterDataDto,
  MasterDataGetListQueries,
  UpdateMasterDataDto,
} from './dto/masterdata.request';

@Injectable()
export class SettingService extends BaseService<Setting> {
  constructor(repo: SettingRepository) {
    super(repo);
  }

  createData(payload: CreateMasterDataDto) {
    payload.value = this.convertValueByDataType(payload.dataType, payload.value);

    return this.create(payload);
  }

  updateData(id: number, payload: UpdateMasterDataDto) {
    payload.value = this.convertValueByDataType(payload.dataType, payload.value);

    return this.update(id, payload);
  }

  async getList(queries: MasterDataGetListQueries) {
    const results = await this.findAll(queries, undefined, ['name']);
    if (results.items.length) {
      results.items.forEach((item) => {
        item.value = this.getValueByDataType(item.dataType, item.value);
      });
    }

    return results;
  }

  async getById(id: number) {
    const item = await this.findById(id);
    if (item) {
      item.value = this.getValueByDataType(item.dataType, item.value);
    }

    return item;
  }

  getValueByDataType(dataType: SettingDataType, value: string): any {
    switch (dataType) {
      case SettingDataType.NUMBER:
        return Number(value);

      case SettingDataType.BOOLEAN:
        return value === 'true';

      default:
        return value;
    }
  }

  convertValueByDataType(dataType: SettingDataType, value: any) {
    if (dataType === SettingDataType.BOOLEAN) {
      return [true, 'true'].includes(value) ? 'true' : 'false';
    }

    return String(value);
  }
}
