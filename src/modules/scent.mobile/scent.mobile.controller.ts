import {
  Body,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation } from '@nestjs/swagger';

import { MAX_SIZE_UPLOAD_IMAGE } from '../../common/constants/file.constant';
import { BaseController } from '../../core/controllers/base.controller';
import { ApiController } from '../../core/decorator/apiController.decorator';
import { MemberRoleGuard } from '../../core/decorator/auth.decorator';
import { AuthUser } from '../../core/decorator/auth-user.decorator';
import { UserDto } from '../auth/dto/auth-user.dto';
import { CreateScentMobileDto, UpdateScentMobileDto } from './dto/scent-request.mobile.dto';
import { ScentMobileService } from './scent.mobile.service';

@MemberRoleGuard()
@ApiController({
  name: 'scents.mobile',
})
export class ScentMobileController extends BaseController {
  constructor(private readonly scentMobileService: ScentMobileService) {
    super();
  }

  @Get()
  @ApiOperation({ summary: 'Get all scents' })
  async get(@AuthUser() user: UserDto, @Query('search') search?: string) {
    return this.scentMobileService.get(user.sub, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a scent by id' })
  async getById(@Param('id') id: string) {
    return this.scentMobileService.getById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new scent' })
  @UseInterceptors(FileInterceptor('image', { dest: './dist/uploads' }))
  async create(
    @AuthUser() user: UserDto,
    @Body()
    body: CreateScentMobileDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_SIZE_UPLOAD_IMAGE }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
        fileIsRequired: true,
      }),
    )
    image: Express.Multer.File,
  ) {
    const scent = await this.scentMobileService.create(user.sub, body, image);

    return scent;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a scent by id' })
  @UseInterceptors(FileInterceptor('image', { dest: './dist/uploads' }))
  async update(
    @AuthUser() user: UserDto,
    @Param('id') id: string,
    @Body() body: UpdateScentMobileDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_SIZE_UPLOAD_IMAGE }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
        fileIsRequired: false,
      }),
    )
    image: Express.Multer.File,
  ) {
    return this.scentMobileService.update(user.sub, id, body, image);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a scent by id' })
  async delete(@AuthUser() user: UserDto, @Param('id') id: string) {
    return this.scentMobileService.delete(user.sub, id);
  }
}
