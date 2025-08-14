import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier, CustomerGroup, SupplierRating, User } from '../../entities';
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
  ) {}

  async findAll(filter?: { paymentType?: PaymentType; search?: string }): Promise<Supplier[]> {
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

    return queryBuilder.getMany();
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

    // Add buyer to group (this would require buyer validation)
    return customerGroup;
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
    return customerGroup;
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
