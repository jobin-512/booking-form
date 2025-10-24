# Booking System Setup

This is a SvelteKit application with user authentication and a contact form system.

## Features

- User registration and login
- Protected dashboard
- **Appointment Booking System** with calendar and time slots
- **Location Management** with email support
- Globally available contact form
- **Admin Panel** with user management
- **Role-based access control** (Admin/User)
- **Time Slot Scheduling** (30-minute intervals)
- **Day-specific Hours**: Monday-Friday (9AM-11:30AM, 1PM-4:30PM), Saturday (9AM-5PM), Sunday (9AM-12PM)
- MySQL database with Prisma ORM
- JWT-based authentication
- Responsive design with Tailwind CSS

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/booking_system"

# JWT Secret (change this in production)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
```

### 2. Database Setup

1. Make sure you have MySQL running
2. Create a database named `booking_system`
3. Run the following commands:

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Start Development Server

```bash
pnpm dev
```

## Database Schema

### Users Table
- `id` (String, Primary Key)
- `email` (String, Unique)
- `password` (String, Hashed)
- `name` (String, Optional)
- `role` (String, Default: "user") - "user" or "admin"
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Contact Forms Table
- `id` (String, Primary Key)
- `firstName` (String, Required)
- `lastName` (String, Required)
- `email` (String, Required)
- `phoneNumber` (String, Required)
- `storeInfo` (Boolean, Default: false)
- `patientDateOfBirth` (String, Required)
- `insuranceInfo` (String, Required)
- `description` (String, Required)
### Locations Table
- `id` (String, Primary Key)
- `name` (String, Unique)
- `address` (String, Optional)
- `email` (String, Optional)
- `isActive` (Boolean, Default: true)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Appointments Table
- `id` (String, Primary Key)
- `locationId` (String, Foreign Key to Location)
- `date` (DateTime)
- `timeSlot` (String) - Format: "09:00", "09:30", etc.
- `isBooked` (Boolean, Default: false)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)
- Unique constraint on `[locationId, date, timeSlot]`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (requires Bearer token)

### Admin Panel (Admin Only)
- `GET /api/admin/users` - Get all users
- `POST /api/admin/create-user` - Create new user
- `DELETE /api/admin/users/[id]` - Delete user (admin users protected)
- `GET /api/admin/locations` - Get all locations
- `POST /api/admin/locations` - Create new location
- `PUT /api/admin/locations/[id]` - Update location
- `DELETE /api/admin/locations/[id]` - Delete location

### Appointment Booking
- `GET /api/appointments/slots` - Get available time slots for a location and date
- `POST /api/appointments/book` - Book an appointment

### Public Endpoints
- `GET /api/locations` - Get active locations for contact form

## Pages

- `/` - Home page with contact form (public)
- `/login` - Login/Register page
- `/dashboard` - User dashboard (protected)

## Security Features

- Password hashing with bcryptjs
- JWT tokens for authentication
- Input validation
- Email format validation
- Protected routes
- **Role-based access control**
- **Admin user protection** (cannot delete admin users)
- **Self-deletion prevention** (users cannot delete themselves)
