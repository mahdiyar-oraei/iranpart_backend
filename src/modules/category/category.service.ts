import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';
import { Category, Supplier } from '../../entities';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: TreeRepository<Category>,
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, userId: string): Promise<Category> {
    const { parentId, ...categoryData } = createCategoryDto;

    // Find supplier by userId
    const supplier = await this.supplierRepository.findOne({
      where: { userId },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier profile not found');
    }

    let parent: Category = null;
    if (parentId) {
      parent = await this.categoryRepository.findOne({
        where: { id: parentId, supplierId: supplier.id },
      });

      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
    }

    const category = this.categoryRepository.create({
      ...categoryData,
      supplierId: supplier.id,
      parent,
    });

    return this.categoryRepository.save(category);
  }

  async findAll(supplierId: string): Promise<Category[]> {
    return this.categoryRepository.findTrees({
      where: { supplierId },
      order: { displayOrder: 'ASC' },
    });
  }

  async findBySupplier(supplierId: string): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { supplierId, isActive: true },
      order: { displayOrder: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['children', 'parent'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, userId: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['supplier'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.supplier.userId !== userId) {
      throw new ForbiddenException('You can only update your own categories');
    }

    const { parentId, ...updateData } = updateCategoryDto;

    if (parentId && parentId !== category.parent?.id) {
      const newParent = await this.categoryRepository.findOne({
        where: { id: parentId, supplierId: category.supplierId },
      });

      if (!newParent) {
        throw new NotFoundException('Parent category not found');
      }

      category.parent = newParent;
    }

    Object.assign(category, updateData);
    return this.categoryRepository.save(category);
  }

  async remove(id: string, userId: string): Promise<void> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['supplier', 'children'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.supplier.userId !== userId) {
      throw new ForbiddenException('You can only delete your own categories');
    }

    if (category.children && category.children.length > 0) {
      throw new ForbiddenException('Cannot delete category with subcategories');
    }

    await this.categoryRepository.remove(category);
  }

  async getCategoryTree(supplierId: string): Promise<Category[]> {
    return this.categoryRepository.findTrees({
      where: { supplierId, isActive: true },
      order: { displayOrder: 'ASC' },
    });
  }

  async updateDisplayOrder(id: string, displayOrder: number, userId: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['supplier'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.supplier.userId !== userId) {
      throw new ForbiddenException('You can only update your own categories');
    }

    category.displayOrder = displayOrder;
    return this.categoryRepository.save(category);
  }

  async getDescendants(id: string): Promise<Category[]> {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.categoryRepository.findDescendants(category);
  }

  async getAncestors(id: string): Promise<Category[]> {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.categoryRepository.findAncestors(category);
  }
}
