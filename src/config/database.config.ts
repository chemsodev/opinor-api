import { registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';

// Helper function to determine if SSL should be used
const shouldUseSSL = () => {
  const host = process.env.DB_HOST || '';
  return (
    process.env.DB_SSL === 'true' ||
    process.env.NODE_ENV === 'production' ||
    host.includes('aivencloud.com') ||
    host.includes('render.com') ||
    host.includes('neon.tech')
  );
};

export const databaseConfig = registerAs('database', () => {
  const useSSL = shouldUseSSL();
  return {
    type: 'postgres' as const,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'opinor',
    entities: [__dirname + '/../database/entities/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
    ssl: useSSL ? { rejectUnauthorized: false } : false,
  };
});

// For CLI migrations
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'opinor',
  entities: [__dirname + '/../database/entities/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  synchronize: false,
  ssl: shouldUseSSL() ? { rejectUnauthorized: false } : false,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
