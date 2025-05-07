import { Get, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { BaseController } from '../../core/controllers/base.controller';
import { ApiController } from '../../core/decorator/apiController.decorator';
import { ApiBaseGetListQueries } from '../../core/types/apiQuery.type';
import { SystemSettingsService } from './system-settings.service';

@ApiController({
  name: 'system-settings',
})
export class SystemSettingsController extends BaseController {
  constructor(private readonly systemSettingsService: SystemSettingsService) {
    super();
  }

  @Get()
  @ApiOperation({ summary: 'Get app settings data' })
  async get(@Query() queries: ApiBaseGetListQueries, @Query('type') type: number) {
    const settings = await this.systemSettingsService.get(queries, type);

    return settings;
  }
}
