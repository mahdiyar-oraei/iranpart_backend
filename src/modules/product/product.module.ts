import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { Product, ProductCategory, Category, Supplier } from '../../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductCategory, Category, Supplier])],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
