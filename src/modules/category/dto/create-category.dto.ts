import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsUUID } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Electronics' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Electronic products and components', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'category-image.jpg', required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @ApiProperty({ example: 'uuid-of-parent-category', required: false })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
