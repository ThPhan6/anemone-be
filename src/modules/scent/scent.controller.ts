import { Body, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { MessageCode } from 'common/constants/messageCode';
import { BaseController } from 'core/controllers/base.controller';
import { ApiController } from 'core/decorator/apiController.decorator';
import { ApiBaseOkResponse, ApiDataWrapType } from 'core/decorator/apiDoc.decorator';
import { RbacStaff } from 'core/decorator/auth.decorator';

import { CreateScentDto, ScentGetListQueries, UpdateScentDto } from './dto/scent.request';
import {
  ScentCreateResDto,
  ScentDeleteResDto,
  ScentDetailResDto,
  ScentListItemDto,
  ScentListResDto,
  ScentUpdateResDto,
} from './dto/scent.response';
import { ScentService } from './scent.service';

@ApiController({
  name: 'scents',
})
@RbacStaff()
export class ScentController extends BaseController {
  constructor(private readonly service: ScentService) {
    super();
  }

  @ApiBaseOkResponse({
    description: 'create a item',
    type: ScentCreateResDto,
    messageCodeRemark: `
    ${MessageCode.permissionDenied}
    `,
  })
  @Post()
  async create(@Body() body: CreateScentDto) {
    return this.dataType(ScentCreateResDto, await this.service.create(body));
  }

  @ApiBaseOkResponse({
    description: 'Get list items',
    type: ScentListItemDto,
    wrapType: ApiDataWrapType.pagination,
    messageCodeRemark: `
    ${MessageCode.notFound}
    `,
  })
  @Get()
  async list(@Query() queries: ScentGetListQueries) {
    return this.dataType(ScentListResDto, await this.service.findAll(queries, undefined, ['name']));
  }

  @ApiBaseOkResponse({
    description: 'Get item detail',
    type: ScentDetailResDto,
    messageCodeRemark: `
    ${MessageCode.notFound}
    ${MessageCode.permissionDenied}
    `,
  })
  @Get(':id')
  async detail(@Param('id') id: string) {
    return this.dataType(ScentDetailResDto, await this.service.findById(id));
  }

  @ApiBaseOkResponse({
    description: 'update a item',
    type: ScentUpdateResDto,
    messageCodeRemark: `
    ${MessageCode.notFound}
    `,
  })
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdateScentDto) {
    await this.service.update(id, body);

    return this.dataType(ScentUpdateResDto, this.service.findById(id));
  }

  @ApiBaseOkResponse({
    description: 'Delete a item',
    type: ScentDeleteResDto,
    messageCodeRemark: `
    ${MessageCode.notFound}
    `,
  })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    const result = await this.service.delete(id);

    return this.dataType(ScentDeleteResDto, result);
  }
}
