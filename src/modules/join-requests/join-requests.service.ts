import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JoinRequest, JoinRequestStatus } from '../../database/entities';
import { CreateJoinRequestDto, ReviewJoinRequestDto } from './dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class JoinRequestsService {
  constructor(
    @InjectRepository(JoinRequest)
    private readonly joinRequestRepository: Repository<JoinRequest>,
    private readonly mailService: MailService,
  ) {}

  async create(
    createJoinRequestDto: CreateJoinRequestDto,
  ): Promise<JoinRequest> {
    // Check if email already has a pending or approved request
    const existingRequest = await this.joinRequestRepository.findOne({
      where: { email: createJoinRequestDto.email },
      order: { createdAt: 'DESC' },
    });

    if (existingRequest) {
      if (existingRequest.status === JoinRequestStatus.PENDING) {
        throw new ConflictException(
          'A pending request already exists for this email',
        );
      }
      if (
        existingRequest.status === JoinRequestStatus.APPROVED &&
        !existingRequest.isUsed
      ) {
        throw new ConflictException(
          'An approved invitation already exists for this email',
        );
      }
    }

    const generatedCode = this.generateCode();

    const joinRequest = this.joinRequestRepository.create({
      ...createJoinRequestDto,
      generatedCode,
      status: JoinRequestStatus.PENDING,
    });

    const savedRequest = await this.joinRequestRepository.save(joinRequest);

    // Log the request (no email sent to user until approved)
    this.sendJoinRequestEmails(createJoinRequestDto);

    return savedRequest;
  }

  async findByCode(code: string): Promise<JoinRequest | null> {
    return this.joinRequestRepository.findOne({
      where: { generatedCode: code },
    });
  }

  async verifyCode(
    code: string,
  ): Promise<{ valid: boolean; status: string; email?: string }> {
    const joinRequest = await this.findByCode(code);

    if (!joinRequest) {
      return { valid: false, status: 'NOT_FOUND' };
    }

    if (joinRequest.isUsed) {
      return { valid: false, status: 'ALREADY_USED' };
    }

    return {
      valid: joinRequest.status === JoinRequestStatus.APPROVED,
      status: joinRequest.status,
      email: joinRequest.email,
    };
  }

  async markCodeAsUsed(code: string): Promise<void> {
    const joinRequest = await this.findByCode(code);
    if (!joinRequest) {
      throw new NotFoundException('Join request not found');
    }
    await this.joinRequestRepository.update(joinRequest.id, { isUsed: true });
  }

  async review(
    id: string,
    reviewDto: ReviewJoinRequestDto,
    adminId: string,
  ): Promise<JoinRequest> {
    const joinRequest = await this.joinRequestRepository.findOne({
      where: { id },
    });

    if (!joinRequest) {
      throw new NotFoundException('Join request not found');
    }

    if (joinRequest.status !== JoinRequestStatus.PENDING) {
      throw new BadRequestException('This request has already been reviewed');
    }

    joinRequest.status = reviewDto.status;
    joinRequest.reviewedAt = new Date();
    joinRequest.reviewedById = adminId;

    const updatedRequest = await this.joinRequestRepository.save(joinRequest);

    // Send email in background (don't block the response)
    this.sendReviewEmail(joinRequest, reviewDto);

    return updatedRequest;
  }

  async findAll(status?: JoinRequestStatus): Promise<JoinRequest[]> {
    const where = status ? { status } : {};
    return this.joinRequestRepository.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['reviewedBy'],
    });
  }

  async findById(id: string): Promise<JoinRequest> {
    const joinRequest = await this.joinRequestRepository.findOne({
      where: { id },
      relations: ['reviewedBy'],
    });

    if (!joinRequest) {
      throw new NotFoundException('Join request not found');
    }

    return joinRequest;
  }

  private generateCode(): string {
    // Generate 6-digit numeric invitation code (OTP style)
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send join request emails in background (non-blocking)
   * Note: We no longer send the code on creation, only on approval
   * Admin gets notified about new join requests
   */
  private async sendJoinRequestEmails(
    dto: CreateJoinRequestDto,
  ): Promise<void> {
    // Log the join request creation (no email sent to user at this stage)
    console.log(
      `[JoinRequests] New join request from ${dto.email} (${dto.businessName})`,
    );

    // Notify admin about new join request
    const adminEmail = 'hello.opinor@workmail.com';
    await this.mailService.sendAdminNotification(adminEmail, {
      email: dto.email,
      businessName: dto.businessName,
      businessType: dto.businessType,
      phoneNumber: dto.phone,
      address: dto.address,
    });
  }

  /**
   * Send invitation code email when join request is approved
   */
  private async sendReviewEmail(
    joinRequest: JoinRequest,
    reviewDto: ReviewJoinRequestDto,
  ): Promise<void> {
    try {
      if (reviewDto.status === JoinRequestStatus.APPROVED) {
        // Send invitation code via EmailJS OTP template
        await this.mailService.sendInvitationCode(
          joinRequest.email,
          joinRequest.generatedCode,
          1440, // 24 hours validity
        );
        console.log(
          `[JoinRequests] Invitation code sent to ${joinRequest.email}`,
        );
      } else if (reviewDto.status === JoinRequestStatus.REJECTED) {
        // Log rejection (could add a rejection email template later)
        console.log(
          `[JoinRequests] Join request rejected for ${joinRequest.email}: ${reviewDto.rejectionReason || 'No reason provided'}`,
        );
      }
    } catch (error) {
      // Email failed but review was saved - log and continue
      console.warn(
        `[JoinRequests] Review email failed for ${joinRequest.email}:`,
        error.message,
      );
    }
  }
}
