import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { PaymentType } from '../../../common/enums';

export class CreateCustomerGroupDto {
  @ApiProperty({ example: 'VIP Customers' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Special discount group for VIP customers', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: PaymentType, example: PaymentType.CASH })
  @IsEnum(PaymentType)
  paymentType: PaymentType;

  @ApiProperty({ example: 10.5, description: 'Discount percentage (0-100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent: number;
}
