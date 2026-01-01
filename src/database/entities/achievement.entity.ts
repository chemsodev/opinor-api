import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { AchievementType } from './enums';

@Entity('achievements')
export class Achievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: AchievementType,
  })
  type: AchievementType;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ default: 'star' })
  icon: string;

  @Column({ name: 'badge_color', default: '#FFD700' })
  badgeColor: string;

  @Column({ default: 0 })
  progress: number;

  @Column({ name: 'target_value', default: 100 })
  targetValue: number;

  @Column({ name: 'is_unlocked', default: false })
  isUnlocked: boolean;

  @Column({ name: 'unlocked_at', type: 'timestamp', nullable: true })
  unlockedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
