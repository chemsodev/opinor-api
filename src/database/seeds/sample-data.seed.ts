import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  User,
  JoinRequest,
  Feedback,
  BusinessType,
  JoinRequestStatus,
} from '../entities';
import { v4 as uuidv4 } from 'uuid';

export async function seedSampleData(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(User);
  const joinRequestRepository = dataSource.getRepository(JoinRequest);
  const feedbackRepository = dataSource.getRepository(Feedback);

  console.log('\n--- Seeding Sample Data ---\n');

  // Create sample users
  const usersData = [
    {
      email: 'demo@restaurant.com',
      password: 'Demo@123',
      businessName: 'The Golden Fork',
      businessType: BusinessType.RESTAURANT,
      phone: '+1234567890',
      address: '123 Main Street, Downtown',
    },
    {
      email: 'beach@paradise.com',
      password: 'Beach@123',
      businessName: 'Paradise Beach Club',
      businessType: BusinessType.BEACH,
      phone: '+1987654321',
      address: '456 Ocean Drive, Coastal City',
    },
    {
      email: 'clinic@health.com',
      password: 'Clinic@123',
      businessName: 'Wellness Medical Center',
      businessType: BusinessType.CLINIC,
      phone: '+1555666777',
      address: '789 Health Avenue, Medical District',
    },
  ];

  const createdUsers: User[] = [];

  for (const userData of usersData) {
    const existing = await userRepository.findOne({
      where: { email: userData.email },
    });
    if (existing) {
      console.log(`User ${userData.email} already exists`);
      createdUsers.push(existing);
      continue;
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const uniqueCode = uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();

    const user = userRepository.create({
      ...userData,
      password: hashedPassword,
      uniqueCode,
      isActive: true,
    });

    const saved = await userRepository.save(user);
    createdUsers.push(saved);
    console.log(`✓ Created user: ${userData.email} (Code: ${uniqueCode})`);
  }

  // Create sample join requests (pending and rejected)
  const joinRequestsData = [
    {
      email: 'pending1@newbusiness.com',
      businessName: 'New Cafe Opening',
      businessType: BusinessType.RESTAURANT,
      phone: '+1111111111',
      address: '111 New Street',
      status: JoinRequestStatus.PENDING,
    },
    {
      email: 'pending2@upcomingbeach.com',
      businessName: 'Sunset Beach Resort',
      businessType: BusinessType.BEACH,
      phone: '+2222222222',
      address: '222 Beach Road',
      status: JoinRequestStatus.PENDING,
    },
    {
      email: 'rejected@spam.com',
      businessName: 'Spam Business',
      businessType: BusinessType.OTHER,
      phone: '+0000000000',
      address: 'Unknown',
      status: JoinRequestStatus.REJECTED,
    },
  ];

  for (const jrData of joinRequestsData) {
    const existing = await joinRequestRepository.findOne({
      where: { email: jrData.email },
    });
    if (existing) {
      console.log(`Join request for ${jrData.email} already exists`);
      continue;
    }

    const generatedCode = uuidv4()
      .replace(/-/g, '')
      .substring(0, 8)
      .toUpperCase();
    const joinRequest = joinRequestRepository.create({
      ...jrData,
      generatedCode,
    });

    await joinRequestRepository.save(joinRequest);
    console.log(`✓ Created join request: ${jrData.email} (${jrData.status})`);
  }

  // Create sample feedbacks for existing users
  const feedbackComments = [
    {
      rating: 5,
      comment: 'Absolutely amazing experience! Will definitely come back.',
      name: 'John Smith',
    },
    {
      rating: 5,
      comment: 'Best service I have ever received. Highly recommended!',
      name: 'Sarah Johnson',
    },
    {
      rating: 4,
      comment: 'Great food and atmosphere. Service was a bit slow.',
      name: 'Mike Davis',
    },
    {
      rating: 4,
      comment: 'Really enjoyed my visit. Staff was very friendly.',
      name: 'Emily Brown',
    },
    {
      rating: 5,
      comment: 'Perfect in every way. The attention to detail is impressive.',
      name: 'Alex Wilson',
    },
    {
      rating: 3,
      comment: 'Decent experience overall. Room for improvement.',
      name: 'Chris Taylor',
    },
    {
      rating: 5,
      comment: 'Exceeded all my expectations. A must-visit place!',
      name: 'Jessica Martinez',
    },
    {
      rating: 4,
      comment: 'Good quality and fair prices. Would recommend.',
      name: 'David Anderson',
    },
    {
      rating: 5,
      comment: 'Outstanding! The best in town without a doubt.',
      name: 'Lisa Thompson',
    },
    {
      rating: 2,
      comment: 'Not what I expected. Needs improvement in cleanliness.',
      name: 'Robert Garcia',
    },
  ];

  for (const user of createdUsers) {
    // Add 3-5 random feedbacks per user
    const numFeedbacks = Math.floor(Math.random() * 3) + 3;
    const existingFeedbacks = await feedbackRepository.count({
      where: { businessId: user.id },
    });

    if (existingFeedbacks >= 3) {
      console.log(`User ${user.businessName} already has feedbacks`);
      continue;
    }

    for (let i = 0; i < numFeedbacks; i++) {
      const randomFeedback =
        feedbackComments[Math.floor(Math.random() * feedbackComments.length)];
      const feedback = feedbackRepository.create({
        businessId: user.id,
        rating: randomFeedback.rating,
        comment: randomFeedback.comment,
        customerName: randomFeedback.name,
        customerEmail: `${randomFeedback.name.toLowerCase().replace(' ', '.')}@email.com`,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      });

      await feedbackRepository.save(feedback);
    }
    console.log(`✓ Added ${numFeedbacks} feedbacks for ${user.businessName}`);
  }

  console.log('\n--- Sample Data Seeding Complete ---\n');

  // Print summary
  console.log('=== TEST ACCOUNTS ===');
  console.log('');
  console.log('Admin:');
  console.log('  Email: admin@opinor.com');
  console.log('  Password: Admin@123');
  console.log('');
  console.log('Business Users:');
  for (const user of createdUsers) {
    console.log(`  ${user.businessName}:`);
    console.log(`    Email: ${user.email}`);
    console.log(`    Password: (see usersData above)`);
    console.log(`    Business Code: ${user.uniqueCode}`);
  }
  console.log('');
  console.log('Pending Join Requests: 2');
  console.log('Rejected Join Requests: 1');
}
