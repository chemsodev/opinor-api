import 'dotenv/config';
import { DataSource } from 'typeorm';
import { seedAdmin } from './admin.seed';
import { User, Admin, JoinRequest, Feedback } from '../entities';

async function runSeeds() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5434', 10),
    username: process.env.DB_USERNAME || 'opinor',
    password: process.env.DB_PASSWORD || 'opinor123',
    database: process.env.DB_NAME || 'opinor',
    entities: [User, Admin, JoinRequest, Feedback],
    synchronize: true,
  });

  try {
    await dataSource.initialize();
    console.log('Database connection established');

    await seedAdmin(dataSource);

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

runSeeds();
