import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
} from '@nestjs/swagger';
import { QrcodeService } from './qrcode.service';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../../common/decorators';
import { User } from '../../database/entities';

@ApiTags('QR Code')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('qrcode')
export class QrcodeController {
  constructor(private readonly qrcodeService: QrcodeService) {}

  @Get()
  @ApiOperation({
    summary: 'Get QR code',
    description:
      'Returns the QR code image URL and unique code for the business',
  })
  @ApiOkResponse({
    description: 'QR code data',
    schema: {
      example: {
        success: true,
        data: {
          uniqueCode: 'ABC12345',
          qrCodeUrl: 'https://api.opinor.app/qr/ABC12345.png',
          feedbackUrl: 'https://opinor.app/feedback/ABC12345',
        },
      },
    },
  })
  async getQrCode(@CurrentUser() user: User) {
    return this.qrcodeService.getQrCode(user.id);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get QR code statistics',
    description: 'Returns scan count and conversion rate for the QR code',
  })
  @ApiOkResponse({
    description: 'QR code statistics',
    schema: {
      example: {
        success: true,
        data: {
          totalScans: 1250,
          scansToday: 45,
          scansThisWeek: 280,
          scansThisMonth: 890,
          conversionRate: 68.5,
        },
      },
    },
  })
  async getQrCodeStats(@CurrentUser() user: User) {
    return this.qrcodeService.getQrCodeStats(user.id);
  }
}
