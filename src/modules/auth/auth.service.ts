import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User, Supplier, Buyer } from '../../entities';
import { UserRole } from '../../common/enums';
import { OtpService } from './otp.service';
import { SendOtpDto, VerifyOtpDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
    @InjectRepository(Buyer)
    private buyerRepository: Repository<Buyer>,
    private jwtService: JwtService,
    private otpService: OtpService,
  ) {}

  async sendOtp(sendOtpDto: SendOtpDto): Promise<{ message: string }> {
    const { phone, role } = sendOtpDto;

    // Generate and send OTP
    await this.otpService.generateOtp(phone);

    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{ accessToken: string; user: any }> {
    const { phone, code, name, email } = verifyOtpDto;

    // Verify OTP
    await this.otpService.verifyOtp(phone, code);

    // Find or create user
    let user = await this.userRepository.findOne({
      where: { phone },
      relations: ['supplier', 'buyer'],
    });

    if (!user) {
      throw new BadRequestException('User registration required. Please provide name and role.');
    }

    // Generate JWT token
    const payload = { sub: user.id, phone: user.phone, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        role: user.role,
        supplier: user.supplier,
        buyer: user.buyer,
      },
    };
  }

  async register(verifyOtpDto: VerifyOtpDto, role: UserRole): Promise<{ accessToken: string; user: any }> {
    const { phone, code, name, email, city, province } = verifyOtpDto;

    // Verify OTP
    await this.otpService.verifyOtp(phone, code);

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { phone } });
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    // Create user
    const user = this.userRepository.create({
      phone,
      email,
      role,
      isVerified: true,
    });

    const savedUser = await this.userRepository.save(user);

    // Create role-specific profile
    if (role === UserRole.SUPPLIER) {
      const supplier = this.supplierRepository.create({
        name: name || 'Unnamed Supplier',
        email,
        city,
        province,
        userId: savedUser.id,
      });
      await this.supplierRepository.save(supplier);
    } else if (role === UserRole.BUYER) {
      const buyer = this.buyerRepository.create({
        name: name || 'Unnamed Buyer',
        email,
        city,
        province,
        userId: savedUser.id,
      });
      await this.buyerRepository.save(buyer);
    }

    // Get updated user with relations
    const userWithRelations = await this.userRepository.findOne({
      where: { id: savedUser.id },
      relations: ['supplier', 'buyer'],
    });

    // Generate JWT token
    const payload = { sub: savedUser.id, phone: savedUser.phone, role: savedUser.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: userWithRelations.id,
        phone: userWithRelations.phone,
        email: userWithRelations.email,
        role: userWithRelations.role,
        supplier: userWithRelations.supplier,
        buyer: userWithRelations.buyer,
      },
    };
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['supplier', 'buyer'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
