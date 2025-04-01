import * as path from 'path';
import { DataSource } from 'typeorm';

import { Category } from '../entities/category.entity';
import { SystemSetting } from '../entities/system-setting.entity';
import { CategoryType } from '../enum/category.enum';
import { readFileExcel } from '../utils/file';
import { BaseSeeder } from './base.seeder';

export class QuestionnaireSeeder extends BaseSeeder {
  protected async execute(dataSource: DataSource): Promise<any> {
    const categoryRepository = dataSource.getRepository(Category);

    const systemSettingRepository = dataSource.getRepository(SystemSetting);

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
      const category = await categoryRepository.save({
        name: questionText,
        type: CategoryType.Questionnaire,
      });

      // Create system settings for answers

      await systemSettingRepository.save({ name: answer, category });
    }
  }
}
