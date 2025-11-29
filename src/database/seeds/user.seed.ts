import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, Admin, JoinRequest, Feedback, BusinessType } from '../entities';
import { v4 as uuidv4 } from 'uuid';

async function createTestUser() {
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

    const userRepository = dataSource.getRepository(User);

    // Check if user already exists
    const existingUser = await userRepository.findOne({
      where: { email: 'demo@restaurant.com' },
    });

    if (existingUser) {
      console.log('Test user already exists');
      console.log('Email:', existingUser.email);
      console.log('Unique Code:', existingUser.uniqueCode);
      return;
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('Demo@123', 10);
    const uniqueCode = uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();

    const user = userRepository.create({
      email: 'demo@restaurant.com',
      password: hashedPassword,
      businessName: 'Demo Restaurant',
      businessType: BusinessType.RESTAURANT,
      phone: '+1234567890',
      address: '123 Main Street, City',
      uniqueCode: uniqueCode,
      qrCodeUrl: `http://localhost:3001/review/${uniqueCode}`,
      isActive: true,
      isEmailVerified: true,
    });

    await userRepository.save(user);

    console.log('\n✅ Test user created successfully!\n');
    console.log('========================================');
    console.log('Email:        demo@restaurant.com');
    console.log('Password:     Demo@123');
    console.log('Business:     Demo Restaurant');
    console.log('Unique Code:  ' + uniqueCode);
    console.log('Review URL:   http://localhost:3001/review/' + uniqueCode);
    console.log('========================================\n');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

createTestUser();
