import { ApiProperty } from '@nestjs/swagger';

export class PriceBreakdown {
  @ApiProperty({ example: 999.99 })
  basePrice: number;

  @ApiProperty({ example: 10 })
  quantity: number;

  @ApiProperty({ example: 9999.90 })
  subtotal: number;

  @ApiProperty({ example: 10.5 })
  customerGroupDiscount: number;

  @ApiProperty({ example: 999.99 })
  customerGroupDiscountAmount: number;

  @ApiProperty({ example: 5.0 })
  categoryDiscount: number;

  @ApiProperty({ example: 449.995 })
  categoryDiscountAmount: number;

  @ApiProperty({ example: 8549.925 })
  finalPrice: number;

  @ApiProperty({ example: 854.9925 })
  unitPrice: number;
}

export class PriceCalculationResult {
  @ApiProperty({ example: 'product-uuid' })
  productId: string;

  @ApiProperty({ example: 'iPhone 14 Pro' })
  productName: string;

  @ApiProperty({ type: PriceBreakdown })
  breakdown: PriceBreakdown;

  @ApiProperty({ 
    example: [
      'Customer group discount: VIP Customers (10.5%)',
      'Category discount: Electronics minimum order 10 units (5.0%)'
    ]
  })
  appliedDiscounts: string[];

  @ApiProperty({ 
    example: [
      'Base price: $999.99 per unit',
      'Subtotal for 10 units: $9,999.90',
      'Customer group discount (VIP Customers): -$999.99 (10.5%)',
      'Category discount (Electronics - min 10 units): -$449.995 (5.0%)',
      'Final price: $8,549.925 ($854.9925 per unit)'
    ]
  })
  priceExplanation: string[];
}
