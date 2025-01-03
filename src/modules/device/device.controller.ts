import {
  Body,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MessageCode } from 'common/constants/messageCode';
import { BaseController } from 'core/controllers/base.controller';
import { ApiController } from 'core/decorator/apiController.decorator';
import { ApiBaseOkResponse, ApiDataWrapType } from 'core/decorator/apiDoc.decorator';
import { RbacStaff } from 'core/decorator/auth.decorator';

import { DeviceType } from '../../common/enums/device.enum';
import { DeviceService } from './device.service';
import { CreateDeviceDto, DeviceGetListQueries, UpdateDeviceDto } from './dto/device.request';
import {
  DeviceCreateResDto,
  DeviceDeleteResDto,
  DeviceDetailResDto,
  DeviceListItemDto,
  DeviceListResDto,
  DeviceUpdateResDto,
} from './dto/device.response';

@ApiController({
  name: 'devices',
})
@RbacStaff()
export class DeviceController extends BaseController {
  constructor(private readonly service: DeviceService) {
    super();
  }

  @ApiBaseOkResponse({
    description: 'create a item',
    type: DeviceCreateResDto,
    messageCodeRemark: `
    ${MessageCode.permissionDenied}
    `,
  })
  @Post()
  async create(@Body() body: CreateDeviceDto) {
    return this.dataType(
      DeviceCreateResDto,
      await this.service.create({
        ...body,
        type: DeviceType.IOT,
      }),
    );
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file', { dest: './uploads' }))
  async importDevices(@UploadedFile() file: Express.Multer.File) {
    await this.service.importDevicesFromCsv(file);

    return this.ok();
  }

  @ApiBaseOkResponse({
    description: 'Get list items',
    type: DeviceListItemDto,
    wrapType: ApiDataWrapType.pagination,
    messageCodeRemark: `
    ${MessageCode.notFound}
    `,
  })
  @Get()
  async list(@Query() queries: DeviceGetListQueries) {
    return this.dataType(
      DeviceListResDto,
      await this.service.findAll(queries, undefined, ['name']),
    );
  }

  @ApiBaseOkResponse({
    description: 'Get item detail',
    type: DeviceDetailResDto,
    messageCodeRemark: `
    ${MessageCode.notFound}
    ${MessageCode.permissionDenied}
    `,
  })
  @Get(':id')
  async detail(@Param('id') id: string) {
    return this.dataType(DeviceDetailResDto, await this.service.findById(id));
  }

  @ApiBaseOkResponse({
    description: 'update a item',
    type: DeviceUpdateResDto,
    messageCodeRemark: `
    ${MessageCode.notFound}
    `,
  })
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdateDeviceDto) {
    await this.service.update(id, body);

    return this.dataType(DeviceUpdateResDto, this.service.findById(id));
  }

  @ApiBaseOkResponse({
    description: 'Delete a item',
    type: DeviceDeleteResDto,
    messageCodeRemark: `
    ${MessageCode.notFound}
    `,
  })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    const result = await this.service.delete(id);

    return this.dataType(DeviceDeleteResDto, result);
  }
}
