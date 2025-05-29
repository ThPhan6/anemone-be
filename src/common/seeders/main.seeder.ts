import { logger } from 'core/logger/index.logger';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { runSeeder, SeederOptions } from 'typeorm-extension';

import { CountrySeeder } from './country.seeder';
import { ProductVariantSeeder } from './product-variant.seeder';
import { PublicScentSeeder } from './public-scent.seeder';
import { QuestionnaireSeeder } from './questionnaire.seeder';
import { ScentConfigSeeder } from './scent-config.seeder';
import { ScentTagSeeder } from './scent-tag.seeder';

config();

async function runSeeders() {
  const options: SeederOptions = {
    seeds: [
      ScentConfigSeeder,
      QuestionnaireSeeder,
      ScentTagSeeder,
      PublicScentSeeder,
      ProductVariantSeeder,
      CountrySeeder,
    ],
  };

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    entities: ['src/common/entities/*.entity{.ts,.js}', 'src/modules/**/*.entity{.ts,.js}'],
  });

  try {
    await dataSource.initialize();
    for (const seeder of options.seeds) {
      await runSeeder(dataSource, seeder);
    }
    logger.info('Seeding completed successfully');
  } catch (error) {
    logger.error('Seeding failed:', error);
  } finally {
    await dataSource.destroy();
  }
}

runSeeders();
