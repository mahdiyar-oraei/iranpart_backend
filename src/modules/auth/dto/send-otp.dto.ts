import { ApiProperty } from '@nestjs/swagger';
import { IsPhoneNumber, IsEnum } from 'class-validator';
import { UserRole } from '../../../common/enums';

export class SendOtpDto {
  @ApiProperty({ example: '+989121234567' })
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({ enum: UserRole, example: UserRole.BUYER })
  @IsEnum(UserRole)
  role: UserRole;
}
