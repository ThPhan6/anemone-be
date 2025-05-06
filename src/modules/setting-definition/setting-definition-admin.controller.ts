import {
  Body,
  Delete,
  FileTypeValidator,
  Get,
  HttpException,
  HttpStatus,
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
import { ApiConsumes, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { MAX_SIZE_UPLOAD_IMAGE } from '../../common/constants/file.constant';
import { BaseController } from '../../core/controllers/base.controller';
import { ApiController } from '../../core/decorator/apiController.decorator';
import { AdminRoleGuard } from '../../core/decorator/auth.decorator';
import { AuthUser } from '../../core/decorator/auth-user.decorator';
import { ApiBaseGetListQueries } from '../../core/types/apiQuery.type';
import { UserDto } from '../auth/dto/auth-user.dto';
import {
  QuestionnaireAdminCreateDto,
  QuestionnaireAdminUpdateDto,
} from './dto/questionnaire-admin.dto';
import { SettingDefinitionService } from './setting-definition.service';

@AdminRoleGuard()
@ApiController({
  name: 'setting-definitions',
  admin: true,
})
@ApiTags('Admin - Setting Definitions')
export class SettingDefinitionAdminController extends BaseController {
  constructor(private readonly settingDefinitionService: SettingDefinitionService) {
    super();
  }

  @Get('/')
  @ApiOperation({ summary: 'Get all setting definitions' })
  async get(@Query() queries: ApiBaseGetListQueries & { type: string[] }) {
    if (queries.page && queries.perPage) {
      return this.settingDefinitionService.getAllWithPagination(queries);
    }

    return this.settingDefinitionService.getAll(queries.type);
  }

  @Post('/questionnaires')
  @ApiOperation({
    summary: 'Create multiple questionnaires with answers',
  })
  @UseInterceptors(FilesInterceptor('files'))
  @ApiConsumes('multipart/form-data')
  async createQuestionnaires(
    @AuthUser() user: UserDto,
    @Body() body: any,
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
    try {
      // Parse the questionnaire data - handle different formats
      let questionnairesData: QuestionnaireAdminCreateDto[];

      // Check for data in nested 'data' property (as shown in your example)
      if (body.data) {
        try {
          // Parse the data JSON string
          const parsedData = JSON.parse(body.data);

          // Check if the parsed data contains questionnaires
          if (parsedData && parsedData.questionnaires) {
            questionnairesData = parsedData.questionnaires;
          } else {
            throw new HttpException('No questionnaires found in data', HttpStatus.BAD_REQUEST);
          }
        } catch (error) {
          throw new HttpException('Invalid data format', HttpStatus.BAD_REQUEST);
        }
      }
      // Fallback to direct questionnaires property
      else if (body.questionnaires) {
        // Handle when it's already a parsed array
        if (Array.isArray(body.questionnaires)) {
          questionnairesData = body.questionnaires;
        }
        // Handle when it's a string that needs parsing
        else if (typeof body.questionnaires === 'string') {
          try {
            questionnairesData = JSON.parse(body.questionnaires);
          } catch (error) {
            throw new HttpException('Invalid questionnaires data format', HttpStatus.BAD_REQUEST);
          }
        }
        // Handle when it's a single object that might not be in an array
        else if (typeof body.questionnaires === 'object') {
          questionnairesData = [body.questionnaires];
        } else {
          throw new HttpException(
            `Unexpected questionnaires format: ${typeof body.questionnaires}`,
            HttpStatus.BAD_REQUEST,
          );
        }
      } else {
        throw new HttpException(
          'Missing questionnaires data. Expected "data" or "questionnaires" property.',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!questionnairesData || !Array.isArray(questionnairesData)) {
        throw new HttpException('Questionnaires must be an array', HttpStatus.BAD_REQUEST);
      }

      // Create each questionnaire with its associated files
      for (let i = 0; i < questionnairesData.length; i++) {
        await this.settingDefinitionService.createQuestionnaire(questionnairesData[i], files);
      }

      return { success: true };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        error.message || 'Failed to create questionnaires',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('/questionnaires/:id')
  @ApiOperation({ summary: 'Update a questionnaire and its answers' })
  @ApiParam({ name: 'id', description: 'Questionnaire ID to update' })
  @UseInterceptors(FilesInterceptor('files'))
  @ApiConsumes('multipart/form-data')
  async updateQuestionnaire(
    @Param('id') id: string,
    @AuthUser() user: UserDto,
    @Body() body: any,
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
    try {
      // Parse the questionnaire data
      let questionnaire: QuestionnaireAdminUpdateDto;

      // Check for data in nested 'data' property - handle both singular and plural keys
      if (body.data) {
        try {
          const parsedData = JSON.parse(body.data);

          // Try both questionnaires (array) and questionnaire (single) formats
          if (
            parsedData.questionnaires &&
            Array.isArray(parsedData.questionnaires) &&
            parsedData.questionnaires.length > 0
          ) {
            // Take the first item from the questionnaires array
            questionnaire = parsedData.questionnaires[0];
          } else if (parsedData.questionnaire) {
            // Direct questionnaire object
            questionnaire = parsedData.questionnaire;
          } else {
            // Use the parsed data directly
            questionnaire = parsedData;
          }
        } catch (error) {
          throw new HttpException('Invalid data format', HttpStatus.BAD_REQUEST);
        }
      }
      // Check for direct questionnaires or questionnaire property
      else if (body.questionnaires) {
        // Handle plural form (questionnaires)
        if (Array.isArray(body.questionnaires) && body.questionnaires.length > 0) {
          // Take the first questionnaire from the array
          questionnaire = body.questionnaires[0];
        } else if (typeof body.questionnaires === 'string') {
          try {
            const parsed = JSON.parse(body.questionnaires);
            questionnaire = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : parsed;
          } catch (error) {
            throw new HttpException('Invalid questionnaires data format', HttpStatus.BAD_REQUEST);
          }
        } else if (typeof body.questionnaires === 'object') {
          // Single object in questionnaires
          questionnaire = body.questionnaires;
        }
      }
      // Check for singular questionnaire property (original implementation)
      else if (body.questionnaire) {
        if (typeof body.questionnaire === 'string') {
          try {
            questionnaire = JSON.parse(body.questionnaire);
          } catch (error) {
            throw new HttpException('Invalid questionnaire data format', HttpStatus.BAD_REQUEST);
          }
        } else if (typeof body.questionnaire === 'object') {
          questionnaire = body.questionnaire;
        }
      } else {
        throw new HttpException(
          'Missing questionnaire data. Expected "data", "questionnaires", or "questionnaire" property.',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validate we have a questionnaire object
      if (!questionnaire) {
        throw new HttpException('Invalid questionnaire data structure', HttpStatus.BAD_REQUEST);
      }

      // Ensure we have the ID from the URL path
      if (!questionnaire.id) {
        questionnaire.id = id;
      }

      // Verify ID matches path parameter
      if (questionnaire.id !== id) {
        throw new HttpException(
          'Questionnaire ID in body does not match ID in path',
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.settingDefinitionService.updateQuestionnaire(questionnaire, files);

      return { success: result };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        error.message || 'Failed to update questionnaire',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('/questionnaires/:id')
  @ApiOperation({ summary: 'Delete a questionnaire and its answers' })
  @ApiParam({ name: 'id', description: 'Questionnaire ID to delete' })
  async deleteQuestionnaire(@Param('id') id: string) {
    await this.settingDefinitionService.deleteQuestionnaire(id);

    return { success: true };
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get a single setting definition by ID' })
  @ApiParam({ name: 'id', description: 'Setting definition ID' })
  async findOne(@Param('id') id: string) {
    return this.settingDefinitionService.findById(id);
  }
}
