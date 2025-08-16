import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupplierController } from './supplier.controller';
import { SupplierService } from './supplier.service';
import { Supplier, User, CustomerGroup, SupplierRating, Buyer } from '../../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Supplier, User, CustomerGroup, SupplierRating, Buyer])],
  controllers: [SupplierController],
  providers: [SupplierService],
  exports: [SupplierService],
})
export class SupplierModule {}
