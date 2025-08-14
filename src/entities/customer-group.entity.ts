import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Supplier } from './supplier.entity';
import { Buyer } from './buyer.entity';
import { PaymentType } from '../common/enums';

@Entity('customer_groups')
export class CustomerGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: PaymentType })
  paymentType: PaymentType;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPercent: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Supplier, supplier => supplier.customerGroups)
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @Column()
  supplierId: string;

  @ManyToMany(() => Buyer, buyer => buyer.customerGroups)
  @JoinTable({
    name: 'customer_group_buyers',
    joinColumn: { name: 'customerGroupId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'buyerId', referencedColumnName: 'id' },
  })
  buyers: Buyer[];
}
