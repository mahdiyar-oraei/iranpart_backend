import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsOptional, IsEnum, IsObject, Min } from 'class-validator';
import { ProductDisplayType } from '../../../common/enums';

export class CreateProductDto {
  @ApiProperty({ example: 'iPhone 14 Pro' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Latest iPhone with advanced features', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: ['image1.jpg', 'image2.jpg'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ 
    example: { color: 'Space Gray', storage: '256GB', warranty: '1 year' },
    required: false 
  })
  @IsOptional()
  @IsObject()
  attributes?: Record<string, any>;

  @ApiProperty({ example: 999.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 'piece' })
  @IsString()
  unit: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  minimumOrderCount?: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  countInPack?: number;

  @ApiProperty({ 
    enum: ProductDisplayType, 
    example: ProductDisplayType.SHOW_ALL,
    required: false 
  })
  @IsOptional()
  @IsEnum(ProductDisplayType)
  displayType?: ProductDisplayType;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;
}
