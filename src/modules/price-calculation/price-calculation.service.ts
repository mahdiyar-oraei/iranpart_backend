import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductCategory, CustomerGroup, Buyer } from '../../entities';
import { PaymentType } from '../../common/enums';
import { CalculatePriceDto, PriceCalculationResult, PriceBreakdown } from './dto';

@Injectable()
export class PriceCalculationService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductCategory)
    private productCategoryRepository: Repository<ProductCategory>,
    @InjectRepository(CustomerGroup)
    private customerGroupRepository: Repository<CustomerGroup>,
    @InjectRepository(Buyer)
    private buyerRepository: Repository<Buyer>,
  ) {}

  async calculatePrice(calculatePriceDto: CalculatePriceDto): Promise<PriceCalculationResult> {
    const { productId, quantity, paymentType, buyerId, categoryId } = calculatePriceDto;

    // Get product details
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['supplier'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check minimum order requirement
    if (quantity < product.minimumOrderCount) {
      throw new BadRequestException(
        `Minimum order quantity is ${product.minimumOrderCount} units`
      );
    }

    const basePrice = Number(product.price);
    const subtotal = basePrice * quantity;
    
    const breakdown: PriceBreakdown = {
      basePrice,
      quantity,
      subtotal,
      customerGroupDiscount: 0,
      customerGroupDiscountAmount: 0,
      categoryDiscount: 0,
      categoryDiscountAmount: 0,
      finalPrice: subtotal,
      unitPrice: basePrice,
    };

    const appliedDiscounts: string[] = [];
    const priceExplanation: string[] = [];

    priceExplanation.push(`Base price: $${basePrice.toFixed(2)} per unit`);
    priceExplanation.push(`Subtotal for ${quantity} units: $${subtotal.toLocaleString()}`);

    let currentPrice = subtotal;

    // Apply customer group discount if buyer is provided
    if (buyerId) {
      const customerGroupDiscount = await this.getCustomerGroupDiscount(
        buyerId,
        product.supplierId,
        paymentType
      );

      if (customerGroupDiscount.discount > 0) {
        breakdown.customerGroupDiscount = customerGroupDiscount.discount;
        breakdown.customerGroupDiscountAmount = (currentPrice * customerGroupDiscount.discount) / 100;
        currentPrice -= breakdown.customerGroupDiscountAmount;

        appliedDiscounts.push(
          `Customer group discount: ${customerGroupDiscount.groupName} (${customerGroupDiscount.discount}%)`
        );
        priceExplanation.push(
          `Customer group discount (${customerGroupDiscount.groupName}): -$${breakdown.customerGroupDiscountAmount.toFixed(2)} (${customerGroupDiscount.discount}%)`
        );
      }
    }

    // Apply category-specific discount if category is provided
    if (categoryId) {
      const categoryDiscount = await this.getCategoryDiscount(productId, categoryId, quantity);

      if (categoryDiscount.discount > 0) {
        breakdown.categoryDiscount = categoryDiscount.discount;
        breakdown.categoryDiscountAmount = (currentPrice * categoryDiscount.discount) / 100;
        currentPrice -= breakdown.categoryDiscountAmount;

        appliedDiscounts.push(
          `Category discount: ${categoryDiscount.categoryName} minimum order ${categoryDiscount.minimumOrder} units (${categoryDiscount.discount}%)`
        );
        priceExplanation.push(
          `Category discount (${categoryDiscount.categoryName} - min ${categoryDiscount.minimumOrder} units): -$${breakdown.categoryDiscountAmount.toFixed(2)} (${categoryDiscount.discount}%)`
        );
      }
    }

    breakdown.finalPrice = currentPrice;
    breakdown.unitPrice = currentPrice / quantity;

    priceExplanation.push(
      `Final price: $${currentPrice.toLocaleString()} ($${breakdown.unitPrice.toFixed(4)} per unit)`
    );

    return {
      productId,
      productName: product.name,
      breakdown,
      appliedDiscounts,
      priceExplanation,
    };
  }

  private async getCustomerGroupDiscount(
    buyerId: string,
    supplierId: string,
    paymentType: PaymentType
  ): Promise<{ discount: number; groupName: string }> {
    const customerGroup = await this.customerGroupRepository
      .createQueryBuilder('group')
      .leftJoin('group.buyers', 'buyer')
      .where('buyer.id = :buyerId', { buyerId })
      .andWhere('group.supplierId = :supplierId', { supplierId })
      .andWhere('group.paymentType = :paymentType', { paymentType })
      .andWhere('group.isActive = :isActive', { isActive: true })
      .getOne();

    if (customerGroup) {
      return {
        discount: Number(customerGroup.discountPercent),
        groupName: customerGroup.name,
      };
    }

    return { discount: 0, groupName: '' };
  }

  private async getCategoryDiscount(
    productId: string,
    categoryId: string,
    quantity: number
  ): Promise<{ discount: number; categoryName: string; minimumOrder: number }> {
    const productCategory = await this.productCategoryRepository.findOne({
      where: { productId, categoryId },
      relations: ['category'],
    });

    if (
      productCategory &&
      Number(productCategory.discountPercent) > 0 &&
      productCategory.minimumOrderForDiscount &&
      quantity >= productCategory.minimumOrderForDiscount
    ) {
      return {
        discount: Number(productCategory.discountPercent),
        categoryName: productCategory.category.name,
        minimumOrder: productCategory.minimumOrderForDiscount,
      };
    }

    return { discount: 0, categoryName: '', minimumOrder: 0 };
  }

  async calculateBulkPrice(
    productIds: string[],
    quantities: number[],
    paymentType: PaymentType,
    buyerId?: string
  ): Promise<PriceCalculationResult[]> {
    if (productIds.length !== quantities.length) {
      throw new BadRequestException('Product IDs and quantities arrays must have the same length');
    }

    const results: PriceCalculationResult[] = [];

    for (let i = 0; i < productIds.length; i++) {
      const calculation = await this.calculatePrice({
        productId: productIds[i],
        quantity: quantities[i],
        paymentType,
        buyerId,
      });
      results.push(calculation);
    }

    return results;
  }

  async getProductPriceInfo(productId: string): Promise<{
    basePrice: number;
    minimumOrderCount: number;
    unit: string;
    availableDiscounts: any[];
  }> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['productCategories', 'productCategories.category'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const availableDiscounts = [];

    // Get category discounts
    for (const pc of product.productCategories) {
      if (Number(pc.discountPercent) > 0 && pc.minimumOrderForDiscount) {
        availableDiscounts.push({
          type: 'category',
          categoryName: pc.category.name,
          discountPercent: Number(pc.discountPercent),
          minimumOrder: pc.minimumOrderForDiscount,
        });
      }
    }

    return {
      basePrice: Number(product.price),
      minimumOrderCount: product.minimumOrderCount,
      unit: product.unit,
      availableDiscounts,
    };
  }
}
