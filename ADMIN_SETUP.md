# Admin Setup Guide

This guide explains how to set up the first platform administrator for the IranPart B2B Marketplace backend.

## Methods to Create First Admin

### Method 1: Automatic Admin Creation (Recommended)

The system will automatically create the first admin user when the application starts if the environment variables are properly configured.

1. **Configure Environment Variables**

   Copy `.env.example` to `.env` and set the following variables:

   ```bash
   # First Admin Configuration
   FIRST_ADMIN_PHONE=+989121234567
   FIRST_ADMIN_EMAIL=admin@iranpart.com
   ```

2. **Start the Application**

   ```bash
   npm run start:dev
   ```

   The system will automatically:
   - Check if a platform admin already exists
   - Create the first admin if none exists
   - Log the admin creation details to the console

3. **Admin Login**

   The created admin can now log in using the OTP authentication system:
   - Use the configured phone number to request an OTP
   - Use the received OTP to authenticate
   - The system will recognize the user as a platform admin

### Method 2: Manual Admin Creation via CLI

You can manually create admin users using the provided CLI script.

```bash
# Create admin with phone and email
npm run create-admin +989121234567 admin@iranpart.com

# Create admin with phone only
npm run create-admin +989121234567
```

**Requirements:**
- Phone number must start with `+98` (Iran country code)
- Email is optional

## Admin Capabilities

Once logged in, the platform admin can:

### 1. Register New Suppliers
- **Endpoint**: `POST /suppliers/admin/register`
- **Authentication**: Bearer token with `PLATFORM_ADMIN` role
- **Purpose**: Create new supplier accounts with associated user accounts

### 2. Manage System Users
- View all users in the system
- Deactivate/activate user accounts
- Access user profiles and related data

### 3. System Administration
- Access all supplier and buyer data
- Manage platform-wide settings
- Monitor system usage and performance

## Admin Authentication Flow

1. **Request OTP**
   ```bash
   POST /auth/send-otp
   {
     "phone": "+989121234567",
     "role": "platform_admin"
   }
   ```

2. **Verify OTP and Get Token**
   ```bash
   POST /auth/verify-otp
   {
     "phone": "+989121234567",
     "code": "123456"
   }
   ```

3. **Use Bearer Token**
   Include the received token in all subsequent requests:
   ```bash
   Authorization: Bearer <your-jwt-token>
   ```

## Security Notes

- Admin accounts are automatically verified upon creation
- Admin accounts bypass normal user registration flows
- Admin phone numbers should be kept secure
- Regular admin access should be monitored
- Consider implementing additional MFA for admin accounts in production

## Troubleshooting

### Admin Creation Failed
- Check database connectivity
- Verify environment variables are set correctly
- Ensure no existing user has the same phone number

### Admin Cannot Login
- Verify the phone number format (+98...)
- Check OTP service configuration
- Ensure JWT secret is properly configured

### Permission Denied
- Verify the user role is `PLATFORM_ADMIN`
- Check JWT token validity
- Ensure proper role guards are applied to endpoints

## Production Considerations

1. **Environment Variables**: Set strong, unique values for production
2. **Phone Number**: Use a real, secure phone number for OTP delivery
3. **Email**: Configure a monitored email address for admin communications
4. **Logging**: Monitor admin creation and login attempts
5. **Backup**: Ensure admin credentials are backed up securely
