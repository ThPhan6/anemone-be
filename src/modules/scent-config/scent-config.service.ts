import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ScentConfigRepository } from 'common/repositories/scent-config.repository';
import { BaseService } from 'core/services/base.service';
import { ApiBaseGetListQueries } from 'core/types/apiQuery.type';
import { Pagination } from 'core/types/response.type';

import { MESSAGE } from '../../common/constants/message.constant';
import { transformImageUrls } from '../../common/utils/helper';
import { CreateScentConfigDto } from './dto/create-scent-config.dto';
import { UpdateScentConfigDto } from './dto/update-scent-config.dto';
import { ScentConfig } from './entities/scent-config.entity';

@Injectable()
export class ScentConfigService extends BaseService<ScentConfig> {
  constructor(private scentConfigRepository: ScentConfigRepository) {
    super(scentConfigRepository);
  }

  async findAll(query: ApiBaseGetListQueries): Promise<Pagination<ScentConfig>> {
    const data = await super.findAll(query, {}, ['code', 'name', 'tags']);

    return {
      ...data,
      items: data.items.map((item) => transformImageUrls(item, ['background', 'image'])),
    };
  }

  async find(): Promise<ScentConfig[]> {
    const data = await super.find();

    return data.map((item) => transformImageUrls(item, ['background', 'image']));
  }

  async findById(id: string): Promise<ScentConfig> {
    const scentConfig = await this.repository.findOne({
      where: { id },
    });

    if (!scentConfig) {
      throw new HttpException(MESSAGE.SCENT_CONFIG.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return scentConfig;
  }

  async create(data: CreateScentConfigDto): Promise<ScentConfig> {
    const existingScentConfig = await this.repository.findOne({
      where: { code: data.code },
    });

    if (existingScentConfig) {
      throw new HttpException(MESSAGE.SCENT_CONFIG.CODE_EXISTS, HttpStatus.BAD_REQUEST);
    }

    const newScentConfig = new ScentConfig();
    Object.assign(newScentConfig, data);

    return this.repository.save(newScentConfig);
  }

  async update(id: string, data: UpdateScentConfigDto) {
    const existingScentConfig = await super.findOne({
      where: { id },
    });

    if (!existingScentConfig) {
      throw new HttpException(MESSAGE.SCENT_CONFIG.NOT_FOUND, HttpStatus.BAD_REQUEST);
    }

    if (existingScentConfig.code.toLowerCase() === data.code.toLowerCase()) {
      throw new HttpException(MESSAGE.SCENT_CONFIG.CODE_EXISTS, HttpStatus.BAD_REQUEST);
    }

    return super.update(id, Object.assign(existingScentConfig, data));
  }

  async save(data: ScentConfig) {
    return this.repository.save(data);
  }
}
