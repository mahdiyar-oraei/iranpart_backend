import { Injectable } from '@nestjs/common';
import { AdminSeedService } from './admin-seed.service';

@Injectable()
export class AdminCliService {
  constructor(private adminSeedService: AdminSeedService) {}

  async createAdmin(phone: string, email?: string): Promise<void> {
    try {
      const admin = await this.adminSeedService.createAdminUser(phone, email);
      console.log('✅ Admin user created successfully!');
      console.log(`📱 Phone: ${admin.phone}`);
      console.log(`📧 Email: ${admin.email || 'Not provided'}`);
      console.log(`🆔 ID: ${admin.id}`);
      console.log(`👤 Role: ${admin.role}`);
      console.log('\n🔐 The admin can now use OTP authentication to log in.');
    } catch (error) {
      console.error('❌ Failed to create admin user:', error.message);
      process.exit(1);
    }
  }
}
