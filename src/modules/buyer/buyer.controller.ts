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
import { BuyerService } from './buyer.service';
import { UpdateBuyerDto, RateSupplierDto } from './dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { UserRole, PaymentType } from '../../common/enums';
import { User } from '../../entities';

@ApiTags('Buyers')
@Controller('buyers')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class BuyerController {
  constructor(private buyerService: BuyerService) {}

  @Get('me')
  @UseGuards(RolesGuard)
  @Roles(UserRole.BUYER)
  @ApiOperation({ summary: 'Get my buyer profile' })
  @ApiResponse({ status: 200, description: 'Buyer profile retrieved successfully' })
  async getMyProfile(@GetUser() user: User) {
    return this.buyerService.getMyProfile(user.id);
  }

  @Patch('me')
  @UseGuards(RolesGuard)
  @Roles(UserRole.BUYER)
  @ApiOperation({ summary: 'Update my buyer profile' })
  @ApiResponse({ status: 200, description: 'Buyer profile updated successfully' })
  async updateProfile(@Body() updateBuyerDto: UpdateBuyerDto, @GetUser() user: User) {
    return this.buyerService.update(updateBuyerDto, user.id);
  }

  @Get('suppliers/search')
  @UseGuards(RolesGuard)
  @Roles(UserRole.BUYER)
  @ApiOperation({ summary: 'Search suppliers with filters' })
  @ApiQuery({ name: 'search', type: 'string', required: false })
  @ApiQuery({ name: 'paymentType', enum: PaymentType, required: false })
  @ApiQuery({ name: 'favoritesOnly', type: 'boolean', required: false })
  @ApiResponse({ status: 200, description: 'Suppliers retrieved successfully' })
  async searchSuppliers(
    @Query('search') search?: string,
    @Query('paymentType') paymentType?: PaymentType,
    @Query('favoritesOnly') favoritesOnly?: boolean,
    @GetUser() user?: User,
  ) {
    return this.buyerService.searchSuppliers({
      search,
      paymentType,
      favoritesOnly,
      userId: user.id,
    });
  }

  // Favorite suppliers management
  @Post('favorites/suppliers/:supplierId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.BUYER)
  @ApiOperation({ summary: 'Add supplier to favorites' })
  @ApiResponse({ status: 201, description: 'Supplier added to favorites successfully' })
  async addSupplierToFavorites(@Param('supplierId') supplierId: string, @GetUser() user: User) {
    return this.buyerService.addSupplierToFavorites(supplierId, user.id);
  }

  @Delete('favorites/suppliers/:supplierId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.BUYER)
  @ApiOperation({ summary: 'Remove supplier from favorites' })
  @ApiResponse({ status: 200, description: 'Supplier removed from favorites successfully' })
  async removeSupplierFromFavorites(@Param('supplierId') supplierId: string, @GetUser() user: User) {
    return this.buyerService.removeSupplierFromFavorites(supplierId, user.id);
  }

  @Get('favorites/suppliers')
  @UseGuards(RolesGuard)
  @Roles(UserRole.BUYER)
  @ApiOperation({ summary: 'Get favorite suppliers' })
  @ApiResponse({ status: 200, description: 'Favorite suppliers retrieved successfully' })
  async getFavoriteSuppliers(@GetUser() user: User) {
    return this.buyerService.getFavoriteSuppliers(user.id);
  }

  // Favorite products management
  @Post('favorites/products/:productId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.BUYER)
  @ApiOperation({ summary: 'Add product to favorites' })
  @ApiResponse({ status: 201, description: 'Product added to favorites successfully' })
  async addProductToFavorites(@Param('productId') productId: string, @GetUser() user: User) {
    return this.buyerService.addProductToFavorites(productId, user.id);
  }

  @Delete('favorites/products/:productId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.BUYER)
  @ApiOperation({ summary: 'Remove product from favorites' })
  @ApiResponse({ status: 200, description: 'Product removed from favorites successfully' })
  async removeProductFromFavorites(@Param('productId') productId: string, @GetUser() user: User) {
    return this.buyerService.removeProductFromFavorites(productId, user.id);
  }

  @Get('favorites/products')
  @UseGuards(RolesGuard)
  @Roles(UserRole.BUYER)
  @ApiOperation({ summary: 'Get favorite products' })
  @ApiResponse({ status: 200, description: 'Favorite products retrieved successfully' })
  async getFavoriteProducts(@GetUser() user: User) {
    return this.buyerService.getFavoriteProducts(user.id);
  }

  // Rating and comments
  @Post('suppliers/:supplierId/rate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.BUYER)
  @ApiOperation({ summary: 'Rate and comment on supplier' })
  @ApiResponse({ status: 201, description: 'Supplier rated successfully' })
  async rateSupplier(
    @Param('supplierId') supplierId: string,
    @Body() rateSupplierDto: RateSupplierDto,
    @GetUser() user: User,
  ) {
    return this.buyerService.rateSupplier(supplierId, rateSupplierDto, user.id);
  }

  @Get('my-ratings')
  @UseGuards(RolesGuard)
  @Roles(UserRole.BUYER)
  @ApiOperation({ summary: 'Get my ratings and comments' })
  @ApiResponse({ status: 200, description: 'Ratings retrieved successfully' })
  async getMyRatings(@GetUser() user: User) {
    return this.buyerService.getMyRatings(user.id);
  }
}
