import { Get, Param, Query } from '@nestjs/common';

import { BaseController } from '../../core/controllers/base.controller';
import { ApiController } from '../../core/decorator/apiController.decorator';
import { ApiBaseOkResponse } from '../../core/decorator/apiDoc.decorator';
import { MemberRoleGuard } from '../../core/decorator/auth.decorator';
import { ApiBaseGetListQueries } from '../../core/types/apiQuery.type';
import { ScentConfigService } from './scent-config.service';

@MemberRoleGuard()
@ApiController({
  name: 'scent-configs',
})
export class ScentConfigController extends BaseController {
  constructor(private readonly scentConfigService: ScentConfigService) {
    super();
  }

  @ApiBaseOkResponse({
    description: 'Get all scent configurations',
  })
  @Get()
  getAll(@Query() queries: ApiBaseGetListQueries) {
    return this.scentConfigService.findAll(queries);
  }

  @ApiBaseOkResponse({
    description: 'Get scent configuration by id',
  })
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.scentConfigService.findById(id);
  }
}
