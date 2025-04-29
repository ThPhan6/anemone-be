import {
  Body,
  Delete,
  FileTypeValidator,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { MAX_SIZE_UPLOAD_IMAGE } from '../../common/constants/file.constant';
import { BaseController } from '../../core/controllers/base.controller';
import { ApiController } from '../../core/decorator/apiController.decorator';
import { AdminRoleGuard } from '../../core/decorator/auth.decorator';
import { CreateScentTagDto, UpdateScentTagDto } from './dto/scent-tag.dto';
import { SettingDefinitionService } from './setting-definition.service';

@AdminRoleGuard()
@ApiController({
  name: 'scent-tags',
  admin: true,
})
@ApiTags('Admin - Scent Tags')
export class ScentTagAdminController extends BaseController {
  constructor(private readonly settingDefinitionService: SettingDefinitionService) {
    super();
  }

  @Post('/')
  @ApiOperation({ summary: 'Create a new scent tag' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  async createScentTag(
    @Body() body: CreateScentTagDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_SIZE_UPLOAD_IMAGE }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    const scentTag = await this.settingDefinitionService.createScentTag(body, file);

    return scentTag;
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Update a scent tag' })
  @ApiParam({ name: 'id', description: 'Scent tag ID to update' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  async updateScentTag(
    @Param('id') id: string,
    @Body() body: UpdateScentTagDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_SIZE_UPLOAD_IMAGE }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    const updated = await this.settingDefinitionService.updateScentTag(id, body, file);

    return updated;
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete a scent tag' })
  @ApiParam({ name: 'id', description: 'Scent tag ID to delete' })
  async deleteScentTag(@Param('id') id: string) {
    const deleted = await this.settingDefinitionService.deleteScentTag(id);

    return deleted;
  }
}
