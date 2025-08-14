import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PriceCalculationService } from './price-calculation.service';
import { CalculatePriceDto, PriceCalculationResult } from './dto';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../../entities';

@ApiTags('Price Calculation')
@Controller('price-calculation')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class PriceCalculationController {
  constructor(private priceCalculationService: PriceCalculationService) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate product price with discounts' })
  @ApiResponse({ 
    status: 200, 
    description: 'Price calculated successfully',
    type: PriceCalculationResult
  })
  async calculatePrice(
    @Body() calculatePriceDto: CalculatePriceDto,
    @GetUser() user: User,
  ): Promise<PriceCalculationResult> {
    // Set buyerId if user is a buyer and not provided in DTO
    if (user.buyer && !calculatePriceDto.buyerId) {
      calculatePriceDto.buyerId = user.buyer.id;
    }

    return this.priceCalculationService.calculatePrice(calculatePriceDto);
  }

  @Post('calculate-bulk')
  @ApiOperation({ summary: 'Calculate prices for multiple products' })
  @ApiResponse({ 
    status: 200, 
    description: 'Bulk prices calculated successfully',
    type: [PriceCalculationResult]
  })
  async calculateBulkPrice(
    @Body() bulkCalculateDto: {
      productIds: string[];
      quantities: number[];
      paymentType: string;
      buyerId?: string;
    },
    @GetUser() user: User,
  ): Promise<PriceCalculationResult[]> {
    // Set buyerId if user is a buyer and not provided in DTO
    const buyerId = user.buyer && !bulkCalculateDto.buyerId ? user.buyer.id : bulkCalculateDto.buyerId;

    return this.priceCalculationService.calculateBulkPrice(
      bulkCalculateDto.productIds,
      bulkCalculateDto.quantities,
      bulkCalculateDto.paymentType as any,
      buyerId,
    );
  }

  @Get('product/:productId/info')
  @ApiOperation({ summary: 'Get product price information and available discounts' })
  @ApiResponse({ status: 200, description: 'Product price info retrieved successfully' })
  async getProductPriceInfo(@Param('productId') productId: string) {
    return this.priceCalculationService.getProductPriceInfo(productId);
  }
}
