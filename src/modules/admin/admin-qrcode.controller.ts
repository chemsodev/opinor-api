import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { AdminJwtAuthGuard } from '../auth/guards';
import { QrcodeService } from '../qrcode/qrcode.service';

@ApiTags('Admin - QR Code')
@ApiBearerAuth('access-token')
@UseGuards(AdminJwtAuthGuard)
@Controller('admin/qrcode')
export class AdminQrcodeController {
  constructor(private readonly qrcodeService: QrcodeService) {}

  @Get('business/:businessId')
  @ApiOperation({
    summary: 'Get QR code for a business (admin)',
    description:
      'Returns the QR code image URL and unique code for a specific business',
  })
  @ApiParam({ name: 'businessId', description: 'Business owner ID' })
  @ApiOkResponse({
    description: 'QR code data',
    schema: {
      example: {
        success: true,
        data: {
          id: 'qrcode_uuid',
          businessId: 'uuid',
          qrCode: 'https://api.qrserver.com/...',
          feedbackUrl: 'https://opinor.app/feedback/ABC12345',
          scans: 150,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async getQrCode(@Param('businessId', ParseUUIDPipe) businessId: string) {
    return this.qrcodeService.getQrCode(businessId);
  }

  @Get('business/:businessId/stats')
  @ApiOperation({
    summary: 'Get QR code statistics for a business (admin)',
    description:
      'Returns scan count and conversion rate for a specific business QR code',
  })
  @ApiParam({ name: 'businessId', description: 'Business owner ID' })
  @ApiOkResponse({
    description: 'QR code statistics',
    schema: {
      example: {
        success: true,
        data: {
          qrcodeId: 'qrcode_uuid',
          totalScans: 1250,
          scansThisMonth: 890,
          scansThisWeek: 280,
          scansToday: 45,
          feedbacksGenerated: 962,
          conversionRate: 76.9,
          topLocations: [
            { location: 'Main Branch', scans: 750, percentage: 60.0 },
          ],
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async getQrCodeStats(@Param('businessId', ParseUUIDPipe) businessId: string) {
    return this.qrcodeService.getQrCodeStats(businessId);
  }

  @Post('business/:businessId/regenerate')
  @ApiOperation({
    summary: 'Regenerate QR code for a business (admin)',
    description:
      'Generates a new unique code and QR code for a business (invalidates old one)',
  })
  @ApiParam({ name: 'businessId', description: 'Business owner ID' })
  @ApiOkResponse({
    description: 'New QR code generated',
    schema: {
      example: {
        success: true,
        data: {
          id: 'qrcode_uuid',
          businessId: 'uuid',
          qrCode: 'https://api.qrserver.com/...',
          feedbackUrl: 'https://opinor.app/feedback/XYZ98765',
          scans: 0,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
        message: 'QR Code regenerated successfully',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async regenerateQrCode(
    @Param('businessId', ParseUUIDPipe) businessId: string,
  ) {
    return this.qrcodeService.regenerateQrCode(businessId);
  }
}
