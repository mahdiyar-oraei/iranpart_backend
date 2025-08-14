# IranPart B2B Marketplace Backend

A comprehensive NestJS backend for a B2B product catalog marketplace where suppliers can manage their products and buyers can browse, filter, and purchase from multiple suppliers.

## Features

### 🔐 Authentication & Authorization
- **OTP-based Authentication**: SMS/Email OTP verification
- **Role-based Access Control**: Supplier, Buyer, Platform Admin roles
- **JWT Token Authentication**: Secure API access

### 👥 User Management
- **Suppliers**: Manage company profile, products, categories, customer groups
- **Buyers**: Browse suppliers, manage favorites, rate suppliers
- **Platform Admins**: System administration and user management

### 🏢 Supplier Features
- Complete supplier profile management (name, logo, description, contact info)
- Customer group management with payment-type specific discounts
- Hierarchical category tree system with custom ordering
- Product management with image galleries and attributes
- Product display control (cash/credit filters, show/hide options)
- Category-specific product conditions and discounts

### 🛒 Buyer Features
- Supplier search and filtering (by payment type, favorites)
- Product browsing with advanced filters
- Favorite suppliers and products management
- Supplier rating and review system
- Product filtering by category, payment type, favorites

### 💰 Advanced Pricing System
- Complex price calculation engine
- Customer group discounts by payment type
- Category-specific discounts with minimum order requirements
- Detailed price breakdown and explanations
- Bulk price calculations

### 🖼️ File Management
- Secure file upload system for images and documents
- Support for multiple file formats
- Automatic file serving and URL generation

### 📚 API Documentation
- Complete Swagger/OpenAPI documentation
- Interactive API explorer
- Detailed request/response schemas

## Technology Stack

- **Framework**: NestJS
- **Database**: MySQL with TypeORM
- **Authentication**: JWT + OTP
- **File Upload**: Multer
- **Documentation**: Swagger/OpenAPI
- **Validation**: Class Validator & Class Transformer

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd iranpart_backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   Update the `.env` file with your configuration:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=root
   DB_PASSWORD=password
   DB_DATABASE=iranpart_db

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d

   # OTP Configuration
   OTP_EXPIRES_IN=300000
   SMS_API_KEY=your-sms-api-key

   # File Upload Configuration
   UPLOAD_PATH=./uploads
   MAX_FILE_SIZE=10485760

   # App Configuration
   PORT=3000
   NODE_ENV=development
   ```

4. **Database Setup**
   ```bash
   # Create MySQL database
   mysql -u root -p -e "CREATE DATABASE iranpart_db;"
   ```

5. **Start the application**
   ```bash
   # Development mode
   npm run start:dev

   # Production mode
   npm run build
   npm run start:prod
   ```

## API Endpoints

### Authentication
- `POST /auth/send-otp` - Send OTP to phone number
- `POST /auth/verify-otp` - Verify OTP and login
- `POST /auth/register/supplier` - Register new supplier
- `POST /auth/register/buyer` - Register new buyer
- `GET /auth/profile` - Get current user profile

### File Management
- `POST /files/upload` - Upload single file
- `POST /files/upload-multiple` - Upload multiple files
- `DELETE /files/:filename` - Delete file

### Suppliers
- `GET /suppliers` - Get all suppliers with filters
- `GET /suppliers/me` - Get my supplier profile
- `GET /suppliers/:id` - Get supplier by ID
- `PATCH /suppliers/:id` - Update supplier profile
- `POST /suppliers/:id/customer-groups` - Create customer group
- `GET /suppliers/:id/customer-groups` - Get customer groups
- `GET /suppliers/:id/ratings` - Get supplier ratings

### Categories
- `POST /categories` - Create category
- `GET /categories/supplier/:supplierId` - Get categories by supplier
- `GET /categories/supplier/:supplierId/tree` - Get category tree
- `GET /categories/:id` - Get category by ID
- `PATCH /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

### Products
- `POST /products` - Create product
- `GET /products` - Get products with filters
- `GET /products/:id` - Get product by ID
- `PATCH /products/:id` - Update product
- `DELETE /products/:id` - Delete product
- `POST /products/:id/categories` - Assign product to category

### Buyers
- `GET /buyers/me` - Get my buyer profile
- `PATCH /buyers/me` - Update buyer profile
- `GET /buyers/suppliers/search` - Search suppliers
- `POST /buyers/favorites/suppliers/:id` - Add supplier to favorites
- `POST /buyers/favorites/products/:id` - Add product to favorites
- `POST /buyers/suppliers/:id/rate` - Rate supplier

### Price Calculation
- `POST /price-calculation/calculate` - Calculate product price
- `POST /price-calculation/calculate-bulk` - Calculate bulk prices
- `GET /price-calculation/product/:id/info` - Get product price info

### Users (Admin only)
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id/deactivate` - Deactivate user

## Database Schema

### Core Entities
- **Users**: Base user entity with role-based access
- **Suppliers**: Supplier profiles and business information
- **Buyers**: Buyer profiles and preferences
- **Products**: Product catalog with attributes and pricing
- **Categories**: Hierarchical category tree structure
- **Customer Groups**: Payment-type specific buyer groups with discounts

### Relationships
- One-to-One: User ↔ Supplier/Buyer
- One-to-Many: Supplier → Products, Categories, Customer Groups
- Many-to-Many: Buyers ↔ Favorite Suppliers/Products
- Tree Structure: Categories with parent-child relationships

## Business Logic

### Pricing Engine
The system includes a sophisticated pricing engine that calculates final prices based on:

1. **Base Product Price**: Starting price set by supplier
2. **Customer Group Discounts**: Payment-type specific discounts for buyer groups
3. **Category Discounts**: Minimum order quantity discounts per category
4. **Complex Calculations**: Multiple discount layers with detailed explanations

### Product Display Control
Suppliers can control product visibility:
- Show on cash payments only
- Show on credit payments only  
- Show on both payment types
- Show but disable cart functionality
- Hide completely

### Category Tree Management
- Nested set model for efficient tree operations
- Custom display ordering at each level
- Supplier-specific category trees
- Product assignment with category-specific conditions

## Development

### Running Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Code Quality
```bash
# Linting
npm run lint

# Format code
npm run format
```

## Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**

3. **Run database migrations** (if using migrations)

4. **Start the production server**
   ```bash
   npm run start:prod
   ```

## API Documentation

Once the application is running, visit:
- **Swagger UI**: `http://localhost:3000/api`
- **API JSON**: `http://localhost:3000/api-json`

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Authorization**: Fine-grained access control
- **Input Validation**: Comprehensive request validation
- **File Upload Security**: File type and size restrictions
- **CORS Configuration**: Configurable cross-origin resource sharing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.
