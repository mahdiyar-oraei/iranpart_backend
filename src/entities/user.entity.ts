import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { UserRole } from '../common/enums';
import { Supplier } from './supplier.entity';
import { Buyer } from './buyer.entity';
import { OtpCode } from './otp-code.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Supplier, supplier => supplier.user)
  supplier: Supplier;

  @OneToOne(() => Buyer, buyer => buyer.user)
  buyer: Buyer;

  @OneToMany(() => OtpCode, otpCode => otpCode.user)
  otpCodes: OtpCode[];
}
