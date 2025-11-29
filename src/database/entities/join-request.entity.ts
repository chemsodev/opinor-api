import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BusinessType, JoinRequestStatus } from './enums';
import { Admin } from './admin.entity';

@Entity('join_requests')
export class JoinRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

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

  @Column({
    type: 'enum',
    enum: JoinRequestStatus,
    default: JoinRequestStatus.PENDING,
  })
  status: JoinRequestStatus;

  @Column({ name: 'generated_code', unique: true })
  generatedCode: string;

  @Column({ name: 'is_used', default: false })
  isUsed: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'reviewed_at', nullable: true })
  reviewedAt: Date;

  @Column({ name: 'reviewed_by', nullable: true })
  reviewedById: string;

  @ManyToOne(() => Admin, { nullable: true })
  @JoinColumn({ name: 'reviewed_by' })
  reviewedBy: Admin;
}
