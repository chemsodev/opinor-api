import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { AdminRole } from './enums';

@Entity('admins')
export class Admin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: AdminRole,
    default: AdminRole.ADMIN,
  })
  role: AdminRole;

  @Column({ type: 'varchar', name: 'refresh_token', nullable: true })
  refreshToken: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
