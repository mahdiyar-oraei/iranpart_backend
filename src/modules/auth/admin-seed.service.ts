import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities';
import { UserRole } from '../../common/enums';

@Injectable()
export class AdminSeedService implements OnModuleInit {
  private readonly logger = new Logger(AdminSeedService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.createFirstAdmin();
  }

  async createFirstAdmin(): Promise<void> {
    try {
      const adminPhone = process.env.FIRST_ADMIN_PHONE;
      const adminEmail = process.env.FIRST_ADMIN_EMAIL;

      if (!adminPhone) {
        this.logger.warn('FIRST_ADMIN_PHONE not set in environment variables. Skipping admin creation.');
        return;
      }

      // Check if admin already exists
      const existingAdmin = await this.userRepository.findOne({
        where: [
          { phone: adminPhone },
          { role: UserRole.PLATFORM_ADMIN }
        ],
      });

      if (existingAdmin) {
        this.logger.log('Platform admin already exists. Skipping admin creation.');
        return;
      }

      // Create first admin user
      const admin = this.userRepository.create({
        phone: adminPhone,
        email: adminEmail,
        role: UserRole.PLATFORM_ADMIN,
        isVerified: true,
        isActive: true,
      });

      const savedAdmin = await this.userRepository.save(admin);
      
      this.logger.log(`First platform admin created successfully with ID: ${savedAdmin.id}`);
      this.logger.log(`Admin phone: ${adminPhone}`);
      this.logger.log(`Admin email: ${adminEmail || 'Not provided'}`);
      this.logger.log('The admin can now use OTP authentication to log in.');

    } catch (error) {
      this.logger.error('Failed to create first admin:', error);
    }
  }

  async createAdminUser(phone: string, email?: string): Promise<User> {
    // Check if admin already exists
    const existingAdmin = await this.userRepository.findOne({
      where: { phone },
    });

    if (existingAdmin) {
      throw new Error('User with this phone number already exists');
    }

    // Create admin user
    const admin = this.userRepository.create({
      phone,
      email,
      role: UserRole.PLATFORM_ADMIN,
      isVerified: true,
      isActive: true,
    });

    const savedAdmin = await this.userRepository.save(admin);
    this.logger.log(`Platform admin created: ${phone}`);
    
    return savedAdmin;
  }
}
