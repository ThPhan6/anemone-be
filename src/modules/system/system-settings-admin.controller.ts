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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { MAX_SIZE_UPLOAD_IMAGE } from '../../common/constants/file.constant';
import { SystemSettingsType } from '../../common/enum/system-settings.enum';
import { BaseController } from '../../core/controllers/base.controller';
import { ApiController } from '../../core/decorator/apiController.decorator';
import { StaffRoleGuard } from '../../core/decorator/auth.decorator';
import { ApiBaseGetListQueries } from '../../core/types/apiQuery.type';
import { CreateSystemSettingDto } from './dto/system-settings.dto';
import { SystemSettingsService } from './system-settings.service';

@StaffRoleGuard()
@ApiController({
  name: 'system-settings',
  admin: true,
})
@ApiTags('Admin - System Settings')
export class SystemSettingsAdminController extends BaseController {
  constructor(private readonly systemSettingsService: SystemSettingsService) {
    super();
  }

  @Get()
  @ApiOperation({ summary: 'Get system settings data' })
  @ApiQuery({
    name: '_type',
    enum: SystemSettingsType,
    description: '1: Questionnaire, 2: Scent Tag, 3: Scent Config',
    type: 'enum',
    required: true,
  })
  get(@Query() queries: ApiBaseGetListQueries) {
    return this.systemSettingsService.get(queries);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get system settings data by id' })
  @ApiQuery({
    name: '_type',
    enum: SystemSettingsType,
    description: '1: Questionnaire, 2: Scent Tag, 3: Scent Config',
    type: 'enum',
    required: true,
  })
  async getById(@Param('id') id: string, @Query() _type: number) {
    const settings = await this.systemSettingsService.getById(id, _type);

    return settings;
  }

  @Post()
  @ApiOperation({ summary: 'Create system settings data' })
  @UseInterceptors(FilesInterceptor('files'))
  @ApiConsumes('multipart/form-data')
  async create(
    @Body() body: CreateSystemSettingDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_SIZE_UPLOAD_IMAGE }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
        fileIsRequired: false,
      }),
    )
    files?: Express.Multer.File[],
  ) {
    const settings = await this.systemSettingsService.create(body, body.type, files);

    return settings;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update entire system setting data' })
  @UseInterceptors(FilesInterceptor('files'))
  @ApiConsumes('multipart/form-data')
  async update(
    @Param('id') id: string,
    @Body() body: CreateSystemSettingDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_SIZE_UPLOAD_IMAGE }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
        fileIsRequired: false,
      }),
    )
    files?: Express.Multer.File[],
  ) {
    const settings = await this.systemSettingsService.update(id, body, body.type, files);

    return settings;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete system setting data' })
  async delete(@Param('id') id: string, @Query('_type') _type: number) {
    await this.systemSettingsService.delete(id, _type);

    return { success: true };
  }
}
