import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AdminSeedService } from './admin-seed.service';
import { SendOtpDto, VerifyOtpDto } from './dto';
import { UserRole } from '../../common/enums';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../../entities';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private adminSeedService: AdminSeedService,
  ) {}

  @Post('send-otp')
  @ApiOperation({ summary: 'Send OTP to phone number' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    return this.authService.sendOtp(sendOtpDto);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP and login existing user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  @Post('register/supplier')
  @ApiOperation({ summary: 'Register new supplier' })
  @ApiResponse({ status: 201, description: 'Supplier registered successfully' })
  async registerSupplier(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.register(verifyOtpDto, UserRole.SUPPLIER);
  }

  @Post('register/buyer')
  @ApiOperation({ summary: 'Register new buyer' })
  @ApiResponse({ status: 201, description: 'Buyer registered successfully' })
  async registerBuyer(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.register(verifyOtpDto, UserRole.BUYER);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  async getProfile(@GetUser() user: User) {
    return this.authService.getProfile(user.id);
  }

  @Get('admin/status')
  @ApiOperation({ summary: 'Check if platform admin exists' })
  @ApiResponse({ status: 200, description: 'Admin status checked successfully' })
  async checkAdminStatus() {
    // This is a public endpoint to check if the system has been initialized with an admin
    return { message: 'Admin status endpoint - check server logs for admin creation details' };
  }
}
