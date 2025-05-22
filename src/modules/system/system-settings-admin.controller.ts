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
import { SystemSettingsAdminService } from './system-settings-admin.service';

@StaffRoleGuard()
@ApiController({
  name: 'system-settings',
  admin: true,
})
@ApiTags('Admin - System Settings')
export class SystemSettingsAdminController extends BaseController {
  constructor(private readonly systemSettingAdminService: SystemSettingsAdminService) {
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
    return this.systemSettingAdminService.get(queries);
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
  getById(@Param('id') id: string, @Query() type: { _type: SystemSettingsType }) {
    return this.systemSettingAdminService.getById(id, type._type);
  }

  @Post()
  @ApiOperation({ summary: 'Create system settings data' })
  @UseInterceptors(FilesInterceptor('files'))
  @ApiConsumes('multipart/form-data')
  create(
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
    return this.systemSettingAdminService.createOne(body, files);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update entire system setting data' })
  @UseInterceptors(FilesInterceptor('files'))
  @ApiConsumes('multipart/form-data')
  update(
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
    return this.systemSettingAdminService.updateOne(id, body, files);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete system setting data' })
  delete(@Param('id') id: string, @Query('_type') _type: SystemSettingsType) {
    return this.systemSettingAdminService.deleteOne(id, _type);
  }
}
