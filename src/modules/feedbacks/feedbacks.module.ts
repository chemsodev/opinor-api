import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbacksService } from './feedbacks.service';
import { FeedbacksController } from './feedbacks.controller';
import { Feedback } from '../../database/entities';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Feedback]), UsersModule],
  controllers: [FeedbacksController],
  providers: [FeedbacksService],
  exports: [FeedbacksService],
})
export class FeedbacksModule {}
