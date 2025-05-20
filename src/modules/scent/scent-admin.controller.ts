import { Get, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { BaseController } from '../../core/controllers/base.controller';
import { ApiController } from '../../core/decorator/apiController.decorator';
import { StaffRoleGuard } from '../../core/decorator/auth.decorator';
import { ApiBaseGetListQueries } from '../../core/types/apiQuery.type';
import { ScentService } from './scent.service';

@StaffRoleGuard()
@ApiController({
  name: 'scents',
  admin: true,
})
export class ScentAdminController extends BaseController {
  constructor(private readonly scentService: ScentService) {
    super();
  }

  @Get()
  @ApiOperation({ summary: 'Get all scents' })
  async get(@Query() queries: ApiBaseGetListQueries) {
    return this.scentService.findAll(queries);
  }
}
