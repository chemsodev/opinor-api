import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as bcrypt from 'bcrypt';

config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  synchronize: false,
  ssl: true,
});

async function runSeed() {
  try {
    await AppDataSource.initialize();
    console.log('Data Source initialized');

    // Create admin user in the admins table
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await AppDataSource.query(
      `
      INSERT INTO "admins" (email, password, role, "created_at")
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (email) DO UPDATE SET password = $2
    `,
      [process.env.ADMIN_EMAIL || 'admin@opinor.com', hashedPassword, 'ADMIN'],
    );

    console.log('Admin user seeded successfully');
    console.log('Email:', process.env.ADMIN_EMAIL || 'admin@opinor.com');
    console.log('Password: admin123');

    await AppDataSource.destroy();
    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

runSeed();
