#!/bin/bash

# Setup script for IranPart Backend

echo "Setting up IranPart Backend..."

# Create uploads directory
echo "Creating uploads directory..."
mkdir -p uploads

# Set permissions for uploads directory
chmod 755 uploads

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp env.example .env
    echo "Please update the .env file with your configuration!"
fi

echo "Setup completed!"
echo ""
echo "Next steps:"
echo "1. Update the .env file with your database and other configurations"
echo "2. Make sure MySQL is running and create the database: CREATE DATABASE iranpart_db;"
echo "3. Run 'npm install' to install dependencies"
echo "4. Run 'npm run start:dev' to start the development server"
echo "5. Visit http://localhost:3000/api for Swagger documentation"
