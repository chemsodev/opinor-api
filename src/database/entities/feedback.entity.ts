import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { FeedbackSentiment, FeedbackCategory, FeedbackStatus } from './enums';

@Entity('feedbacks')
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'business_id' })
  businessId: string;

  @ManyToOne(() => User, (user) => user.feedbacks)
  @JoinColumn({ name: 'business_id' })
  business: User;

  @Column({ type: 'decimal', precision: 2, scale: 1 })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ name: 'customer_name', nullable: true })
  customerName: string;

  @Column({ name: 'customer_email', nullable: true })
  customerEmail: string;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  // New fields for mobile app
  @Column({
    type: 'enum',
    enum: FeedbackSentiment,
    default: FeedbackSentiment.NEUTRAL,
  })
  sentiment: FeedbackSentiment;

  @Column({
    type: 'enum',
    enum: FeedbackCategory,
    default: FeedbackCategory.OTHER,
  })
  category: FeedbackCategory;

  @Column({
    type: 'enum',
    enum: FeedbackStatus,
    default: FeedbackStatus.NEW,
  })
  status: FeedbackStatus;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  // Response fields
  @Column({ name: 'response_text', type: 'text', nullable: true })
  responseText: string;

  @Column({ name: 'responded_at', type: 'timestamp', nullable: true })
  respondedAt: Date;

  @Column({ name: 'responded_by', nullable: true })
  respondedBy: string;

  // Helpful counts
  @Column({ default: 0 })
  helpful: number;

  @Column({ default: 0 })
  unhelpful: number;

  @Column({ name: 'is_hidden', default: false })
  isHidden: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
