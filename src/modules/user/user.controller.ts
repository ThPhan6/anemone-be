import {
  Body,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation } from '@nestjs/swagger';
import { BaseController } from 'core/controllers/base.controller';
import { ApiController } from 'core/decorator/apiController.decorator';
import { MemberRoleGuard } from 'core/decorator/auth.decorator';
import { UserService } from 'modules/user/service/user.service';

import { MAX_SIZE_UPLOAD_IMAGE } from '../../common/constants/file.constant';
import { AuthUser } from '../../core/decorator/auth-user.decorator';
import { UserDto } from './dto/user.dto';
import { UpdateProfileDto } from './dto/user.request';

@MemberRoleGuard()
@ApiController({
  name: 'users',
})
export class UserController extends BaseController {
  constructor(private readonly service: UserService) {
    super();
  }

  @Get('/me')
  @ApiOperation({ summary: 'Get mobile user profile' })
  getMe(@AuthUser() user: UserDto) {
    return this.service.getMobileProfile(user);
  }

  @Patch('/me')
  @ApiOperation({ summary: 'Update mobile user profile' })
  @UseInterceptors(FileInterceptor('avatar', { dest: './dist/uploads' }))
  updateMe(
    @AuthUser() user: UserDto,
    @Body() body: UpdateProfileDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_SIZE_UPLOAD_IMAGE }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
        fileIsRequired: false,
      }),
    )
    avatar: Express.Multer.File,
  ) {
    return this.service.updateMobileProfile(user.sub, body, avatar);
  }
}
