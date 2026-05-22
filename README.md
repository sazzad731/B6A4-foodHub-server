# FoodHub Backend

FoodHub is a Node.js + Express + Prisma backend for a meal ordering platform.
It supports customer ordering, provider menu management, admin moderation, meal
reviews, and role-based access control.

## Tech Stack

- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT authentication
- bcrypt / bcryptjs

## Roles

- `CUSTOMER`
- `PROVIDER`
- `ADMIN`

Users may register as `CUSTOMER` or `PROVIDER`. `ADMIN` accounts are seeded
through environment variables.

## Core Features

- Public meal and provider browsing
- Meal filtering by search, category, dietary preference, and price range
- Customer registration, login, and profile updates
- Provider registration and profile updates
- Provider meal management
- Cash on Delivery orders
- Strict order status flow
- Meal reviews after ordering
- Admin user and category management
- Pagination and sorting

## Database Notes

The Prisma schema uses `Decimal` for money-related fields.

- `Meal.price`
- `ProviderProfile.deliveryFee`
- `ProviderProfile.totalRevenue`
- `Order.subtotal`
- `Order.deliveryFee`
- `Order.totalPrice`
- `OrderItem.priceAtOrder`
- `OrderItem.subtotal`

Order records also store `deliveryAddress` and `phone`, and order items store
`mealName` as a price/name snapshot.

## Order Status Flow

Allowed transitions:

- `PLACED -> PREPARING`
- `PREPARING -> READY`
- `READY -> DELIVERED`
- `PLACED -> CANCELLED`

Invalid transitions are rejected by the backend.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Configure `.env`:

```env
PORT=5000
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret"
ADMIN_NAME="admin"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="your-password"
NODE_ENV="development"
```

3. Generate Prisma client:

```bash
npx prisma generate
```

4. Seed admin:

```bash
npm run seed:admin
```

5. Start development server:

```bash
npm run dev
```

## Scripts

- `npm run dev` - Start the server in development
- `npm run build` - Compile TypeScript
- `npm start` - Run compiled server
- `npm run seed:admin` - Seed the admin user




## API Base URL

All routes are mounted under:

```text
/api/v1
```

## Main Routes

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/meals`
- `GET /api/v1/meals/featured`
- `GET /api/v1/meals/:id`
- `GET /api/v1/meals/:id/reviews`
- `GET /api/v1/providers`
- `GET /api/v1/providers/:id`
- `POST /api/v1/orders`
- `GET /api/v1/orders`
- `GET /api/v1/orders/:id`
- `POST /api/v1/meals/provider`
- `PUT /api/v1/meals/provider/:id`
- `DELETE /api/v1/meals/provider/:id`
- `PATCH /api/v1/orders/provider/:id`
- `GET /api/v1/admin/users`
- `PATCH /api/v1/admin/users/:id`
- `GET /api/v1/admin/orders`
- `GET /api/v1/admin/categories`
---
**See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) API documentation for more detail**
---


## Notes

- Authentication works with both the `token` cookie and `Authorization: Bearer`
  header.
- Sensitive fields like `password` are not returned in API responses.
- Providers can only manage their own meals.
- Customers can only review meals after ordering them.
