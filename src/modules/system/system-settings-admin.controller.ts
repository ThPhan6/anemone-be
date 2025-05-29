import {
  Body,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { SystemSettingsType } from '../../common/enum/system-settings.enum';
import { BaseController } from '../../core/controllers/base.controller';
import { ApiController } from '../../core/decorator/apiController.decorator';
import { StaffRoleGuard } from '../../core/decorator/auth.decorator';
import { ParseJsonPipe } from '../../core/pipes/parse-json.pipe';
import { ApiBaseGetListQueries } from '../../core/types/apiQuery.type';
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
  @UseInterceptors(
    AnyFilesInterceptor({
      dest: './dist/uploads',
    }),
  )
  @ApiConsumes('multipart/form-data')
  create(
    @Query('_type') _type: SystemSettingsType,
    @Body(new ParseJsonPipe(['data'])) body: { data?: any },
    @UploadedFiles()
    files?: Express.Multer.File[],
  ) {
    return this.systemSettingAdminService.createOne(_type, body, files);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update entire system setting data' })
  @UseInterceptors(
    AnyFilesInterceptor({
      dest: './dist/uploads',
    }),
  )
  @ApiConsumes('multipart/form-data')
  update(
    @Param('id') id: string,
    @Query('_type') _type: SystemSettingsType,
    @Body(new ParseJsonPipe(['data'])) body: { data?: any },
    @UploadedFiles()
    files: Express.Multer.File[],
  ) {
    return this.systemSettingAdminService.updateOne(id, _type, body, files);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete system setting data' })
  delete(@Param('id') id: string, @Query('_type') _type: SystemSettingsType) {
    return this.systemSettingAdminService.deleteOne(id, _type);
  }
}
