import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Supplier } from './supplier.entity';
import { ProductCategory } from './product-category.entity';
import { ProductDisplayType } from '../common/enums';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  images: string[];

  @Column({ type: 'json', nullable: true })
  attributes: Record<string, any>;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column()
  unit: string;

  @Column({ default: 1 })
  minimumOrderCount: number;

  @Column({ default: 1 })
  countInPack: number;

  @Column({ type: 'enum', enum: ProductDisplayType, default: ProductDisplayType.SHOW_ALL })
  displayType: ProductDisplayType;

  @Column({ default: 0 })
  displayOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Supplier, supplier => supplier.products)
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @Column()
  supplierId: string;

  @OneToMany(() => ProductCategory, productCategory => productCategory.product)
  productCategories: ProductCategory[];
}
