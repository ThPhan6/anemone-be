import { Body, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { MessageCode } from 'common/constants/messageCode';
import { BaseController } from 'core/controllers/base.controller';
import { ApiController } from 'core/decorator/apiController.decorator';
import { ApiBaseOkResponse, ApiDataWrapType } from 'core/decorator/apiDoc.decorator';
import { RbacStaff } from 'core/decorator/auth.decorator';

import {
  CreateMasterDataDto,
  MasterDataGetListQueries,
  UpdateMasterDataDto,
} from './dto/masterdata.request';
import {
  MasterDataCreateResDto,
  MasterDataDeleteResDto,
  MasterDataDetailResDto,
  MasterDataListItemDto,
  MasterDataListResDto,
  MasterDataUpdateResDto,
} from './dto/masterdata.response';
import { SettingService } from './setting.service';

@ApiController({
  name: 'masterdata',
})
@RbacStaff()
export class MasterDataController extends BaseController {
  constructor(private readonly service: SettingService) {
    super();
  }

  @ApiBaseOkResponse({
    description: 'create a setting',
    type: MasterDataCreateResDto,
    messageCodeRemark: `
    ${MessageCode.permissionDenied}
    `,
  })
  @Post()
  async create(@Body() body: CreateMasterDataDto) {
    return this.dataType(MasterDataCreateResDto, await this.service.create(body));
  }

  @ApiBaseOkResponse({
    description: 'Get list settings',
    type: MasterDataListItemDto,
    wrapType: ApiDataWrapType.pagination,
    messageCodeRemark: `
    ${MessageCode.notFound}
    `,
  })
  @Get()
  async list(@Query() queries: MasterDataGetListQueries) {
    return this.dataType(
      MasterDataListResDto,
      await this.service.findAll(queries, undefined, ['name']),
    );
  }

  @ApiBaseOkResponse({
    description: 'Get setting detail',
    type: MasterDataDetailResDto,
    messageCodeRemark: `
    ${MessageCode.notFound}
    ${MessageCode.permissionDenied}
    `,
  })
  @Get(':id')
  async detail(@Param('id') id: string) {
    return this.dataType(MasterDataDetailResDto, await this.service.findById(id));
  }

  @ApiBaseOkResponse({
    description: 'update a setting',
    type: MasterDataUpdateResDto,
    messageCodeRemark: `
    ${MessageCode.notFound}
    `,
  })
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdateMasterDataDto) {
    await this.service.update(id, body);

    return this.dataType(MasterDataUpdateResDto, this.service.findById(id));
  }

  @ApiBaseOkResponse({
    description: 'Delete a setting',
    type: MasterDataDeleteResDto,
    messageCodeRemark: `
    ${MessageCode.notFound}
    `,
  })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    const result = await this.service.delete(id);

    return this.dataType(MasterDataDeleteResDto, result);
  }
}
