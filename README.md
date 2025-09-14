# Yardstick - Multi-tenant SaaS Notes Application

A secure, multi-tenant SaaS Notes Application built with Next.js, TypeScript, Prisma, and PostgreSQL. This application supports multiple tenants with strict data isolation, role-based access control, and subscription-based feature gating.

## Architecture Overview

### Multi-Tenancy Approach
This application uses a **shared schema with tenant ID column** approach for multi-tenancy:
- Single database with shared tables
- Each record includes a `tenantId` column for data isolation
- Middleware ensures users can only access data from their tenant
- Efficient resource utilization while maintaining strict data separation

### Key Features
- **Multi-tenant Architecture**: Supports Acme and Globex tenants with complete data isolation
- **JWT Authentication**: Secure token-based authentication system
- **Role-based Access Control**: Admin and Member roles with different permissions
- **Subscription Management**: Free (3 notes limit) and Pro (unlimited) plans
- **CRUD Operations**: Full notes management with tenant-scoped access
- **Modern UI**: Clean, responsive interface built with Tailwind CSS

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd yardstick
npm install
```

### 2. Database Setup

Create a PostgreSQL database named `yardstick_notes_saas` and configure your `.env` file:

```bash
# .env
DATABASE_URL="postgresql://username:password@localhost:5432/yardstick_notes_saas"
JWT_SECRET="your-secure-jwt-secret-key"
```

### 3. Database Migration and Seeding

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with test accounts
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to access the application.

## Test Accounts

The following test accounts are pre-configured (all use password: `password`):

| Email | Role | Tenant | Description |
|-------|------|--------|-------------|
| admin@acme.test | Admin | Acme | Can invite users and upgrade subscriptions |
| user@acme.test | Member | Acme | Can manage notes only |
| admin@globex.test | Admin | Globex | Can invite users and upgrade subscriptions |
| user@globex.test | Member | Globex | Can manage notes only |

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Notes Management
- `GET /api/notes` - List all notes for current tenant
- `POST /api/notes` - Create a new note
- `GET /api/notes/:id` - Retrieve specific note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Tenant Management
- `POST /api/tenants/:slug/upgrade` - Upgrade tenant subscription (Admin only)

### Health Check
- `GET /api/health` - Application health status

## Role Permissions

### Admin Role
- All Member permissions
- Invite new users to tenant
- Upgrade tenant subscription from Free to Pro

### Member Role
- Create, read, update, delete notes
- View notes from same tenant only

## Subscription Plans

### Free Plan
- Maximum 3 notes per tenant
- All basic note management features

### Pro Plan  
- Unlimited notes
- All Free plan features

## Security Features

- **Tenant Isolation**: Strict data separation using tenant ID filtering
- **JWT Authentication**: Secure token-based authentication
- **Role-based Authorization**: Middleware enforces role permissions
- **CORS Enabled**: Configured for external API access
- **Input Validation**: Server-side validation for all inputs

## Deployment

### Vercel Deployment

1. **Environment Variables**: Set these in Vercel dashboard:
   - `DATABASE_URL`: Your production PostgreSQL connection string
   - `JWT_SECRET`: Secure random string for JWT signing

2. **Deploy**:
   ```bash
   # Connect to Vercel
   npx vercel

   # Deploy
   npx vercel --prod
   ```

### Database Migration in Production

After deployment, run migrations:
```bash
npx prisma db push
npx prisma db seed
```

## Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes
npm run db:seed      # Seed database with test data
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
```

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   │   ├── auth/      # Authentication endpoints
│   │   ├── notes/     # Notes CRUD endpoints
│   │   ├── tenants/   # Tenant management
│   │   └── health/    # Health check
│   ├── globals.css    # Global styles
│   └── page.tsx       # Main application page
├── components/        # React components
│   ├── Dashboard.tsx  # Main dashboard
│   ├── LoginForm.tsx  # Login interface
│   ├── NotesList.tsx  # Notes display
│   └── CreateNoteForm.tsx # Note creation
├── lib/
│   ├── auth.ts        # Authentication utilities
│   └── middleware.ts  # API middleware
└── middleware.ts      # Next.js middleware (CORS)

prisma/
├── schema.prisma      # Database schema
└── seed.ts           # Database seeding script
```

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Deployment**: Vercel
- **Styling**: Tailwind CSS

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
