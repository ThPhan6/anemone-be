import { Get, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { BaseController } from '../../core/controllers/base.controller';
import { ApiController } from '../../core/decorator/apiController.decorator';
import { StaffRoleGuard } from '../../core/decorator/auth.decorator';
import { ApiBaseGetListQueries } from '../../core/types/apiQuery.type';
import { AlbumAdminService } from './album-admin.service';

@StaffRoleGuard()
@ApiController({
  name: 'albums',
  admin: true,
})
export class AlbumAdminController extends BaseController {
  constructor(private readonly albumAdminService: AlbumAdminService) {
    super();
  }

  @Get()
  @ApiOperation({ summary: 'Get all albums' })
  async get(@Query() queries: ApiBaseGetListQueries) {
    return this.albumAdminService.findAll(queries);
  }
}
