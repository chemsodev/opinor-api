import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Admin, AdminRole } from '../entities';

export async function seedAdmin(dataSource: DataSource): Promise<void> {
  const adminRepository = dataSource.getRepository(Admin);

  // Check if admin already exists
  const existingAdmin = await adminRepository.findOne({
    where: { email: process.env.ADMIN_EMAIL || 'admin@opinor.com' },
  });

  if (existingAdmin) {
    console.log('Admin user already exists');
    return;
  }

  // Create default admin
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  const admin = adminRepository.create({
    email: process.env.ADMIN_EMAIL || 'admin@opinor.com',
    password: hashedPassword,
    role: AdminRole.SUPER_ADMIN,
  });

  await adminRepository.save(admin);
  console.log('Default admin user created');
  console.log('Email:', admin.email);
  console.log('Password: Admin@123 (please change this!)');
}
