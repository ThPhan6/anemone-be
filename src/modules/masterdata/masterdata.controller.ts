import { Body, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { MessageCode } from 'common/constants/messageCode';
import { BaseController } from 'core/controllers/base.controller';
import { ApiController } from 'core/decorator/apiController.decorator';
import { ApiBaseOkResponse, ApiDataWrapType } from 'core/decorator/apiDoc.decorator';
import { RbacStaff } from 'core/decorator/auth.decorator';

import { SettingType } from '../../common/enums/setting.enum';
import { ApiNotFoundException } from '../../common/types/apiException.type';
import { AuthUser } from '../../core/decorator/auth-user.decorator';
import { UserDto } from '../auth/dto/auth-user.dto';
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
  async create(@Body() body: CreateMasterDataDto, @AuthUser() { isAdmin }: UserDto) {
    if (!isAdmin) {
      body.type = SettingType.CATEGORY;
    }

    return this.dataType(MasterDataCreateResDto, await this.service.createData(body));
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
  async list(@Query() queries: MasterDataGetListQueries, @AuthUser() { isAdmin }: UserDto) {
    if (!isAdmin) {
      queries.type = SettingType.CATEGORY;
    }

    return this.dataType(MasterDataListResDto, await this.service.getList(queries));
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
  async detail(@Param('id') id: number, @AuthUser() { isAdmin }: UserDto) {
    const setting = await this.service.getById(id);
    if (!isAdmin) {
      if (setting.type !== SettingType.CATEGORY) {
        throw new ApiNotFoundException();
      }
    }

    return this.dataType(MasterDataDetailResDto, setting);
  }

  @ApiBaseOkResponse({
    description: 'update a setting',
    type: MasterDataUpdateResDto,
    messageCodeRemark: `
    ${MessageCode.notFound}
    `,
  })
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() body: UpdateMasterDataDto,
    @AuthUser() { isAdmin }: UserDto,
  ) {
    const setting = await this.service.getById(id);
    if (!isAdmin) {
      if (setting.type !== SettingType.CATEGORY) {
        throw new ApiNotFoundException();
      }
    }

    return this.dataType(MasterDataUpdateResDto, await this.service.updateData(id, body));
  }

  @ApiBaseOkResponse({
    description: 'Delete a setting',
    type: MasterDataDeleteResDto,
    messageCodeRemark: `
    ${MessageCode.notFound}
    `,
  })
  @Delete(':id')
  async delete(@Param('id') id: number, @AuthUser() { isAdmin }: UserDto) {
    const setting = await this.service.getById(id);
    if (!isAdmin) {
      if (setting.type !== SettingType.CATEGORY) {
        throw new ApiNotFoundException();
      }
    }

    const result = await this.service.delete(id);

    return this.dataType(MasterDataDeleteResDto, result);
  }
}
