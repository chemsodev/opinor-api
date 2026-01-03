import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface EmailJSResponse {
  status: number;
  text: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly emailjsApiUrl =
    'https://api.emailjs.com/api/v1.0/email/send';
  private readonly serviceId: string;
  private readonly templateId: string;
  private readonly joinRequestTemplateId: string;
  private readonly publicKey: string;
  private readonly privateKey: string;

  constructor(private configService: ConfigService) {
    this.serviceId =
      this.configService.get<string>('mail.emailjsServiceId') || '';
    this.templateId =
      this.configService.get<string>('mail.emailjsTemplateId') || '';
    this.joinRequestTemplateId =
      this.configService.get<string>('mail.emailjsJoinRequestTemplateId') || '';
    this.publicKey =
      this.configService.get<string>('mail.emailjsPublicKey') || '';
    this.privateKey =
      this.configService.get<string>('mail.emailjsPrivateKey') || '';

    this.logger.log(
      `EmailJS config: serviceId=${this.serviceId ? this.serviceId.substring(0, 8) + '***' : 'NOT SET'}, templateId=${this.templateId ? this.templateId.substring(0, 8) + '***' : 'NOT SET'}, joinRequestTemplateId=${this.joinRequestTemplateId ? this.joinRequestTemplateId.substring(0, 8) + '***' : 'NOT SET'}, privateKey=${this.privateKey ? 'SET' : 'NOT SET'}`,
    );
  }

  /**
   * Generate a 6-digit numeric OTP/invitation code
   */
  generateInvitationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send invitation code (OTP) email using EmailJS when join request is approved
   * This code allows the user to complete their registration/sign up
   */
  async sendInvitationCode(
    email: string,
    invitationCode: string,
    validityMinutes: number = 1440, // 24 hours default for invitation codes
  ): Promise<void> {
    const expiryTime = new Date(Date.now() + validityMinutes * 60 * 1000);
    const formattedExpiry = expiryTime.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const templateParams = {
      to_email: email,
      otp_code: invitationCode,
      validity_minutes: validityMinutes.toString(),
      expiry_time: formattedExpiry,
    };

    await this.sendEmailJS(templateParams);
    this.logger.log(`Invitation code email sent to ${email}`);
  }

  /**
   * Send email using EmailJS REST API
   */
  private async sendEmailJS(
    templateParams: Record<string, string>,
    customTemplateId?: string,
  ): Promise<EmailJSResponse> {
    const templateId = customTemplateId || this.templateId;
    try {
      this.logger.log(
        `Sending email via EmailJS to ${templateParams.to_email} using template ${templateId}...`,
      );

      const response = await fetch(this.emailjsApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: this.serviceId,
          template_id: templateId,
          user_id: this.publicKey,
          accessToken: this.privateKey, // Required for server-side requests
          template_params: templateParams,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`EmailJS API error: ${response.status} - ${errorText}`);
      }

      const result = { status: response.status, text: await response.text() };
      this.logger.log(`EmailJS response: ${result.status} - ${result.text}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to send email via EmailJS: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send admin notification email when a new join request is submitted
   * Uses a dedicated EmailJS template for join request notifications
   *
   * Template variables:
   * - to_email: Admin email address
   * - business_name: Name of the business requesting to join
   * - requester_email: Email of the person making the request
   * - phone_number: Phone number (optional)
   * - business_type: Type of business (optional)
   * - address: Business address (optional)
   * - submitted_at: Date/time of submission
   */
  async sendAdminNotification(
    adminEmail: string,
    joinRequestData: {
      email: string;
      businessName: string;
      businessType?: string;
      phoneNumber?: string;
      address?: string;
    },
  ): Promise<void> {
    const templateParams = {
      to_email: adminEmail,
      business_name: joinRequestData.businessName,
      requester_email: joinRequestData.email,
      phone_number: joinRequestData.phoneNumber || 'Not provided',
      business_type: joinRequestData.businessType || 'Not specified',
      address: joinRequestData.address || 'Not provided',
      submitted_at: new Date().toLocaleString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    };

    try {
      // Use dedicated join request template if configured, otherwise fall back to default
      const templateId = this.joinRequestTemplateId || this.templateId;
      await this.sendEmailJS(templateParams, templateId);
      this.logger.log(
        `Admin notification sent to ${adminEmail} for new join request from ${joinRequestData.email}`,
      );
    } catch (error) {
      this.logger.warn(`Failed to send admin notification: ${error.message}`);
      // Don't throw - admin notification failure shouldn't block the join request
    }
  }
}
