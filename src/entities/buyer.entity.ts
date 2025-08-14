import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from './user.entity';
import { Supplier } from './supplier.entity';
import { Product } from './product.entity';
import { CustomerGroup } from './customer-group.entity';
import { SupplierRating } from './supplier-rating.entity';

@Entity('buyers')
export class Buyer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  companyName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  zipCode: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User, user => user.buyer)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToMany(() => Supplier)
  @JoinTable({
    name: 'buyer_favorite_suppliers',
    joinColumn: { name: 'buyerId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'supplierId', referencedColumnName: 'id' },
  })
  favoriteSuppliers: Supplier[];

  @ManyToMany(() => Product)
  @JoinTable({
    name: 'buyer_favorite_products',
    joinColumn: { name: 'buyerId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'productId', referencedColumnName: 'id' },
  })
  favoriteProducts: Product[];

  @OneToMany(() => CustomerGroup, customerGroup => customerGroup.buyers)
  customerGroups: CustomerGroup[];

  @OneToMany(() => SupplierRating, rating => rating.buyer)
  ratings: SupplierRating[];
}
