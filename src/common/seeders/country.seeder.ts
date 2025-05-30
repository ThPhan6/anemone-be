import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';

import { Country } from '../entities/country.entity';
import { BaseSeeder } from './base.seeder';

export class CountrySeeder extends BaseSeeder {
  async execute(dataSource: DataSource): Promise<void> {
    const countryRepository = dataSource.getRepository(Country);

    // Read file countries.json
    const filePath = path.join(__dirname, '../../common/data/countries.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(rawData);

    const transformedCountryData = data.map((item: any) => {
      const { id, name, iso2, ...rest } = item;

      return {
        id,
        name,
        code: iso2,
        extra_data: rest,
      };
    });

    const existingRecords = await countryRepository.find();

    for (const country of transformedCountryData) {
      const existingRecord = existingRecords.find((r) => r.id === Number(country.id));

      if (existingRecord) {
        await countryRepository.update(existingRecord.id, country);
      } else {
        await countryRepository.save(country);
      }
    }
  }
}
