import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Product } from './product.entity';
import { Category } from './category.entity';
import { CustomerGroup } from './customer-group.entity';
import { SupplierRating } from './supplier-rating.entity';

@Entity('suppliers')
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  zipCode: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true })
  website: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User, user => user.supplier)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @OneToMany(() => Product, product => product.supplier)
  products: Product[];

  @OneToMany(() => Category, category => category.supplier)
  categories: Category[];

  @OneToMany(() => CustomerGroup, customerGroup => customerGroup.supplier)
  customerGroups: CustomerGroup[];

  @OneToMany(() => SupplierRating, rating => rating.supplier)
  ratings: SupplierRating[];
}
