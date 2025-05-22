import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { orderBy } from 'lodash';
import { Repository } from 'typeorm';

import { MESSAGE } from '../../common/constants/message.constant';
import { SystemSettingsType } from '../../common/enum/system-settings.enum';
import { SettingDefinitionRepository } from '../../common/repositories/setting-definition.repository';
import { transformImageUrls } from '../../common/utils/helper';
import { BaseService } from '../../core/services/base.service';
import { ApiBaseGetListQueries } from '../../core/types/apiQuery.type';
import { ScentConfig } from '../scent-config/entities/scent-config.entity';
import { ScentConfigService } from '../scent-config/scent-config.service';
import {
  QuestionnaireAdminCreateDto,
  QuestionnaireAdminUpdateDto,
} from './dto/questionnaire-admin.dto';
import { ESystemDefinitionType, SettingDefinition } from './entities/setting-definition.entity';
import { SettingValue } from './entities/setting-value.entity';
import { SettingDefinitionService } from './setting-definition.service';

@Injectable()
export class SystemSettingsAdminService extends BaseService<SettingDefinition> {
  constructor(
    private readonly settingDefinitionRepository: SettingDefinitionRepository,
    @InjectRepository(SettingValue)
    private readonly settingValueRepository: Repository<SettingValue>,
    private readonly settingDefinitionService: SettingDefinitionService,
    private readonly scentConfigService: ScentConfigService,
  ) {
    super(settingDefinitionRepository);
  }

  async get(queries: ApiBaseGetListQueries) {
    const { _type, ...restQueries } = queries;

    switch (Number(_type)) {
      case SystemSettingsType.QUESTIONNAIRE: {
        return this._getSettings({ ...restQueries, type: ESystemDefinitionType.QUESTIONNAIRE });
      }

      case SystemSettingsType.SCENT_TAG: {
        return this._getSettings({ ...restQueries, type: ESystemDefinitionType.SCENT_TAG });
      }

      case SystemSettingsType.SCENT_CONFIG: {
        if (queries.page && queries.perPage) {
          return this.scentConfigService.findAll(restQueries);
        }

        return this.scentConfigService.find();
      }

      case SystemSettingsType.SCENT_NOTES:

      default:
        return;
    }
  }

  async getById(id: string, _type: SystemSettingsType) {
    switch (Number(_type)) {
      case SystemSettingsType.QUESTIONNAIRE:

      case SystemSettingsType.SCENT_TAG:

      case SystemSettingsType.SCENT_NOTES: {
        const item = await super.findOne({ where: { id } });

        return transformImageUrls(item);
      }

      case SystemSettingsType.SCENT_CONFIG: {
        return this.scentConfigService.findById(id);
      }

      default:
        throw new Error('Not support this type');
    }
  }

  async createOne(data: any, files?: Express.Multer.File[]) {
    switch (Number(data._type)) {
      case SystemSettingsType.SCENT_CONFIG:
        const parseData = JSON.parse(data.data);
        const existingScentConfig = await this.scentConfigService.findOne({
          where: { code: parseData.code },
        });

        if (existingScentConfig) {
          throw new HttpException(MESSAGE.SCENT_CONFIG.CODE_EXISTS, HttpStatus.BAD_REQUEST);
        }

        const newScentConfig = new ScentConfig();

        Object.assign(newScentConfig, parseData);

        return this.scentConfigService.save(newScentConfig);

      case SystemSettingsType.QUESTIONNAIRE:
        try {
          // Parse the questionnaire data - handle different formats
          let questionnairesData: QuestionnaireAdminCreateDto[];

          // Check for data in nested 'data' property (as shown in your example)
          if (data.data) {
            try {
              // Parse the data JSON string
              const parsedData = JSON.parse(data.data);

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
          else if (data.questionnaires) {
            // Handle when it's already a parsed array
            if (Array.isArray(data.questionnaires)) {
              questionnairesData = data.questionnaires;
            }
            // Handle when it's a string that needs parsing
            else if (typeof data.questionnaires === 'string') {
              try {
                questionnairesData = JSON.parse(data.questionnaires);
              } catch (error) {
                throw new HttpException(
                  'Invalid questionnaires data format',
                  HttpStatus.BAD_REQUEST,
                );
              }
            }
            // Handle when it's a single object that might not be in an array
            else if (typeof data.questionnaires === 'object') {
              questionnairesData = [data.questionnaires];
            } else {
              throw new HttpException(
                `Unexpected questionnaires format: ${typeof data.questionnaires}`,
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

      case SystemSettingsType.SCENT_TAG:
        return this.settingDefinitionService.createScentTag(data, files[0]);
    }
  }

  async updateOne(id: string, data: any, files?: Express.Multer.File[]) {
    switch (Number(data._type)) {
      // case SystemSettingsType.SCENT_CONFIG:
      //   // If criteria is a string (id), find the entity first to validate it exists

      //   const scentConfig = await this.scentConfigService.findOne({
      //     where: { id },
      //   });

      //   if (!scentConfig) {
      //     throw new HttpException(MESSAGE.SCENT_CONFIG.NOT_FOUND, HttpStatus.NOT_FOUND);
      //   }

      //   const parseData = JSON.parse(data.data);

      //   return this.scentConfigService.update(id, {
      //     code: parseData.code,
      //     name: parseData.name,
      //     title: parseData.title,
      //     description: parseData.description,
      //     background: parseData.background,
      //     story: parseData.story,
      //     tags: parseData.tags,
      //     notes: parseData.notes,
      //   });

      case SystemSettingsType.QUESTIONNAIRE:
        try {
          // Parse the questionnaire data
          let questionnaire: QuestionnaireAdminUpdateDto;

          // Check for data in nested 'data' property - handle both singular and plural keys
          if (data.data) {
            try {
              const parsedData = JSON.parse(data.data);

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
          else if (data.questionnaires) {
            // Handle plural form (questionnaires)
            if (Array.isArray(data.questionnaires) && data.questionnaires.length > 0) {
              // Take the first questionnaire from the array
              questionnaire = data.questionnaires[0];
            } else if (typeof data.questionnaires === 'string') {
              try {
                const parsed = JSON.parse(data.questionnaires);
                questionnaire = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : parsed;
              } catch (error) {
                throw new HttpException(
                  'Invalid questionnaires data format',
                  HttpStatus.BAD_REQUEST,
                );
              }
            } else if (typeof data.questionnaires === 'object') {
              // Single object in questionnaires
              questionnaire = data.questionnaires;
            }
          }
          // Check for singular questionnaire property (original implementation)
          else if (data.questionnaire) {
            if (typeof data.questionnaire === 'string') {
              try {
                questionnaire = JSON.parse(data.questionnaire);
              } catch (error) {
                throw new HttpException(
                  'Invalid questionnaire data format',
                  HttpStatus.BAD_REQUEST,
                );
              }
            } else if (typeof data.questionnaire === 'object') {
              questionnaire = data.questionnaire;
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

          const result = await this.settingDefinitionService.updateQuestionnaire(
            questionnaire,
            files,
          );

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

      case SystemSettingsType.SCENT_TAG:
        return this.settingDefinitionService.updateScentTag(id, data, files?.[0]);
    }
  }

  async deleteOne(id: string, type: SystemSettingsType) {
    switch (type) {
      case SystemSettingsType.SCENT_CONFIG:
        const scentConfig = await this.scentConfigService.findOne({
          where: { id },
        });

        if (!scentConfig) {
          throw new HttpException(MESSAGE.SCENT_CONFIG.NOT_FOUND, HttpStatus.NOT_FOUND);
        }

        return await this.scentConfigService.delete(id);

      case SystemSettingsType.QUESTIONNAIRE:
        return await this.settingDefinitionService.deleteQuestionnaire(id);

      case SystemSettingsType.SCENT_TAG:
        return await this.settingDefinitionService.deleteScentTag(id);
    }
  }

  private async _getSettings(queries: ApiBaseGetListQueries & { type: ESystemDefinitionType }) {
    if (queries.page && queries.perPage) {
      const res = await super.findAll(
        queries,
        {
          values: true,
        },
        ['name'],
      );

      const sortedItems = orderBy(res.items, [(item) => item.metadata?.index || 0], ['asc']);

      return {
        ...res,
        items: transformImageUrls(sortedItems),
      };
    }

    const items = await super.find({ where: { type: queries.type } });

    const sortedItems = orderBy(items, [(item) => item.metadata?.index || 0], ['asc']);

    return transformImageUrls(sortedItems);
  }
}
