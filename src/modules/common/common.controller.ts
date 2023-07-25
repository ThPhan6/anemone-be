import { Get, Request } from '@nestjs/common';
import { IDataSign } from 'common/types/dataSign.type';
import { BaseController } from 'core/controllers/base.controller';
import { ApiController } from 'core/decorator/apiController.decorator';
import { ApiBaseOkResponse } from 'core/decorator/apiDoc.decorator';
import { AuthRequired } from 'core/decorator/authRequired.decorator';

import { CommonService } from './common.service';
import { GetMeResDto } from './dto/getMe.response';

@ApiController({
  route: 'api/v1',
  tags: 'Common',
})
export class CommonController extends BaseController {
  constructor(private readonly commonService: CommonService) {
    super();
  }

  @AuthRequired()
  @ApiBaseOkResponse({
    description: 'Get me',
    type: GetMeResDto,
  })
  @Get('me')
  async getMe(@Request() { user }: { user: IDataSign }) {
    return this.dataType(GetMeResDto, await this.commonService.getMe(user.userId));
  }
}
