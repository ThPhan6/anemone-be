import {
  Body,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
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
import { ApiBaseGetListQueries } from '../../core/types/apiQuery.type';
import { UserDto } from '../auth/dto/auth-user.dto';
import { CreateScentDto, TestScentDto, UpdateScentDto } from './dto/scent-request.dto';
import { ScentService } from './scent.service';

@MemberRoleGuard()
@ApiController({
  name: 'scents',
})
export class ScentController extends BaseController {
  constructor(private readonly scentService: ScentService) {
    super();
  }

  @Get()
  @ApiOperation({ summary: 'Get all scents' })
  async get(
    @AuthUser() user: UserDto,
    @Query() queries: ApiBaseGetListQueries,
    @Query('isPublic') isPublic: boolean,
  ) {
    return isPublic
      ? this.scentService.getPublic(queries)
      : this.scentService.get(user.sub, queries);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a scent by id' })
  async getById(@Param('id') id: string) {
    return this.scentService.getById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new scent' })
  @UseInterceptors(FileInterceptor('image', { dest: './dist/uploads' }))
  async create(
    @AuthUser() user: UserDto,
    @Body()
    body: CreateScentDto,
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
    const scent = await this.scentService.create(user.sub, body, image);

    return scent;
  }

  @Post('test')
  @ApiOperation({ summary: 'Test scent' })
  async testScent(@Body() body: TestScentDto) {
    return this.scentService.testScent(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Partially update scent data' })
  @UseInterceptors(FileInterceptor('image', { dest: './dist/uploads' }))
  async update(
    @AuthUser() user: UserDto,
    @Param('id') id: string,
    @Body() body: UpdateScentDto,
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
    return this.scentService.update(user.sub, id, body, image);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update entire scent data' })
  @UseInterceptors(FileInterceptor('image', { dest: './dist/uploads' }))
  async replace(
    @AuthUser() user: UserDto,
    @Param('id') id: string,
    @Body() body: CreateScentDto,
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
    return this.scentService.replace(user.sub, id, body, image);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a scent by id' })
  async delete(@AuthUser() user: UserDto, @Param('id') id: string) {
    return this.scentService.delete(user.sub, id);
  }
}
