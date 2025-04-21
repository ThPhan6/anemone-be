import * as path from 'path';
import { DataSource } from 'typeorm';

import {
  ESystemDefinitionType,
  SettingDefinition,
} from '../../modules/setting-definition/entities/setting-definition.entity';
import { SettingValue } from '../../modules/setting-definition/entities/setting-value.entity';
import { readFileExcel } from '../utils/file';
import { BaseSeeder } from './base.seeder';

export class QuestionnaireSeeder extends BaseSeeder {
  protected async execute(dataSource: DataSource): Promise<any> {
    const settingDefinitionRepository = dataSource.getRepository(SettingDefinition);

    const systemSettingRepository = dataSource.getRepository(SettingValue);

    const excelData = readFileExcel(path.join(__dirname, '../data/questionnaire.xlsx'));

    // Get first sheet from Excel file
    const data = Object.values(excelData)[0] as Array<{
      question: string;
      answer: string;
    }>;

    for (const row of data) {
      const questionText = row['question'];
      const answer = row['answer'];

      // Create category for question
      const settingDefinition = await settingDefinitionRepository.save({
        name: questionText,
        type: ESystemDefinitionType.QUESTIONNAIRE,
      });

      // Create system settings for answers
      await systemSettingRepository.save({ value: answer, settingDefinition });
    }
  }
}
