import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SupplierService } from './supplier.service';
import { UpdateSupplierDto, CreateCustomerGroupDto, UpdateCustomerGroupDto } from './dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { UserRole, PaymentType } from '../../common/enums';
import { User } from '../../entities';

@ApiTags('Suppliers')
@Controller('suppliers')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class SupplierController {
  constructor(private supplierService: SupplierService) {}

  @Get()
  @ApiOperation({ summary: 'Get all suppliers with optional filters' })
  @ApiQuery({ name: 'paymentType', enum: PaymentType, required: false })
  @ApiQuery({ name: 'search', type: 'string', required: false })
  @ApiResponse({ status: 200, description: 'Suppliers retrieved successfully' })
  async findAll(
    @Query('paymentType') paymentType?: PaymentType,
    @Query('search') search?: string,
    @GetUser() user?: User,
  ) {
    return this.supplierService.findAll({ paymentType, search }, user);
  }

  @Get('buyers')
  @ApiOperation({ summary: 'Get all available buyers for supplier management' })
  @ApiQuery({ name: 'search', type: 'string', required: false })
  @ApiQuery({ name: 'page', type: 'number', required: false })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiResponse({ status: 200, description: 'Buyers retrieved successfully' })
  async getAllBuyers(
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.supplierService.getAllBuyers({ search, page, limit });
  }

  @Get('me')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPPLIER)
  @ApiOperation({ summary: 'Get my supplier profile' })
  @ApiResponse({ status: 200, description: 'Supplier profile retrieved successfully' })
  async getMyProfile(@GetUser() user: User) {
    return this.supplierService.getMySupplier(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get supplier by ID' })
  @ApiResponse({ status: 200, description: 'Supplier retrieved successfully' })
  async findOne(@Param('id') id: string) {
    return this.supplierService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPPLIER)
  @ApiOperation({ summary: 'Update supplier profile' })
  @ApiResponse({ status: 200, description: 'Supplier updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
    @GetUser() user: User,
  ) {
    return this.supplierService.update(id, updateSupplierDto, user.id);
  }

  // Customer Groups endpoints
  @Post(':id/customer-groups')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPPLIER)
  @ApiOperation({ summary: 'Create customer group' })
  @ApiResponse({ status: 201, description: 'Customer group created successfully' })
  async createCustomerGroup(
    @Param('id') supplierId: string,
    @Body() createCustomerGroupDto: CreateCustomerGroupDto,
    @GetUser() user: User,
  ) {
    return this.supplierService.createCustomerGroup(supplierId, createCustomerGroupDto, user.id);
  }

  @Get(':id/customer-groups')
  @ApiOperation({ summary: 'Get supplier customer groups' })
  @ApiResponse({ status: 200, description: 'Customer groups retrieved successfully' })
  async getCustomerGroups(@Param('id') supplierId: string) {
    return this.supplierService.getCustomerGroups(supplierId);
  }

  @Get('customer-groups/:groupId/buyers')
  @ApiOperation({ summary: 'Get buyers in a specific customer group' })
  @ApiResponse({ status: 200, description: 'Group buyers retrieved successfully' })
  async getCustomerGroupBuyers(@Param('groupId') groupId: string) {
    return this.supplierService.getCustomerGroupBuyers(groupId);
  }

  @Patch('customer-groups/:groupId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPPLIER)
  @ApiOperation({ summary: 'Update customer group' })
  @ApiResponse({ status: 200, description: 'Customer group updated successfully' })
  async updateCustomerGroup(
    @Param('groupId') groupId: string,
    @Body() updateCustomerGroupDto: UpdateCustomerGroupDto,
    @GetUser() user: User,
  ) {
    return this.supplierService.updateCustomerGroup(groupId, updateCustomerGroupDto, user.id);
  }

  @Delete('customer-groups/:groupId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPPLIER)
  @ApiOperation({ summary: 'Delete customer group' })
  @ApiResponse({ status: 200, description: 'Customer group deleted successfully' })
  async deleteCustomerGroup(
    @Param('groupId') groupId: string,
    @GetUser() user: User,
  ) {
    await this.supplierService.deleteCustomerGroup(groupId, user.id);
    return { message: 'Customer group deleted successfully' };
  }

  @Post('customer-groups/:groupId/buyers/:buyerId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPPLIER)
  @ApiOperation({ summary: 'Add buyer to customer group' })
  @ApiResponse({ status: 200, description: 'Buyer added to group successfully' })
  async addBuyerToGroup(
    @Param('groupId') groupId: string,
    @Param('buyerId') buyerId: string,
    @GetUser() user: User,
  ) {
    return this.supplierService.addBuyerToGroup(groupId, buyerId, user.id);
  }

  @Delete('customer-groups/:groupId/buyers/:buyerId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPPLIER)
  @ApiOperation({ summary: 'Remove buyer from customer group' })
  @ApiResponse({ status: 200, description: 'Buyer removed from group successfully' })
  async removeBuyerFromGroup(
    @Param('groupId') groupId: string,
    @Param('buyerId') buyerId: string,
    @GetUser() user: User,
  ) {
    return this.supplierService.removeBuyerFromGroup(groupId, buyerId, user.id);
  }

  @Get(':id/ratings')
  @ApiOperation({ summary: 'Get supplier ratings' })
  @ApiResponse({ status: 200, description: 'Supplier ratings retrieved successfully' })
  async getRatings(@Param('id') supplierId: string) {
    return this.supplierService.getSupplierRatings(supplierId);
  }

  @Get(':id/average-rating')
  @ApiOperation({ summary: 'Get supplier average rating' })
  @ApiResponse({ status: 200, description: 'Average rating retrieved successfully' })
  async getAverageRating(@Param('id') supplierId: string) {
    const avgRating = await this.supplierService.getAverageRating(supplierId);
    return { averageRating: avgRating };
  }
}
