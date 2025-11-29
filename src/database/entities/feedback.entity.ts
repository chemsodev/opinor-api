import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('feedbacks')
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'business_id' })
  businessId: string;

  @ManyToOne(() => User, (user) => user.feedbacks)
  @JoinColumn({ name: 'business_id' })
  business: User;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ name: 'customer_name', nullable: true })
  customerName: string;

  @Column({ name: 'customer_email', nullable: true })
  customerEmail: string;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'is_hidden', default: false })
  isHidden: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
