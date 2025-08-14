import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { OtpCode } from '../../entities';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(OtpCode)
    private otpCodeRepository: Repository<OtpCode>,
    private configService: ConfigService,
  ) {}

  async generateOtp(phone: string): Promise<string> {
    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Calculate expiration time
    const expirationTime = parseInt(this.configService.get<string>('OTP_EXPIRES_IN'));
    const expiresAt = new Date(Date.now() + expirationTime);

    // Invalidate previous OTPs for this phone
    await this.otpCodeRepository.update(
      { phone, isUsed: false },
      { isUsed: true }
    );

    // Save new OTP
    const otpCode = this.otpCodeRepository.create({
      code,
      phone,
      expiresAt,
    });

    await this.otpCodeRepository.save(otpCode);

    // Here you would integrate with SMS service
    // For now, we'll just log it (in production, send via SMS)
    console.log(`OTP for ${phone}: ${code}`);

    return code;
  }

  async verifyOtp(phone: string, code: string): Promise<boolean> {
    const otpCode = await this.otpCodeRepository.findOne({
      where: {
        phone,
        code,
        isUsed: false,
      },
    });

    if (!otpCode) {
      throw new BadRequestException('Invalid OTP code');
    }

    if (otpCode.expiresAt < new Date()) {
      throw new BadRequestException('OTP code has expired');
    }

    // Mark OTP as used
    await this.otpCodeRepository.update(otpCode.id, { isUsed: true });

    return true;
  }
}
