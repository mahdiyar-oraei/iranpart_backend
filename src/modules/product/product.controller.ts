import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto, AssignCategoryDto } from './dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { UserRole, PaymentType } from '../../common/enums';
import { User } from '../../entities';

@ApiTags('Products')
@Controller('products')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ProductController {
  constructor(private productService: ProductService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPPLIER)
  @ApiOperation({ summary: 'Create product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  async create(@Body() createProductDto: CreateProductDto, @GetUser() user: User) {
    return this.productService.create(createProductDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get products with filters' })
  @ApiQuery({ name: 'supplierId', type: 'string', required: false })
  @ApiQuery({ name: 'categoryId', type: 'string', required: false })
  @ApiQuery({ name: 'search', type: 'string', required: false })
  @ApiQuery({ name: 'paymentType', enum: PaymentType, required: false })
  @ApiQuery({ name: 'favorite', type: 'boolean', required: false })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  async findAll(
    @Query('supplierId') supplierId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
    @Query('paymentType') paymentType?: PaymentType,
    @Query('favorite') favorite?: boolean,
    @GetUser() user?: User,
  ) {
    return this.productService.findAll({
      supplierId,
      categoryId,
      search,
      paymentType,
      favorite,
      buyerId: user?.buyer?.id,
    });
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get products by category' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  async getProductsByCategory(@Param('categoryId') categoryId: string) {
    return this.productService.getProductsByCategory(categoryId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  async findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPPLIER)
  @ApiOperation({ summary: 'Update product' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user: User,
  ) {
    return this.productService.update(id, updateProductDto, user.id);
  }

  @Patch(':id/display-order')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPPLIER)
  @ApiOperation({ summary: 'Update product display order' })
  @ApiResponse({ status: 200, description: 'Product display order updated successfully' })
  async updateDisplayOrder(
    @Param('id') id: string,
    @Body('displayOrder') displayOrder: number,
    @GetUser() user: User,
  ) {
    return this.productService.updateDisplayOrder(id, displayOrder, user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPPLIER)
  @ApiOperation({ summary: 'Delete product' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  async remove(@Param('id') id: string, @GetUser() user: User) {
    await this.productService.remove(id, user.id);
    return { message: 'Product deleted successfully' };
  }

  // Category assignment endpoints
  @Post(':id/categories')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPPLIER)
  @ApiOperation({ summary: 'Assign product to category' })
  @ApiResponse({ status: 201, description: 'Product assigned to category successfully' })
  async assignToCategory(
    @Param('id') productId: string,
    @Body() assignCategoryDto: AssignCategoryDto,
    @GetUser() user: User,
  ) {
    return this.productService.assignToCategory(productId, assignCategoryDto, user.id);
  }

  @Patch(':productId/categories/:categoryId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPPLIER)
  @ApiOperation({ summary: 'Update product category assignment' })
  @ApiResponse({ status: 200, description: 'Product category assignment updated successfully' })
  async updateCategoryAssignment(
    @Param('productId') productId: string,
    @Param('categoryId') categoryId: string,
    @Body() updateData: Partial<AssignCategoryDto>,
    @GetUser() user: User,
  ) {
    return this.productService.updateCategoryAssignment(productId, categoryId, updateData, user.id);
  }

  @Delete(':productId/categories/:categoryId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPPLIER)
  @ApiOperation({ summary: 'Remove product from category' })
  @ApiResponse({ status: 200, description: 'Product removed from category successfully' })
  async removeFromCategory(
    @Param('productId') productId: string,
    @Param('categoryId') categoryId: string,
    @GetUser() user: User,
  ) {
    await this.productService.removeFromCategory(productId, categoryId, user.id);
    return { message: 'Product removed from category successfully' };
  }
}
