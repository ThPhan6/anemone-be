import { Get, Query } from '@nestjs/common';

import { BaseController } from '../../core/controllers/base.controller';
import { ApiController } from '../../core/decorator/apiController.decorator';
import { MemberRoleGuard } from '../../core/decorator/auth.decorator';
import { ApiBaseGetListQueries } from '../../core/types/apiQuery.type';
import { UnifiedSearchService } from './unified-search.service';

@MemberRoleGuard()
@ApiController({
  name: '/unified-search',
})
export class UnifiedSearchController extends BaseController {
  constructor(private readonly unifiedSearchService: UnifiedSearchService) {
    super();
  }

  @Get()
  async get(@Query() queries: ApiBaseGetListQueries) {
    return this.unifiedSearchService.searchAllFlat(queries);
  }
}
