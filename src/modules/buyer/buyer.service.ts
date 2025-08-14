import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Buyer, Supplier, Product, SupplierRating } from '../../entities';
import { PaymentType } from '../../common/enums';
import { UpdateBuyerDto, RateSupplierDto } from './dto';

@Injectable()
export class BuyerService {
  constructor(
    @InjectRepository(Buyer)
    private buyerRepository: Repository<Buyer>,
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(SupplierRating)
    private supplierRatingRepository: Repository<SupplierRating>,
  ) {}

  async getMyProfile(userId: string): Promise<Buyer> {
    const buyer = await this.buyerRepository.findOne({
      where: { userId },
      relations: ['user', 'favoriteSuppliers', 'favoriteProducts'],
    });

    if (!buyer) {
      throw new NotFoundException('Buyer profile not found');
    }

    return buyer;
  }

  async update(updateBuyerDto: UpdateBuyerDto, userId: string): Promise<Buyer> {
    const buyer = await this.buyerRepository.findOne({
      where: { userId },
    });

    if (!buyer) {
      throw new NotFoundException('Buyer profile not found');
    }

    await this.buyerRepository.update(buyer.id, updateBuyerDto);
    return this.getMyProfile(userId);
  }

  async addSupplierToFavorites(supplierId: string, userId: string): Promise<{ message: string }> {
    const buyer = await this.buyerRepository.findOne({
      where: { userId },
      relations: ['favoriteSuppliers'],
    });

    if (!buyer) {
      throw new NotFoundException('Buyer profile not found');
    }

    const supplier = await this.supplierRepository.findOne({
      where: { id: supplierId },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    // Check if already in favorites
    const isAlreadyFavorite = buyer.favoriteSuppliers.some(fav => fav.id === supplierId);
    if (isAlreadyFavorite) {
      throw new BadRequestException('Supplier is already in favorites');
    }

    buyer.favoriteSuppliers.push(supplier);
    await this.buyerRepository.save(buyer);

    return { message: 'Supplier added to favorites' };
  }

  async removeSupplierFromFavorites(supplierId: string, userId: string): Promise<{ message: string }> {
    const buyer = await this.buyerRepository.findOne({
      where: { userId },
      relations: ['favoriteSuppliers'],
    });

    if (!buyer) {
      throw new NotFoundException('Buyer profile not found');
    }

    buyer.favoriteSuppliers = buyer.favoriteSuppliers.filter(supplier => supplier.id !== supplierId);
    await this.buyerRepository.save(buyer);

    return { message: 'Supplier removed from favorites' };
  }

  async addProductToFavorites(productId: string, userId: string): Promise<{ message: string }> {
    const buyer = await this.buyerRepository.findOne({
      where: { userId },
      relations: ['favoriteProducts'],
    });

    if (!buyer) {
      throw new NotFoundException('Buyer profile not found');
    }

    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if already in favorites
    const isAlreadyFavorite = buyer.favoriteProducts.some(fav => fav.id === productId);
    if (isAlreadyFavorite) {
      throw new BadRequestException('Product is already in favorites');
    }

    buyer.favoriteProducts.push(product);
    await this.buyerRepository.save(buyer);

    return { message: 'Product added to favorites' };
  }

  async removeProductFromFavorites(productId: string, userId: string): Promise<{ message: string }> {
    const buyer = await this.buyerRepository.findOne({
      where: { userId },
      relations: ['favoriteProducts'],
    });

    if (!buyer) {
      throw new NotFoundException('Buyer profile not found');
    }

    buyer.favoriteProducts = buyer.favoriteProducts.filter(product => product.id !== productId);
    await this.buyerRepository.save(buyer);

    return { message: 'Product removed from favorites' };
  }

  async getFavoriteSuppliers(userId: string): Promise<Supplier[]> {
    const buyer = await this.buyerRepository.findOne({
      where: { userId },
      relations: ['favoriteSuppliers', 'favoriteSuppliers.ratings'],
    });

    if (!buyer) {
      throw new NotFoundException('Buyer profile not found');
    }

    return buyer.favoriteSuppliers;
  }

  async getFavoriteProducts(userId: string): Promise<Product[]> {
    const buyer = await this.buyerRepository.findOne({
      where: { userId },
      relations: ['favoriteProducts', 'favoriteProducts.supplier'],
    });

    if (!buyer) {
      throw new NotFoundException('Buyer profile not found');
    }

    return buyer.favoriteProducts;
  }

  async rateSupplier(
    supplierId: string,
    rateSupplierDto: RateSupplierDto,
    userId: string,
  ): Promise<SupplierRating> {
    const buyer = await this.buyerRepository.findOne({
      where: { userId },
    });

    if (!buyer) {
      throw new NotFoundException('Buyer profile not found');
    }

    const supplier = await this.supplierRepository.findOne({
      where: { id: supplierId },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    // Check if buyer has already rated this supplier
    const existingRating = await this.supplierRatingRepository.findOne({
      where: { supplierId, buyerId: buyer.id },
    });

    if (existingRating) {
      // Update existing rating
      await this.supplierRatingRepository.update(existingRating.id, rateSupplierDto);
      return this.supplierRatingRepository.findOne({
        where: { id: existingRating.id },
        relations: ['supplier', 'buyer'],
      });
    } else {
      // Create new rating
      const rating = this.supplierRatingRepository.create({
        ...rateSupplierDto,
        supplierId,
        buyerId: buyer.id,
      });

      return this.supplierRatingRepository.save(rating);
    }
  }

  async getMyRatings(userId: string): Promise<SupplierRating[]> {
    const buyer = await this.buyerRepository.findOne({
      where: { userId },
    });

    if (!buyer) {
      throw new NotFoundException('Buyer profile not found');
    }

    return this.supplierRatingRepository.find({
      where: { buyerId: buyer.id },
      relations: ['supplier'],
      order: { createdAt: 'DESC' },
    });
  }

  async searchSuppliers(filter: {
    search?: string;
    paymentType?: PaymentType;
    favoritesOnly?: boolean;
    userId?: string;
  }): Promise<Supplier[]> {
    const queryBuilder = this.supplierRepository
      .createQueryBuilder('supplier')
      .leftJoinAndSelect('supplier.user', 'user')
      .leftJoinAndSelect('supplier.ratings', 'ratings')
      .where('supplier.isActive = :isActive', { isActive: true });

    if (filter.search) {
      queryBuilder.andWhere(
        '(supplier.name LIKE :search OR supplier.description LIKE :search)',
        { search: `%${filter.search}%` }
      );
    }

    if (filter.favoritesOnly && filter.userId) {
      const buyer = await this.buyerRepository.findOne({
        where: { userId: filter.userId },
      });

      if (buyer) {
        queryBuilder
          .leftJoin('buyer_favorite_suppliers', 'favorites', 'favorites.supplierId = supplier.id')
          .andWhere('favorites.buyerId = :buyerId', { buyerId: buyer.id });
      }
    }

    return queryBuilder.getMany();
  }
}
