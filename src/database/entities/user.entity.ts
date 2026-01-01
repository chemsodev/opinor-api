import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { BusinessType } from './enums';
import { Feedback } from './feedback.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  // Personal info
  @Column({ name: 'first_name', nullable: true })
  firstName: string;

  @Column({ name: 'last_name', nullable: true })
  lastName: string;

  @Column({ nullable: true })
  avatar: string;

  // Business info
  @Column({ name: 'business_name' })
  businessName: string;

  @Column({
    type: 'enum',
    enum: BusinessType,
    name: 'business_type',
  })
  businessType: BusinessType;

  @Column({ name: 'business_category', nullable: true })
  businessCategory: string;

  @Column({ name: 'business_address', nullable: true })
  businessAddress: string;

  @Column({ name: 'business_phone', nullable: true })
  businessPhone: string;

  @Column({ name: 'business_email', nullable: true })
  businessEmail: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ name: 'unique_code', unique: true })
  uniqueCode: string;

  @Column({ name: 'qr_code_url', nullable: true })
  qrCodeUrl: string;

  // Settings
  @Column({ default: 'en' })
  language: string;

  @Column({ default: 'light' })
  theme: string;

  @Column({ name: 'notifications_enabled', default: true })
  notificationsEnabled: boolean;

  @Column({ name: 'email_notifications', default: true })
  emailNotifications: boolean;

  @Column({ name: 'push_notifications', default: true })
  pushNotifications: boolean;

  @Column({ name: 'email_frequency', default: 'daily' })
  emailFrequency: string;

  // Status
  @Column({ name: 'is_active', default: false })
  isActive: boolean;

  @Column({ name: 'is_blocked', default: false })
  isBlocked: boolean;

  @Column({ name: 'blocked_reason', nullable: true })
  blockedReason: string | null;

  @Column({ name: 'blocked_at', type: 'timestamp', nullable: true })
  blockedAt: Date | null;

  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  // Auth tokens
  @Column({ type: 'varchar', name: 'password_reset_token', nullable: true })
  passwordResetToken: string | null;

  @Column({ type: 'timestamp', name: 'password_reset_expires', nullable: true })
  passwordResetExpires: Date | null;

  @Column({ type: 'varchar', name: 'refresh_token', nullable: true })
  refreshToken: string | null;

  // QR Stats
  @Column({ name: 'qr_scans', default: 0 })
  qrScans: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Feedback, (feedback) => feedback.business)
  feedbacks: Feedback[];
}
