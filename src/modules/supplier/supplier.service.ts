import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier, CustomerGroup, SupplierRating, User, Buyer } from '../../entities';
import { PaymentType } from '../../common/enums';
import { UpdateSupplierDto, CreateCustomerGroupDto, UpdateCustomerGroupDto } from './dto';

@Injectable()
export class SupplierService {
  constructor(
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
    @InjectRepository(CustomerGroup)
    private customerGroupRepository: Repository<CustomerGroup>,
    @InjectRepository(SupplierRating)
    private supplierRatingRepository: Repository<SupplierRating>,
    @InjectRepository(Buyer)
    private buyerRepository: Repository<Buyer>,
  ) {}

  async findAll(
    filter?: { paymentType?: PaymentType; search?: string },
    user?: User,
  ): Promise<(Supplier & { discountPercent: number })[]> {
    const queryBuilder = this.supplierRepository
      .createQueryBuilder('supplier')
      .leftJoinAndSelect('supplier.user', 'user')
      .leftJoinAndSelect('supplier.ratings', 'ratings')
      .where('supplier.isActive = :isActive', { isActive: true });

    if (filter?.search) {
      queryBuilder.andWhere(
        'supplier.name LIKE :search OR supplier.description LIKE :search',
        { search: `%${filter.search}%` }
      );
    }

    // Handle payment type filtering
    if (filter?.paymentType) {
      if (filter.paymentType === PaymentType.CASH) {
        // For CASH payment type, return all suppliers (no additional filtering)
        // The query remains as is
      } else if (filter.paymentType === PaymentType.CREDIT) {
        // For CREDIT payment type, only return suppliers where the current buyer
        // is in a customer group with payment type CREDIT
        if (user) {
          // First find the buyer ID for the current user
          const buyer = await this.buyerRepository.findOne({
            where: { userId: user.id },
          });

          if (buyer) {
            queryBuilder
              .leftJoin('supplier.customerGroups', 'customerGroups')
              .leftJoin('customerGroups.buyers', 'buyers')
              .andWhere('buyers.id = :buyerId', { buyerId: buyer.id })
              .andWhere('customerGroups.paymentType = :paymentType', { 
                paymentType: PaymentType.CREDIT 
              });
          } else {
            // If buyer not found, return empty result
            queryBuilder.andWhere('1 = 0');
          }
        } else {
          // If no user is provided, return empty result for CREDIT filtering
          queryBuilder.andWhere('1 = 0');
        }
      }
    }

    const suppliers = await queryBuilder.getMany();

    // Add discount percent for each supplier based on buyer's customer group
    const suppliersWithDiscount = await Promise.all(
      suppliers.map(async (supplier) => {
        let discountPercent = 0;

        if (user) {
          // Find the buyer for the current user
          const buyer = await this.buyerRepository.findOne({
            where: { userId: user.id },
          });

          if (buyer) {
            // Find the customer group for this buyer and supplier
            const customerGroup = await this.customerGroupRepository
              .createQueryBuilder('group')
              .leftJoin('group.buyers', 'buyer')
              .where('buyer.id = :buyerId', { buyerId: buyer.id })
              .andWhere('group.supplierId = :supplierId', { supplierId: supplier.id })
              .andWhere('group.isActive = :isActive', { isActive: true })
              .getOne();

            if (customerGroup) {
              discountPercent = Number(customerGroup.discountPercent);
            }
          }
        }

        return {
          ...supplier,
          discountPercent,
        };
      })
    );

    return suppliersWithDiscount;
  }

  async findOne(id: string): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({
      where: { id },
      relations: ['user', 'ratings', 'ratings.buyer', 'customerGroups'],
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    return supplier;
  }

  async update(id: string, updateSupplierDto: UpdateSupplierDto, userId: string): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    if (supplier.userId !== userId) {
      throw new ForbiddenException('You can only update your own supplier profile');
    }

    await this.supplierRepository.update(id, updateSupplierDto);
    return this.findOne(id);
  }

  async getMySupplier(userId: string): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({
      where: { userId },
      relations: ['user', 'ratings', 'customerGroups'],
    });

    if (!supplier) {
      throw new NotFoundException('Supplier profile not found');
    }

    return supplier;
  }

  // Customer Groups Management
  async createCustomerGroup(
    supplierId: string,
    createCustomerGroupDto: CreateCustomerGroupDto,
    userId: string,
  ): Promise<CustomerGroup> {
    const supplier = await this.supplierRepository.findOne({
      where: { id: supplierId },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    if (supplier.userId !== userId) {
      throw new ForbiddenException('You can only create customer groups for your own supplier');
    }

    const customerGroup = this.customerGroupRepository.create({
      ...createCustomerGroupDto,
      supplierId,
    });

    return this.customerGroupRepository.save(customerGroup);
  }

  async getCustomerGroups(supplierId: string): Promise<CustomerGroup[]> {
    return this.customerGroupRepository.find({
      where: { supplierId },
      relations: ['buyers'],
    });
  }

  async updateCustomerGroup(
    id: string,
    updateCustomerGroupDto: UpdateCustomerGroupDto,
    userId: string,
  ): Promise<CustomerGroup> {
    const customerGroup = await this.customerGroupRepository.findOne({
      where: { id },
      relations: ['supplier'],
    });

    if (!customerGroup) {
      throw new NotFoundException('Customer group not found');
    }

    if (customerGroup.supplier.userId !== userId) {
      throw new ForbiddenException('You can only update your own customer groups');
    }

    await this.customerGroupRepository.update(id, updateCustomerGroupDto);
    
    return this.customerGroupRepository.findOne({
      where: { id },
      relations: ['buyers'],
    });
  }

  async deleteCustomerGroup(id: string, userId: string): Promise<void> {
    const customerGroup = await this.customerGroupRepository.findOne({
      where: { id },
      relations: ['supplier'],
    });

    if (!customerGroup) {
      throw new NotFoundException('Customer group not found');
    }

    if (customerGroup.supplier.userId !== userId) {
      throw new ForbiddenException('You can only delete your own customer groups');
    }

    await this.customerGroupRepository.remove(customerGroup);
  }

  async addBuyerToGroup(groupId: string, buyerId: string, userId: string): Promise<CustomerGroup> {
    const customerGroup = await this.customerGroupRepository.findOne({
      where: { id: groupId },
      relations: ['supplier', 'buyers'],
    });

    if (!customerGroup) {
      throw new NotFoundException('Customer group not found');
    }

    if (customerGroup.supplier.userId !== userId) {
      throw new ForbiddenException('You can only manage your own customer groups');
    }

    const buyer = await this.buyerRepository.findOne({
      where: { id: buyerId },
    });

    if (!buyer) {
      throw new NotFoundException('Buyer not found');
    }

    // Check if buyer is already in the group
    const isAlreadyInGroup = customerGroup.buyers.some(b => b.id === buyerId);
    if (isAlreadyInGroup) {
      throw new ForbiddenException('Buyer is already in this group');
    }

    customerGroup.buyers.push(buyer);
    return this.customerGroupRepository.save(customerGroup);
  }

  async removeBuyerFromGroup(groupId: string, buyerId: string, userId: string): Promise<CustomerGroup> {
    const customerGroup = await this.customerGroupRepository.findOne({
      where: { id: groupId },
      relations: ['supplier', 'buyers'],
    });

    if (!customerGroup) {
      throw new NotFoundException('Customer group not found');
    }

    if (customerGroup.supplier.userId !== userId) {
      throw new ForbiddenException('You can only manage your own customer groups');
    }

    // Remove buyer from group
    customerGroup.buyers = customerGroup.buyers.filter(buyer => buyer.id !== buyerId);
    return this.customerGroupRepository.save(customerGroup);
  }

  async getAllBuyers(filter?: { search?: string; page?: number; limit?: number }): Promise<{
    buyers: Buyer[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = filter?.page || 1;
    const limit = filter?.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.buyerRepository
      .createQueryBuilder('buyer')
      .leftJoinAndSelect('buyer.user', 'user')
      .where('buyer.isActive = :isActive', { isActive: true });

    if (filter?.search) {
      queryBuilder.andWhere(
        '(buyer.name LIKE :search OR buyer.companyName LIKE :search OR buyer.email LIKE :search)',
        { search: `%${filter.search}%` }
      );
    }

    const [buyers, total] = await queryBuilder
      .orderBy('buyer.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      buyers,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getCustomerGroupBuyers(groupId: string): Promise<Buyer[]> {
    const customerGroup = await this.customerGroupRepository.findOne({
      where: { id: groupId },
      relations: ['buyers', 'buyers.user'],
    });

    if (!customerGroup) {
      throw new NotFoundException('Customer group not found');
    }

    return customerGroup.buyers;
  }

  async getSupplierRatings(supplierId: string): Promise<SupplierRating[]> {
    return this.supplierRatingRepository.find({
      where: { supplierId },
      relations: ['buyer'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAverageRating(supplierId: string): Promise<number> {
    const result = await this.supplierRatingRepository
      .createQueryBuilder('rating')
      .select('AVG(rating.rating)', 'avgRating')
      .where('rating.supplierId = :supplierId', { supplierId })
      .getRawOne();

    return parseFloat(result.avgRating) || 0;
  }
}
