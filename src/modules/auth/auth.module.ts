import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { AdminSeedService } from './admin-seed.service';
import { AdminCliService } from './admin-cli.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User, OtpCode, Supplier, Buyer } from '../../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, OtpCode, Supplier, Buyer]),
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, OtpService, AdminSeedService, AdminCliService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
