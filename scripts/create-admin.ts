#!/usr/bin/env npx ts-node

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AdminCliService } from '../src/modules/auth/admin-cli.service';

async function createAdmin() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: npm run create-admin <phone> [email]');
    console.log('Example: npm run create-admin +989121234567 admin@iranpart.com');
    process.exit(1);
  }

  const phone = args[0];
  const email = args[1];

  if (!phone.startsWith('+98')) {
    console.error('❌ Phone number must start with +98 (Iran country code)');
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule);
  const adminCliService = app.get(AdminCliService);

  await adminCliService.createAdmin(phone, email);
  
  await app.close();
}

createAdmin().catch(console.error);
