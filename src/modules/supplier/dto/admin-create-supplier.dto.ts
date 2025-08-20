import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsUrl, IsOptional, IsPhoneNumber } from 'class-validator';

export class AdminCreateSupplierDto {
  // User information
  @ApiProperty({ example: '+989121234567', description: 'Phone number for the supplier user' })
  @IsString()
  @IsPhoneNumber('IR')
  phone: string;

  @ApiProperty({ example: 'supplier@techsolutions.com', required: false })
  @IsOptional()
  @IsEmail()
  userEmail?: string;

  // Supplier information
  @ApiProperty({ example: 'Tech Solutions Inc.', description: 'Supplier company name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'logo.jpg', required: false })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiProperty({ example: 'Leading technology solutions provider', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '+989121234567', required: false })
  @IsOptional()
  @IsString()
  supplierPhone?: string;

  @ApiProperty({ example: 'info@techsolutions.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '12345', required: false })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiProperty({ example: 'Tehran, Iran', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'Tehran', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'Tehran Province', required: false })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiProperty({ example: 'https://techsolutions.com', required: false })
  @IsOptional()
  @IsUrl()
  website?: string;
}
