import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuyerController } from './buyer.controller';
import { BuyerService } from './buyer.service';
import { Buyer, User, Supplier, Product, SupplierRating, CustomerGroup } from '../../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Buyer, User, Supplier, Product, SupplierRating, CustomerGroup])],
  controllers: [BuyerController],
  providers: [BuyerService],
  exports: [BuyerService],
})
export class BuyerModule {}
