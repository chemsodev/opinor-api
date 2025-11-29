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

  @Column({ name: 'business_name' })
  businessName: string;

  @Column({
    type: 'enum',
    enum: BusinessType,
    name: 'business_type',
  })
  businessType: BusinessType;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ name: 'unique_code', unique: true })
  uniqueCode: string;

  @Column({ name: 'qr_code_url', nullable: true })
  qrCodeUrl: string;

  @Column({ name: 'is_active', default: false })
  isActive: boolean;

  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  @Column({ type: 'varchar', name: 'password_reset_token', nullable: true })
  passwordResetToken: string | null;

  @Column({ type: 'timestamp', name: 'password_reset_expires', nullable: true })
  passwordResetExpires: Date | null;

  @Column({ type: 'varchar', name: 'refresh_token', nullable: true })
  refreshToken: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Feedback, (feedback) => feedback.business)
  feedbacks: Feedback[];
}
