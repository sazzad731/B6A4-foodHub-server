# API Documentation

Base URL:

```text
/api/v1
```

## Common Response Shape

Successful response:

```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {}
}
```

Error response:

```json
{
  "success": false,
  "message": "You are not authorized",
  "error": "..."
}
```

## Authentication

### Register User

- `POST /auth/register`
- Access: Public

Request body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "role": "CUSTOMER",
  "phone": "01700000000",
  "address": "Dhaka"
}
```

Provider registration may also include:

```json
{
  "restaurantName": "Food House",
  "description": "Fast casual meals",
  "image": "https://...",
  "deliveryFee": 60,
  "cuisineTypes": ["bangla", "fast-food"]
}
```

Notes:

- `ADMIN` registration is blocked.
- Providers are created with an attached provider profile.

### Login User

- `POST /auth/login`
- Access: Public

Request body:

```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

Notes:

- Returns a JWT in the response body.
- Also sets the `token` cookie.

### Get Current User

- `GET /auth/me`
- Access: Authenticated users

## Users

### Get All Users

- `GET /users`
- `GET /admin/users`
- Access: `ADMIN`

### Update User Status

- `PATCH /users/:id`
- `PATCH /admin/users/:id`
- Access: `ADMIN`

Request body:

```json
{
  "status": "ACTIVE"
}
```

Allowed values:

- `ACTIVE`
- `SUSPENDED`

### Update Own Profile

- `PATCH /users/me`
- Access: `CUSTOMER`, `PROVIDER`, `ADMIN`

Request body may include:

```json
{
  "name": "New Name",
  "phone": "01800000000",
  "address": "Chattogram",
  "image": "https://..."
}
```

Provider users may also update:

```json
{
  "restaurantName": "Updated Restaurant",
  "description": "Updated description",
  "deliveryFee": 80,
  "cuisineTypes": ["thai", "fusion"],
  "isOpen": true
}
```

## Meals

### Get All Meals

- `GET /meals`
- Access: Public

Query params supported:

- `search`
- `category`
- `cuisine`
- `cuisineType`
- `dietary`
- `dietaryPreference`
- `isVegan`
- `price_range`
- `minPrice`
- `maxPrice`
- `page`
- `limit`
- `sortBy`
- `sortOrder`

### Get Featured Meals

- `GET /meals/featured`
- Access: Public

### Get Meal Details

- `GET /meals/:id`
- Access: Public

### Get Meal Reviews

- `GET /meals/:id/reviews`
- Access: Public

### Add Meal Review

- `POST /meals/:id/reviews`
- Access: `CUSTOMER`

Request body:

```json
{
  "rating": 5,
  "comment": "Great taste"
}
```

Notes:

- Customer must have ordered the meal first.
- Review is tied to the customer-meal pair.

### Add Meal To Menu

- `POST /meals/provider`
- Access: `PROVIDER`

Request body:

```json
{
  "categoryId": "category-id",
  "title": "Burger",
  "description": "Beef burger",
  "price": 250,
  "image": "https://...",
  "prepTime": 20,
  "isAvailable": true,
  "isVegan": false,
  "tags": ["burger", "fast-food"]
}
```

### Update Meal

- `PUT /meals/provider/:id`
- Access: `PROVIDER`

Notes:

- Providers can only update their own meals.

### Delete Meal

- `DELETE /meals/provider/:id`
- Access: `PROVIDER`

Notes:

- Providers can only delete their own meals.

## Providers

### Get All Providers

- `GET /providers`
- `GET /provider`
- `GET /provider/get-all`
- Access: Public

Query params supported:

- `location`
- `page`
- `limit`
- `sortBy`
- `sortOrder`

### Get Provider By Id

- `GET /providers/:id`
- Access: Public

### Create or Update Provider Profile

- `POST /providers`
- `POST /provider`
- Access: `PROVIDER`

Request body may include:

```json
{
  "restaurantName": "Food House",
  "description": "Updated text",
  "address": "Dhaka",
  "phone": "01700000000",
  "image": "https://...",
  "deliveryFee": 60,
  "cuisineTypes": ["bangla", "fast-food"]
}
```

## Categories

### Get All Categories

- `GET /categories`
- `GET /category`
- `GET /category/get-all`
- Access: Public

### Create Category

- `POST /categories`
- `POST /category`
- `POST /category/add-one`
- Access: `ADMIN`

Request body:

```json
{
  "name": "Bangla",
  "image": "https://..."
}
```

### Update Category

- `PATCH /categories/:id`
- `PATCH /category/:id`
- Access: `ADMIN`

### Delete Category

- `DELETE /categories/:id`
- `DELETE /category/:id`
- Access: `ADMIN`

## Orders

### Create Order

- `POST /orders`
- Access: `CUSTOMER`

Request body:

```json
{
  "deliveryAddress": "Dhaka",
  "phone": "01700000000",
  "deliveryNote": "Call before delivery",
  "items": [
    {
      "mealId": "meal-id",
      "quantity": 2
    }
  ]
}
```

Notes:

- `customerId` is taken from the authenticated user.
- The backend fetches meal data and calculates `totalPrice`.
- All items in one order must belong to the same provider.
- Price snapshots are stored on order items.
- Payment method is Cash on Delivery.

### Get Orders

- `GET /orders`
- Access:
  - `CUSTOMER`: own orders
  - `PROVIDER`: orders for own meals
  - `ADMIN`: all orders

Query params supported:

- `status`
- `search`

Admin dashboard usage:

- Daily order charts can be built from the `createdAt` field returned by this endpoint.
- Revenue totals should be calculated from delivered orders using `totalPrice`.

### Get Order Details

- `GET /orders/:id`
- Access:
  - `CUSTOMER`: own order only
  - `PROVIDER`: own orders only
  - `ADMIN`: any order

### Update Order Status

- `PATCH /orders/provider/:id`
- Access: `PROVIDER`

Request body:

```json
{
  "status": "PREPARING"
}
```

Allowed values:

- `PLACED`
- `PREPARING`
- `READY`
- `DELIVERED`
- `CANCELLED`

Strict transitions:

- `PLACED -> PREPARING`
- `PREPARING -> READY`
- `READY -> DELIVERED`
- `PLACED -> CANCELLED`

## Authentication Rules

- `token` cookie is supported.
- `Authorization: Bearer <token>` is supported.
- Suspended users cannot access protected routes.

## Response Notes

- Validation errors return `400`.
- Unauthorized access returns `401`.
- Missing records return `404` or `400` depending on the Prisma error path.
