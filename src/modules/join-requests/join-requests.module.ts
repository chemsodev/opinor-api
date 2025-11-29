import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JoinRequestsService } from './join-requests.service';
import { JoinRequestsController } from './join-requests.controller';
import { JoinRequest } from '../../database/entities';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([JoinRequest]), MailModule],
  controllers: [JoinRequestsController],
  providers: [JoinRequestsService],
  exports: [JoinRequestsService],
})
export class JoinRequestsModule {}
