import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceCalculationController } from './price-calculation.controller';
import { PriceCalculationService } from './price-calculation.service';
import { Product, ProductCategory, CustomerGroup, Buyer, Supplier } from '../../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductCategory, CustomerGroup, Buyer, Supplier])],
  controllers: [PriceCalculationController],
  providers: [PriceCalculationService],
  exports: [PriceCalculationService],
})
export class PriceCalculationModule {}
