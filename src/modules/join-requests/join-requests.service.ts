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
import { v4 as uuidv4 } from 'uuid';

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

    // Send emails in background (don't block the response)
    this.sendJoinRequestEmails(createJoinRequestDto, generatedCode);

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
    return uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
  }

  /**
   * Send join request emails in background (non-blocking)
   */
  private async sendJoinRequestEmails(
    dto: CreateJoinRequestDto,
    generatedCode: string,
  ): Promise<void> {
    try {
      await this.mailService.sendJoinRequestConfirmation(
        dto.email,
        dto.businessName,
        generatedCode,
      );
      await this.mailService.sendNewJoinRequestNotification(
        dto.businessName,
        dto.email,
        dto.businessType,
        generatedCode,
      );
    } catch (error) {
      // Email failed but request was created - log and continue
      console.warn(
        `[JoinRequests] Email sending failed for ${dto.email}:`,
        error.message,
      );
    }
  }

  /**
   * Send review notification email in background (non-blocking)
   */
  private async sendReviewEmail(
    joinRequest: JoinRequest,
    reviewDto: ReviewJoinRequestDto,
  ): Promise<void> {
    try {
      if (reviewDto.status === JoinRequestStatus.APPROVED) {
        await this.mailService.sendJoinRequestApproved(
          joinRequest.email,
          joinRequest.businessName,
          joinRequest.generatedCode,
        );
      } else if (reviewDto.status === JoinRequestStatus.REJECTED) {
        await this.mailService.sendJoinRequestRejected(
          joinRequest.email,
          joinRequest.businessName,
          reviewDto.rejectionReason,
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
