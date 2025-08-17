import { ApiProperty } from '@nestjs/swagger';
import { IsPhoneNumber, IsString, Length, IsOptional } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({ example: '+989121234567' })
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  code: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'john@example.com', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: 'Tehran', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'Tehran Province', required: false })
  @IsOptional()
  @IsString()
  province?: string;
}
