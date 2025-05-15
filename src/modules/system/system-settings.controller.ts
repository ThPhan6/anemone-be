import { Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';

import { SystemSettingsType } from '../../common/enum/system-settings.enum';
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
  @ApiQuery({
    name: 'type',
    enum: SystemSettingsType,
    description: '1: Questionnaire, 2: Scent Tag, 3: Scent Config',
    type: 'enum',
    required: true,
  })
  async get(@Query() queries: ApiBaseGetListQueries) {
    const newQueries = { ...queries };
    newQueries._type = queries.type;
    delete newQueries.type;
    const settings = await this.systemSettingsService.get(newQueries);

    return settings;
  }
}
