# Forge - Vending Inventory Optimizer

Industrial vending inventory optimization app that connects to vending systems (AutoCrib, CribMaster) and ERP systems (Epicor Prophet 21) to analyze usage and recommend optimal min/max stock levels.

## Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes + tRPC for type-safe APIs
- **Database**: PostgreSQL with Prisma ORM
- **Adapters**: Swappable integration layer for vending/ERP systems

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── api/trpc/          # tRPC API endpoint
│   ├── customers/         # Customer list and detail pages
│   └── page.tsx           # Dashboard
├── components/            # React components
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── adapters/          # Vending/ERP integration adapters
│   │   ├── mock/          # Mock data provider for development
│   │   └── types.ts       # Adapter interfaces
│   ├── db.ts              # Prisma client
│   ├── trpc.ts            # tRPC client
│   └── utils.ts           # Utilities
├── server/
│   ├── services/
│   │   └── calculation.ts # Min/max calculation engine
│   └── trpc/
│       ├── router.ts      # Main tRPC router
│       ├── trpc.ts        # tRPC initialization
│       └── routers/       # Individual routers
prisma/
└── schema.prisma          # Database schema
scripts/
└── seed.ts                # Database seeding script
```

## Business Logic

### Min/Max Calculation Formula
- **Safety Stock**: 11 days of average daily usage
- **Minimum**: Safety stock + 7 days = 18 days of usage
- **Maximum**: Minimum × 2 = 36 days of usage
- **Replenishment**: Weekly (7 days)
- **Rounding**: All values rounded up to package quantity

### Warehouse Backup
- Backup = (Daily usage × (Replenishment cycle + Supplier lead time))

## Development Commands

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with sample data
npm run db:seed

# Run development server
npm run dev

# Build for production
npm run build
```

## Database Setup

1. Ensure PostgreSQL is running
2. Update `.env` with your database URL:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/forge"
   ```
3. Run `npm run db:push` to create tables
4. Run `npm run db:seed` to populate sample data

## Key Files

- `src/server/services/calculation.ts` - Min/max calculation logic
- `src/lib/adapters/types.ts` - Adapter interfaces for integrations
- `prisma/schema.prisma` - Database models
- `src/app/customers/[id]/page.tsx` - Customer detail with recommendations
