import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductCategory, Category, Supplier } from '../../entities';
import { ProductDisplayType, PaymentType } from '../../common/enums';
import { CreateProductDto, UpdateProductDto, AssignCategoryDto } from './dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductCategory)
    private productCategoryRepository: Repository<ProductCategory>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
  ) {}

  async create(createProductDto: CreateProductDto, userId: string): Promise<Product> {
    // Find supplier by userId
    const supplier = await this.supplierRepository.findOne({
      where: { userId },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier profile not found');
    }

    const product = this.productRepository.create({
      ...createProductDto,
      supplierId: supplier.id,
    });

    return this.productRepository.save(product);
  }

  async findAll(filter?: {
    supplierId?: string;
    categoryId?: string;
    search?: string;
    paymentType?: PaymentType;
    favorite?: boolean;
    buyerId?: string;
  }): Promise<Product[]> {
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.supplier', 'supplier')
      .leftJoinAndSelect('product.productCategories', 'productCategories')
      .leftJoinAndSelect('productCategories.category', 'category')
      .where('product.isActive = :isActive', { isActive: true });

    if (filter?.supplierId) {
      queryBuilder.andWhere('product.supplierId = :supplierId', {
        supplierId: filter.supplierId,
      });
    }

    if (filter?.categoryId) {
      queryBuilder.andWhere('category.id = :categoryId', {
        categoryId: filter.categoryId,
      });
    }

    if (filter?.search) {
      queryBuilder.andWhere(
        '(product.name LIKE :search OR product.description LIKE :search)',
        { search: `%${filter.search}%` }
      );
    }

    if (filter?.paymentType) {
      if (filter.paymentType === PaymentType.CASH) {
        queryBuilder.andWhere(
          'product.displayType IN (:...cashTypes)',
          { cashTypes: [ProductDisplayType.SHOW_ALL, ProductDisplayType.CASH_ONLY] }
        );
      } else if (filter.paymentType === PaymentType.CREDIT) {
        queryBuilder.andWhere(
          'product.displayType IN (:...creditTypes)',
          { creditTypes: [ProductDisplayType.SHOW_ALL, ProductDisplayType.CREDIT_ONLY] }
        );
      }
    }

    // Handle favorite filter
    if (filter?.favorite && filter?.buyerId) {
      queryBuilder
        .leftJoin('buyer_favorite_products', 'favorites', 'favorites.productId = product.id')
        .andWhere('favorites.buyerId = :buyerId', { buyerId: filter.buyerId });
    }

    queryBuilder.orderBy('product.displayOrder', 'ASC');

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['supplier', 'productCategories', 'productCategories.category'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, userId: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['supplier'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.supplier.userId !== userId) {
      throw new ForbiddenException('You can only update your own products');
    }

    await this.productRepository.update(id, updateProductDto);
    return this.findOne(id);
  }

  async remove(id: string, userId: string): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['supplier'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.supplier.userId !== userId) {
      throw new ForbiddenException('You can only delete your own products');
    }

    await this.productRepository.remove(product);
  }

  async assignToCategory(
    productId: string,
    assignCategoryDto: AssignCategoryDto,
    userId: string,
  ): Promise<ProductCategory> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['supplier'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.supplier.userId !== userId) {
      throw new ForbiddenException('You can only manage your own products');
    }

    const category = await this.categoryRepository.findOne({
      where: { id: assignCategoryDto.categoryId, supplierId: product.supplierId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check if product is already assigned to this category
    const existingAssignment = await this.productCategoryRepository.findOne({
      where: { productId, categoryId: assignCategoryDto.categoryId },
    });

    if (existingAssignment) {
      throw new ForbiddenException('Product is already assigned to this category');
    }

    const productCategory = this.productCategoryRepository.create({
      productId,
      categoryId: assignCategoryDto.categoryId,
      displayOrder: assignCategoryDto.displayOrder || 0,
      minimumOrderForDiscount: assignCategoryDto.minimumOrderForDiscount,
      discountPercent: assignCategoryDto.discountPercent,
    });

    return this.productCategoryRepository.save(productCategory);
  }

  async removeFromCategory(
    productId: string,
    categoryId: string,
    userId: string,
  ): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['supplier'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.supplier.userId !== userId) {
      throw new ForbiddenException('You can only manage your own products');
    }

    const productCategory = await this.productCategoryRepository.findOne({
      where: { productId, categoryId },
    });

    if (!productCategory) {
      throw new NotFoundException('Product category assignment not found');
    }

    await this.productCategoryRepository.remove(productCategory);
  }

  async updateCategoryAssignment(
    productId: string,
    categoryId: string,
    updateData: Partial<AssignCategoryDto>,
    userId: string,
  ): Promise<ProductCategory> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['supplier'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.supplier.userId !== userId) {
      throw new ForbiddenException('You can only manage your own products');
    }

    const productCategory = await this.productCategoryRepository.findOne({
      where: { productId, categoryId },
    });

    if (!productCategory) {
      throw new NotFoundException('Product category assignment not found');
    }

    await this.productCategoryRepository.update(productCategory.id, updateData);
    
    return this.productCategoryRepository.findOne({
      where: { id: productCategory.id },
      relations: ['product', 'category'],
    });
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.productCategories', 'productCategories')
      .leftJoinAndSelect('product.supplier', 'supplier')
      .where('productCategories.categoryId = :categoryId', { categoryId })
      .andWhere('product.isActive = :isActive', { isActive: true })
      .orderBy('productCategories.displayOrder', 'ASC')
      .getMany();
  }

  async updateDisplayOrder(id: string, displayOrder: number, userId: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['supplier'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.supplier.userId !== userId) {
      throw new ForbiddenException('You can only update your own products');
    }

    product.displayOrder = displayOrder;
    await this.productRepository.save(product);
    
    return this.findOne(id);
  }
}
