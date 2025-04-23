import { Body, Delete, Get, Param, Post, Put } from '@nestjs/common';

import { BaseController } from '../../core/controllers/base.controller';
import { ApiController } from '../../core/decorator/apiController.decorator';
import { ApiBaseOkResponse } from '../../core/decorator/apiDoc.decorator';
import { AdminRoleGuard } from '../../core/decorator/auth.decorator';
import { CreateScentConfigDto } from './dto/create-scent-config.dto';
import { UpdateScentConfigDto } from './dto/update-scent-config.dto';
import { ScentConfigService } from './scent-config.service';

@AdminRoleGuard()
@ApiController({
  name: 'scent-configs',
  admin: true,
})
export class ScentConfigAdminController extends BaseController {
  constructor(private readonly scentConfigService: ScentConfigService) {
    super();
  }

  @ApiBaseOkResponse({
    description: 'Get all scent configurations',
  })
  @Get()
  getAll() {
    return this.scentConfigService.find();
  }

  @ApiBaseOkResponse({
    description: 'Get scent configuration by id',
  })
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.scentConfigService.findById(id);
  }

  @ApiBaseOkResponse({
    description: 'Create new scent configuration',
  })
  @Post()
  create(@Body() createScentConfigDto: CreateScentConfigDto) {
    return this.scentConfigService.create(createScentConfigDto);
  }

  @ApiBaseOkResponse({
    description: 'Update scent configuration',
  })
  @Put(':id')
  update(@Param('id') id: string, @Body() updateScentConfigDto: UpdateScentConfigDto) {
    return this.scentConfigService.update(id, updateScentConfigDto);
  }

  @ApiBaseOkResponse({
    description: 'Delete scent configuration',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.scentConfigService.remove(id);
  }
}
