import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('mail.host'),
      port: this.configService.get('mail.port'),
      secure: false,
      auth: {
        user: this.configService.get('mail.user'),
        pass: this.configService.get('mail.password'),
      },
    });
  }

  private async sendMail(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get('mail.from'),
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${to}: ${subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      throw error;
    }
  }

  async sendJoinRequestConfirmation(
    email: string,
    businessName: string,
    code: string,
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome to Opinor!</h1>
        <p>Dear ${businessName},</p>
        <p>Thank you for submitting your join request. We have received your application and our team is currently reviewing it.</p>
        <p>Your reference code is: <strong>${code}</strong></p>
        <p>You will receive an email notification once your application has been reviewed.</p>
        <br>
        <p>Best regards,</p>
        <p>The Opinor Team</p>
      </div>
    `;
    await this.sendMail(email, 'Opinor - Join Request Received', html);
  }

  async sendNewJoinRequestNotification(
    businessName: string,
    email: string,
    businessType: string,
    code: string,
  ): Promise<void> {
    const adminEmail = this.configService.get('mail.adminNotificationEmail');
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">New Join Request</h1>
        <p>A new business has submitted a join request:</p>
        <ul>
          <li><strong>Business Name:</strong> ${businessName}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Business Type:</strong> ${businessType}</li>
          <li><strong>Code:</strong> ${code}</li>
        </ul>
        <p>Please review this request in the admin dashboard.</p>
      </div>
    `;
    await this.sendMail(adminEmail, 'Opinor - New Join Request', html);
  }

  async sendJoinRequestApproved(
    email: string,
    businessName: string,
    code: string,
  ): Promise<void> {
    const frontendUrl = this.configService.get('app.frontendUrl');
    const registrationLink = `${frontendUrl}/register?code=${code}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Your Application Has Been Approved!</h1>
        <p>Dear ${businessName},</p>
        <p>We are pleased to inform you that your application to join Opinor has been approved.</p>
        <p>To complete your registration, please click the link below:</p>
        <p>
          <a href="${registrationLink}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">
            Complete Registration
          </a>
        </p>
        <p>Or copy this link: ${registrationLink}</p>
        <p>Your invitation code: <strong>${code}</strong></p>
        <br>
        <p>Best regards,</p>
        <p>The Opinor Team</p>
      </div>
    `;
    await this.sendMail(email, 'Opinor - Application Approved', html);
  }

  async sendJoinRequestRejected(
    email: string,
    businessName: string,
    reason?: string,
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Application Status Update</h1>
        <p>Dear ${businessName},</p>
        <p>We regret to inform you that your application to join Opinor has not been approved at this time.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>If you have any questions, please contact our support team.</p>
        <br>
        <p>Best regards,</p>
        <p>The Opinor Team</p>
      </div>
    `;
    await this.sendMail(email, 'Opinor - Application Status Update', html);
  }

  async sendWelcomeEmail(
    email: string,
    businessName: string,
    uniqueCode: string,
  ): Promise<void> {
    const reviewPageUrl = this.configService.get('app.reviewPageUrl');
    const reviewLink = `${reviewPageUrl}/${uniqueCode}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome to Opinor!</h1>
        <p>Dear ${businessName},</p>
        <p>Your account has been successfully created. You can now start collecting customer feedback!</p>
        <p>Your unique review page link: <a href="${reviewLink}">${reviewLink}</a></p>
        <p>Share this link or generate a QR code to let your customers leave reviews.</p>
        <br>
        <h2>Getting Started:</h2>
        <ol>
          <li>Log in to the Opinor mobile app</li>
          <li>Print your QR code from the dashboard</li>
          <li>Place it where customers can see it</li>
          <li>Start receiving feedback!</li>
        </ol>
        <br>
        <p>Best regards,</p>
        <p>The Opinor Team</p>
      </div>
    `;
    await this.sendMail(email, 'Welcome to Opinor!', html);
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get('app.frontendUrl');
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Password Reset Request</h1>
        <p>You have requested to reset your password.</p>
        <p>Click the link below to reset your password:</p>
        <p>
          <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">
            Reset Password
          </a>
        </p>
        <p>Or copy this link: ${resetLink}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this, please ignore this email.</p>
        <br>
        <p>Best regards,</p>
        <p>The Opinor Team</p>
      </div>
    `;
    await this.sendMail(email, 'Opinor - Password Reset', html);
  }
}
