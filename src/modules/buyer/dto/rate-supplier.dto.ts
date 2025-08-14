import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

export class RateSupplierDto {
  @ApiProperty({ example: 4.5, description: 'Rating from 1 to 5' })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: 'Great service and fast delivery!', required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}
