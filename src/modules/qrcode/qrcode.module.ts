import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QrcodeController } from './qrcode.controller';
import { QrcodeService } from './qrcode.service';
import { User, Feedback } from '../../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([User, Feedback])],
  controllers: [QrcodeController],
  providers: [QrcodeService],
  exports: [QrcodeService],
})
export class QrcodeModule {}
