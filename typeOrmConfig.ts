import { config } from 'dotenv';
import * as path from 'path';

import { DataSource, DataSourceOptions } from 'typeorm';

config();

const configOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [path.join(__dirname, 'src/common/entities/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, 'src/common/migrations/*.{ts,js}')],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: true,
};

export default new DataSource(configOptions);
