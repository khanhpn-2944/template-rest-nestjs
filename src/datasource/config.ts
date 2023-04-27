import { config } from 'dotenv';
import { DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';

config();

const isTestEnv = process.env.NODE_ENV === 'test';

export default {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: +process.env.DATABASE_PORT,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: isTestEnv ? process.env.DATABASE_TEST : process.env.DATABASE,
  entities: [
    isTestEnv ? 'src/entities/*.entity.ts' : 'dist/entities/*.entity.js',
  ],
  migrations: ['dist/database/migrations/*.js'],
  migrationsTableName: 'migrations',
  seeds: ['src/database/seeds/*.seed.{ts,js}'],
  factories: ['src/database/factories/*.factory.{ts,js}'],
} as DataSourceOptions & SeederOptions;
