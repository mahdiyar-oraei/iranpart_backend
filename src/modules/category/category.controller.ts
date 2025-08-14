import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { UserRole } from '../../common/enums';
import { User } from '../../entities';

@ApiTags('Categories')
@Controller('categories')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPPLIER)
  @ApiOperation({ summary: 'Create category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  async create(@Body() createCategoryDto: CreateCategoryDto, @GetUser() user: User) {
    return this.categoryService.create(createCategoryDto, user.id);
  }

  @Get('supplier/:supplierId')
  @ApiOperation({ summary: 'Get categories by supplier' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  async findBySupplier(@Param('supplierId') supplierId: string) {
    return this.categoryService.findBySupplier(supplierId);
  }

  @Get('supplier/:supplierId/tree')
  @ApiOperation({ summary: 'Get category tree for supplier' })
  @ApiResponse({ status: 200, description: 'Category tree retrieved successfully' })
  async getCategoryTree(@Param('supplierId') supplierId: string) {
    return this.categoryService.getCategoryTree(supplierId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully' })
  async findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Get(':id/descendants')
  @ApiOperation({ summary: 'Get category descendants' })
  @ApiResponse({ status: 200, description: 'Category descendants retrieved successfully' })
  async getDescendants(@Param('id') id: string) {
    return this.categoryService.getDescendants(id);
  }

  @Get(':id/ancestors')
  @ApiOperation({ summary: 'Get category ancestors' })
  @ApiResponse({ status: 200, description: 'Category ancestors retrieved successfully' })
  async getAncestors(@Param('id') id: string) {
    return this.categoryService.getAncestors(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPPLIER)
  @ApiOperation({ summary: 'Update category' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @GetUser() user: User,
  ) {
    return this.categoryService.update(id, updateCategoryDto, user.id);
  }

  @Patch(':id/display-order')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPPLIER)
  @ApiOperation({ summary: 'Update category display order' })
  @ApiResponse({ status: 200, description: 'Category display order updated successfully' })
  async updateDisplayOrder(
    @Param('id') id: string,
    @Body('displayOrder') displayOrder: number,
    @GetUser() user: User,
  ) {
    return this.categoryService.updateDisplayOrder(id, displayOrder, user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPPLIER)
  @ApiOperation({ summary: 'Delete category' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  async remove(@Param('id') id: string, @GetUser() user: User) {
    await this.categoryService.remove(id, user.id);
    return { message: 'Category deleted successfully' };
  }
}
