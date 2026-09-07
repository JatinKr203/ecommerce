# E-commerce Backend

This directory contains the Node.js and Express backend for the kitchen-products e-commerce application. It exposes REST APIs for authentication, user profiles, products, categories, carts, orders, and admin order management. MongoDB is accessed through Mongoose.

This document describes the implementation currently present in this repository. Details that are not explicitly specified by the code are marked accordingly.

## 1. Backend Overview

### What the backend does

The backend provides the server-side API for the e-commerce application. Its responsibilities include:

- Registering users and authenticating them with email and password.
- Issuing and verifying JSON Web Tokens (JWTs).
- Returning the authenticated user's profile and updating the user's name.
- Listing and retrieving active products.
- Creating, updating, deactivating, and restocking products for administrators.
- Listing, creating, updating, and deactivating categories for administrators.
- Maintaining one cart per user.
- Validating cart product IDs, quantities, and stock availability.
- Creating orders from the authenticated user's cart.
- Decreasing product stock when an order is created.
- Clearing the cart after a successful order transaction.
- Returning a user's order history and individual order details.
- Listing all orders and updating order status for administrators.
- Providing a health-check endpoint.

### Technologies used

The actual dependencies in `package.json` are:

- Node.js
- CommonJS modules
- Express `^5.2.1`
- MongoDB through Mongoose `^9.9.4`
- `bcrypt` for password hashing and comparison
- `jsonwebtoken` for JWT creation and verification
- `express-validator` for request validation
- `cors` for cross-origin requests
- `cookie-parser`
- `dotenv`
- `multer` is installed, but no current route or controller uses it.
- `nodemon` is installed as a development dependency, but no `dev` script is defined.

### How the frontend communicates with it

The frontend sends HTTP requests to the backend API. The current frontend configuration uses:

```text
VITE_API_BASE_URL=http://localhost:3000/api
```

The backend allows the origin in `CLIENT_URL`, which is currently configured as:

```text
CLIENT_URL=http://localhost:5173
```

Protected requests send the JWT in this header:

```http
Authorization: Bearer <jwt-token>
```

The backend does not use a login cookie for authentication. Although `cookie-parser` is registered, the current authentication middleware reads the token only from the `Authorization` header.

## 2. Project Architecture

The project uses a conventional Express route/controller/model structure.

### Express application

[app.js](app.js) creates the Express application and registers:

1. CORS.
2. `cookieParser()`.
3. JSON request parsing.
4. URL-encoded request parsing.
5. The health endpoint.
6. The route modules.
7. The not-found handler.
8. The general error handler.

`app.js` exports the configured Express application. It does not open the server port itself.

### Server startup

[server.js](server.js) loads environment variables, imports the app, connects to MongoDB through `connectDB()`, and starts listening only after the database connection succeeds.

The port is read from `process.env.PORT`, with a code fallback of `5000`. The checked-in `.env` currently sets it to `3000`.

### Routes

The route files define URL paths and middleware chains. They do not contain database logic.

- [routes/auth.routes.js](routes/auth.routes.js)
- [routes/user.routes.js](routes/user.routes.js)
- [routes/product.routes.js](routes/product.routes.js)
- [routes/category.routes.js](routes/category.routes.js)
- [routes/cart.routes.js](routes/cart.routes.js)
- [routes/order.routes.js](routes/order.routes.js)
- [routes/admin.routes.js](routes/admin.routes.js)

### Controllers

Controllers receive requests, perform business operations, call Mongoose models, and send JSON responses.

- `auth.controller.js`: `register`, `login`
- `user.controller.js`: `getProfile`, `updateProfile`
- `product.controller.js`: `listProducts`, `getProduct`, `createProduct`, `updateProduct`, `deleteProduct`, `updateStock`
- `category.controller.js`: `listCategories`, `createCategory`, `updateCategory`, `deleteCategory`
- `cart.controller.js`: `getCart`, `addToCart`, `updateCartItem`, `removeCartItem`
- `order.controller.js`: `createOrder`, `getMyOrders`, `getMyOrder`
- `admin.controller.js`: `adminListOrders`, `updateOrderStatus`

### Models

The model files define Mongoose schemas and export model objects:

- `User` in [models/User.js](models/User.js)
- `Product` in [models/Product.js](models/Product.js)
- `Category` in [models/Category.js](models/Category.js)
- `Cart` in [models/Cart.js](models/Cart.js)
- `Order` in [models/Order.js](models/Order.js)

### Middleware

- [middleware/auth.js](middleware/auth.js): verifies a Bearer JWT and sets `req.user`.
- [middleware/admin.js](middleware/admin.js): checks `req.user.role === "admin"`.
- [middleware/validate.js](middleware/validate.js): returns express-validator errors as a `400` response.
- [middleware/error.middleware.js](middleware/error.middleware.js): handles unknown routes and unexpected errors.

### Database connection

[config/db.js](config/db.js) exports `connectDB()`. It calls `mongoose.connect(process.env.MONGO_URI)`. The file also sets DNS servers to `8.8.8.8` and `1.1.1.1` before connecting.

### Utilities and helpers

There is no separate `utils` or `helpers` directory in the backend. The seed script contains a local `slugify()` helper for category slugs.

### Seed scripts

[scripts/seedProducts.js](scripts/seedProducts.js) reads [products.json](products.json), upserts categories, and upserts products by SKU. It is run through the `seed:products` npm script.

### Error handling

The application registers `notFound` and `errorHandler` from `middleware/error.middleware.js` after all route modules.

Known behavior:

- Validation middleware handles express-validator failures directly.
- Controllers handle many expected resource failures directly.
- Unexpected errors are passed to `next(err)`.
- `errorHandler` logs the error and returns status `err.statusCode` when present, otherwise `500` with `Internal server error`.
- Mongoose validation, cast, and duplicate-key errors do not have specialized formatting in the current error handler.

### Request lifecycle

```text
Frontend
  -> HTTP request to /api/...
  -> Express app in app.js
  -> Global middleware: CORS, cookies, JSON/body parsing
  -> Route module
  -> Optional validation middleware
  -> Optional authenticate middleware
  -> Optional authorizeAdmin middleware
  -> Controller function
  -> Mongoose model/query
  -> MongoDB
  -> Controller JSON response
  -> Frontend
```

For example, a protected cart update follows this path:

```text
PUT /api/cart/:productId
  -> cart.routes.js
  -> authenticate in middleware/auth.js
  -> quantityRules in validators/cart.validator.js
  -> validate in middleware/validate.js
  -> updateCartItem in controllers/cart.controller.js
  -> Cart and Product models
  -> MongoDB
  -> { success: true, cart }
```

## 3. Project Structure

```text
backend/
├── .env
├── .gitignore
├── app.js
├── package.json
├── package-lock.json
├── products.json
├── server.js
├── config/
│   └── db.js
├── controllers/
│   ├── admin.controller.js
│   ├── auth.controller.js
│   ├── cart.controller.js
│   ├── category.controller.js
│   ├── order.controller.js
│   ├── product.controller.js
│   └── user.controller.js
├── middleware/
│   ├── admin.js
│   ├── auth.js
│   ├── error.middleware.js
│   └── validate.js
├── models/
│   ├── Cart.js
│   ├── Category.js
│   ├── Order.js
│   ├── Product.js
│   └── User.js
├── routes/
│   ├── admin.routes.js
│   ├── auth.routes.js
│   ├── cart.routes.js
│   ├── category.routes.js
│   ├── order.routes.js
│   ├── product.routes.js
│   └── user.routes.js
├── scripts/
│   └── seedProducts.js
└── validators/
    ├── auth.validator.js
    ├── cart.validator.js
    ├── order.validator.js
    └── product.validator.js
```

### Important files and connections

| File/folder | Purpose | Connections |
|---|---|---|
| `app.js` | Creates Express app, registers global middleware, mounts routes, registers error handling. | Imports every route module and the error middleware. |
| `server.js` | Starts the server after MongoDB connects. | Imports `app.js` and `config/db.js`. |
| `config/db.js` | Connects Mongoose to `MONGO_URI`. | Called by `server.js` and the seed script. |
| `routes/` | Defines URL paths and middleware/controller chains. | Imports validators, middleware, and controllers. |
| `controllers/` | Contains request handling and business logic. | Imports Mongoose models. |
| `models/` | Defines MongoDB document schemas and model relationships. | Used by controllers and the seed script. |
| `middleware/` | Authentication, authorization, validation, and error behavior. | Inserted into route chains or registered globally in `app.js`. |
| `validators/` | Express-validator rules for request bodies and IDs. | Applied by route modules before controllers. |
| `products.json` | Original catalog seed input. | Read by `scripts/seedProducts.js`. |
| `scripts/seedProducts.js` | Idempotently loads categories and products into MongoDB. | Imports DB config, `Category`, and `Product`. |

## 4. Environment Setup

### Node.js version

The repository does not specify a required Node.js version in `package.json`, `.nvmrc`, or `engines`. Use a current Node.js version compatible with the installed dependencies. The exact required version is **not explicitly specified in the code**.

### Install dependencies

From the backend directory:

```powershell
cd "d:\backend projects\ecommerce\backend"
npm.cmd install
```

### Environment variables

Create a `.env` file in `backend/` with values like these. Do not commit real credentials.

```env
PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
JWT_SECRET=<long-random-secret>
CLIENT_URL=http://localhost:5173
```

Actual variables read by the code:

- `PORT`: server port. `server.js` falls back to `5000` if it is missing.
- `MONGO_URI`: MongoDB connection string used by `mongoose.connect()`.
- `JWT_SECRET`: used to sign and verify JWTs.
- `CLIENT_URL`: allowed CORS origin. `app.js` falls back to `http://localhost:5173` if it is missing.

The current checked-in `.env` contains real-looking credentials. Those values should be rotated and kept out of version control. This README intentionally does not reproduce them.

### MongoDB configuration

MongoDB is configured through `MONGO_URI`. The application connects before opening the HTTP server. If the connection fails, `server.js` logs the failure and exits the process.

### Start command

```powershell
npm.cmd start
```

This runs:

```text
node server.js
```

### Development command

`nodemon` is installed in `devDependencies`, but `package.json` does not define an `npm run dev` script. A development command is therefore **not explicitly provided in the code**. A developer may invoke nodemon directly, but that is an operational choice rather than a repository-defined script.

### Product seed command

```powershell
npm.cmd run seed:products
```

This runs:

```text
node scripts/seedProducts.js
```

### Frontend API URL

The current frontend uses:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## 5. API Documentation

The base URL is:

```text
http://localhost:3000/api
```

Unless otherwise stated, successful responses include `success: true`. Error responses generally include `success: false` and either `message` or `errors`.

### Health

#### `GET /api/health`

- Authentication: none.
- Role: none.
- Body: none.
- Query parameters: none.
- URL parameters: none.

Success response:

```json
{
  "success": true,
  "message": "API is running smoothly"
}
```

Purpose: verifies that the Express application is running.

### Authentication

#### `POST /api/auth/register`

- Authentication: none.
- Role: none.
- Body:

```json
{
  "name": "Asha Kumar",
  "email": "asha@example.com",
  "password": "password123"
}
```

Validation:

- `name` must be non-empty after trimming.
- `email` must be a valid email.
- `password` must have at least 8 characters.

Success response, status `201`:

```json
{
  "success": true,
  "user": {
    "id": "<user-object-id>",
    "name": "Asha Kumar",
    "email": "asha@example.com"
  }
}
```

Important errors:

- `400`: validation errors in `{ success: false, errors: [...] }`.
- `409`: `{ success: false, message: "Email already registered" }`.
- `500`: unexpected server error.

The registration controller does not return a JWT. The frontend must log in separately after registration.

#### `POST /api/auth/login`

- Authentication: none.
- Role: none.
- Body:

```json
{
  "email": "asha@example.com",
  "password": "password123"
}
```

Validation:

- `email` must be valid.
- `password` must be non-empty.

Success response:

```json
{
  "success": true,
  "token": "<jwt>",
  "user": {
    "id": "<user-object-id>",
    "name": "Asha Kumar",
    "role": "user"
  }
}
```

Important errors:

- `400`: validation errors.
- `401`: `{ success: false, message: "Invalid credentials" }`.
- `500`: unexpected server error.

### User/profile

#### `GET /api/users/profile`

- Authentication: required.
- Role: any authenticated user.
- Header: `Authorization: Bearer <jwt>`.
- Body/query/URL parameters: none.

Success response:

```json
{
  "success": true,
  "user": {
    "_id": "<user-object-id>",
    "name": "Asha Kumar",
    "email": "asha@example.com",
    "role": "user",
    "createdAt": "<timestamp>",
    "updatedAt": "<timestamp>"
  }
}
```

The password is excluded with `.select("-password")`.

Important errors:

- `401`: missing, invalid, or expired token.
- `404`: `User not found`.
- `500`: unexpected server error.

#### `PUT /api/users/profile`

- Authentication: required.
- Role: any authenticated user.
- Body:

```json
{
  "name": "Updated Name"
}
```

Only `name` is accepted by `updateProfile`. Email, role, password, address, and other fields are not updated by this controller.

Success response:

```json
{
  "success": true,
  "user": {
    "_id": "<user-object-id>",
    "name": "Updated Name",
    "email": "asha@example.com",
    "role": "user"
  }
}
```

Important errors:

- `400`: `{ success: false, message: "A valid name is required" }`.
- `401`: authentication failure.
- `404`: user not found.
- `500`: unexpected server error.

### Products

#### `GET /api/products`

- Authentication: none.
- Role: none.
- Body: none.
- Query parameters:
  - `search`: text search using the Product text index on `name`, `description`, and `tags`.
  - `category`: category ObjectId used in the product filter.
  - `minPrice`: numeric lower bound for `price`.
  - `maxPrice`: numeric upper bound for `price`.
  - `sort`: value passed to Mongoose `.sort()`. Default: `-createdAt`.
  - `page`: page number. Default: `1`.
  - `limit`: page size. Default: `12`.

Example:

```text
GET /api/products?search=air&category=<category-object-id>&minPrice=1000&maxPrice=10000&sort=-rating&page=1&limit=12
```

Success response:

```json
{
  "success": true,
  "items": [
    {
      "_id": "<product-object-id>",
      "legacyId": 2,
      "name": "Cello Air Fryer",
      "category": "<category-object-id>",
      "price": 8049,
      "discountPrice": 7646,
      "stock": 100,
      "rating": 4.6,
      "reviewCount": 2199
    }
  ],
  "total": 200,
  "page": 1,
  "pages": 17
}
```

The list controller filters `isActive: true`. It does not populate the category reference in this response.

Important errors:

- `500`: database, query, or unexpected error.

#### `GET /api/products/:id`

- Authentication: none.
- Role: none.
- URL parameter: `id`, expected to be a MongoDB ObjectId.
- Body/query parameters: none.

Success response:

```json
{
  "success": true,
  "product": {
    "_id": "<product-object-id>",
    "name": "Cello Air Fryer",
    "category": {
      "_id": "<category-object-id>",
      "name": "Appliances",
      "slug": "appliances"
    },
    "price": 8049,
    "discountPrice": 7646,
    "stock": 100,
    "reviewCount": 2199
  }
}
```

The detail controller populates `category` with `name` and `slug`.

Important errors:

- `404`: `{ success: false, message: "Product not found" }`.
- A malformed Mongo ID reaches Mongoose and is handled by the general error handler rather than a dedicated ID validator on this public route.
- `500`: unexpected database/server error.

#### `POST /api/products`

- Authentication: required.
- Required role: admin.
- Middleware order: `authenticate`, `authorizeAdmin`, `productRules`, `validate`.
- Body fields validated by `productRules`:

```json
{
  "name": "Daily Saucepan",
  "price": 1200,
  "stock": 20,
  "sku": "PAN-DAI-0001",
  "category": "<category-object-id>"
}
```

The Product schema supports many additional fields documented in the database section. The controller passes `req.body` directly to `Product.create()`.

Success response, status `201`:

```json
{
  "success": true,
  "product": { "<created-product-document>" }
}
```

Important errors:

- `400`: validation error.
- `401`: missing/invalid token.
- `403`: non-admin user.
- `500`: schema, duplicate-key, or unexpected database error.

#### `PUT /api/products/:id`

- Authentication: required.
- Required role: admin.
- URL parameter: `id`, validated as MongoDB ObjectId.
- Body: the same `productRules` are applied, so `name`, `price`, `stock`, `sku`, and `category` are required by validation even for updates.

Success response:

```json
{
  "success": true,
  "product": { "<updated-product-document>" }
}
```

Important errors:

- `400`: invalid ID or body validation errors.
- `401`: authentication failure.
- `403`: non-admin user.
- `404`: product not found.
- `500`: database or unexpected error.

#### `DELETE /api/products/:id`

- Authentication: required.
- Required role: admin.
- URL parameter: `id`, validated as MongoDB ObjectId.
- Body: none.

This is a soft delete. The controller updates `isActive` to `false`; it does not remove the document.

Success response:

```json
{
  "success": true,
  "message": "Product deactivated",
  "product": { "<deactivated-product-document>" }
}
```

Important errors: `400`, `401`, `403`, `404`, and `500` as appropriate.

#### `PATCH /api/products/:id/stock`

- Authentication: required.
- Required role: admin.
- URL parameter: `id`, validated as MongoDB ObjectId.
- Body: the controller reads `quantity` from `req.body`.

```json
{
  "quantity": 5
}
```

A positive quantity increases stock. A negative quantity decreases stock, provided the resulting stock does not become negative.

Success response:

```json
{
  "success": true,
  "message": "Stock updated",
  "stock": 25
}
```

Important errors:

- `400`: invalid product ID.
- `401`: authentication failure.
- `403`: non-admin user.
- `409`: `{ success: false, message: "Insufficient stock" }` when the update cannot be applied.
- `500`: unexpected error.

There is no dedicated validator for the stock body in the current route. `quantity` is converted with `Number()` in the controller.

### Categories

#### `GET /api/categories`

- Authentication: none.
- Role: none.
- Body/query/URL parameters: none.

Success response:

```json
{
  "success": true,
  "categories": [
    {
      "_id": "<category-object-id>",
      "name": "Appliances",
      "slug": "appliances",
      "isActive": true
    }
  ]
}
```

Only categories with `isActive: true` are returned.

#### `POST /api/categories`

- Authentication: required.
- Required role: admin.
- Body must contain the schema-required fields:

```json
{
  "name": "Bakeware",
  "slug": "bakeware"
}
```

There is no express-validator chain on this route. Mongoose schema validation applies when the document is created.

Success response, status `201`:

```json
{
  "success": true,
  "category": { "<created-category-document>" }
}
```

Important errors: `401`, `403`, `500`, including Mongoose required/unique validation failures.

#### `PUT /api/categories/:id`

- Authentication: required.
- Required role: admin.
- URL parameter: category MongoDB ObjectId.
- Body: fields passed directly to `findByIdAndUpdate()`.

Success response:

```json
{
  "success": true,
  "category": { "<updated-category-document>" }
}
```

Important errors: `401`, `403`, `404`, and database/validation errors.

#### `DELETE /api/categories/:id`

- Authentication: required.
- Required role: admin.
- URL parameter: category MongoDB ObjectId.
- Body: none.

This is a soft delete that sets `isActive` to `false`.

Success response:

```json
{
  "success": true,
  "message": "Category deactivated",
  "category": { "<updated-category-document>" }
}
```

### Cart

All cart endpoints require an authenticated user. The cart is selected by `req.user.userId`.

#### `GET /api/cart`

- Authentication: required.
- Role: any authenticated user.
- Body/query/URL parameters: none.

If no cart exists:

```json
{
  "success": true,
  "cart": { "items": [] },
  "subtotal": 0
}
```

If a cart exists, the controller populates `items.product` and calculates:

```text
subtotal = product.price * quantity for each item
```

Response shape:

```json
{
  "success": true,
  "cart": {
    "_id": "<cart-object-id>",
    "user": "<user-object-id>",
    "items": [
      {
        "product": { "<populated-product-document>" },
        "quantity": 2
      }
    ]
  },
  "subtotal": 16098
}
```

#### `POST /api/cart`

- Authentication: required.
- Role: any authenticated user.
- Body:

```json
{
  "productId": "<product-mongo-object-id>",
  "quantity": 1
}
```

Validation:

- `productId` is required and must be a MongoDB ObjectId.
- `quantity`, if supplied, must be an integer of at least `1`.

The controller verifies the product exists, is active, and has at least the requested quantity in stock. If the product is already in the cart, the requested quantity is added to the existing quantity.

Success response, status `201`:

```json
{
  "success": true,
  "cart": { "<cart-document-with-product-references>" }
}
```

Important errors:

- `400`: validation error or `Insufficient stock`.
- `401`: authentication failure.
- `404`: `Product unavailable`.
- `500`: unexpected error.

The controller checks the new quantity against stock only for the quantity being added, not the existing cart quantity plus the new quantity. This is a visible implementation limitation.

#### `PUT /api/cart/:productId`

- Authentication: required.
- Role: any authenticated user.
- URL parameter: product MongoDB ObjectId.
- Body:

```json
{
  "quantity": 2
}
```

The controller checks that the cart item exists and that the product has enough stock for the requested final quantity.

Success response:

```json
{
  "success": true,
  "cart": { "<updated-cart-document>" }
}
```

Important errors:

- `400`: validation error or insufficient stock.
- `401`: authentication failure.
- `404`: cart or item not found.
- `500`: unexpected error.

#### `DELETE /api/cart/:productId`

- Authentication: required.
- Role: any authenticated user.
- URL parameter: product MongoDB ObjectId.
- Body: none.

The item is removed from the authenticated user's cart.

Success response:

```json
{
  "success": true,
  "cart": { "<updated-cart-document>" }
}
```

Important errors: `401`, `404` if no cart exists, and `500`.

There is no `DELETE /api/cart` or clear-cart endpoint in the current backend.

### Orders

#### `POST /api/orders`

- Authentication: required.
- Role: any authenticated user.
- Body:

```json
{
  "shippingAddress": "Asha Kumar, 12 Market Street, Mumbai, Maharashtra 400001, India"
}
```

Only `shippingAddress` is validated. Payment fields, delivery-method fields, and separate address fields are not accepted by this controller.

The controller:

1. Starts a MongoDB session and transaction.
2. Loads the current user's cart and populates product documents.
3. Rejects an empty cart.
4. Rejects inactive or unavailable products.
5. Rejects quantities greater than current stock.
6. Calculates `totalAmount` using `product.price * quantity`.
7. Copies product ID, name, price, and quantity into order items.
8. Decreases product stock inside the transaction.
9. Creates the order.
10. Clears the cart.
11. Commits the transaction.

Success response, status `201`:

```json
{
  "success": true,
  "order": {
    "_id": "<order-object-id>",
    "user": "<user-object-id>",
    "items": [
      {
        "product": "<product-object-id>",
        "name": "Cello Air Fryer",
        "price": 8049,
        "quantity": 1
      }
    ],
    "totalAmount": 8049,
    "shippingAddress": "Asha Kumar, 12 Market Street, Mumbai, Maharashtra 400001, India",
    "status": "pending"
  }
}
```

Important errors:

- `400`: validation failure, empty cart, unavailable product, or insufficient stock.
- `401`: authentication failure.
- `500`: transaction/database failure.

#### `GET /api/orders`

- Authentication: required.
- Role: any authenticated user.
- Body/query/URL parameters: none.

Success response:

```json
{
  "success": true,
  "orders": [
    {
      "_id": "<order-object-id>",
      "user": "<user-object-id>",
      "items": [],
      "totalAmount": 8049,
      "shippingAddress": "...",
      "status": "pending",
      "createdAt": "<timestamp>",
      "updatedAt": "<timestamp>"
    }
  ]
}
```

Orders are filtered by the authenticated user and sorted by `-createdAt`.

#### `GET /api/orders/:id`

- Authentication: required.
- Role: any authenticated user.
- URL parameter: order MongoDB ObjectId.
- Body/query parameters: none.

The controller searches by both `_id` and `user`, so a user cannot retrieve another user's order through this controller.

Success response:

```json
{
  "success": true,
  "order": { "<order-document>" }
}
```

Important errors:

- `401`: authentication failure.
- `404`: `Order not found`.
- `500`: unexpected error.

### Admin

Admin routes require both `authenticate` and `authorizeAdmin`. The admin middleware checks the JWT-derived `req.user.role`.

#### `GET /api/admin/orders`

- Authentication: required.
- Required role: `admin`.
- Body/query/URL parameters: none.

Success response:

```json
{
  "success": true,
  "orders": [
    {
      "_id": "<order-object-id>",
      "user": {
        "_id": "<user-object-id>",
        "name": "Asha Kumar",
        "email": "asha@example.com"
      },
      "items": [],
      "totalAmount": 8049,
      "status": "pending"
    }
  ]
}
```

The user is populated with only `name` and `email`.

Important errors:

- `401`: missing or invalid JWT.
- `403`: `Admin access required` for non-admin users.
- `500`: unexpected error.

#### `PUT /api/admin/orders/:id/status`

- Authentication: required.
- Required role: `admin`.
- URL parameter: order MongoDB ObjectId.
- Body:

```json
{
  "status": "shipped"
}
```

Allowed statuses are exactly:

```text
pending, confirmed, shipped, delivered, cancelled
```

Success response:

```json
{
  "success": true,
  "order": { "<updated-order-document>" }
}
```

Important errors:

- `400`: invalid status.
- `401`: authentication failure.
- `403`: non-admin user.
- `404`: order not found.
- `500`: unexpected error.

## 6. Authentication and Authorization

### Registration flow

1. Client sends `POST /api/auth/register` with `name`, `email`, and `password`.
2. `auth.routes.js` applies `registerRules` and `validate`.
3. `auth.controller.register` checks for an existing email.
4. The password is hashed using `bcrypt.hash(password, 12)`.
5. A `User` document is created.
6. The response returns the new user's ID, name, and email.
7. No token is issued by registration.

### Login flow

1. Client sends `POST /api/auth/login`.
2. `loginRules` validates the email and password presence.
3. `auth.controller.login` finds the user by email.
4. `bcrypt.compare()` compares the submitted password with the stored hash.
5. `jwt.sign()` creates a token containing:

```json
{
  "userId": "<user-object-id>",
  "role": "user-or-admin"
}
```

6. The token expires in `7d`.
7. The response returns the token and limited user information.

### Password handling

Passwords are hashed before storage with bcrypt using a cost factor of `12`. Login compares the submitted password to the stored hash. The profile controller excludes the password when returning user data.

### JWT verification

[middleware/auth.js](middleware/auth.js) reads `req.headers.authorization` and requires it to start with `Bearer `. It extracts the token and calls `jwt.verify(token, process.env.JWT_SECRET)`. The decoded payload is assigned to `req.user`.

Expected header:

```http
Authorization: Bearer <jwt-token>
```

### Admin role protection

[middleware/admin.js](middleware/admin.js) checks:

```js
req.user?.role === "admin"
```

Product mutations, category mutations, and admin order routes use this middleware after authentication.

### Missing, invalid, or expired tokens

- Missing header or missing `Bearer ` prefix: `401 Token required`.
- Invalid or expired JWT: `401 Invalid or expired token`.
- Valid user token against an admin route: `403 Admin access required`.

There is no refresh-token endpoint or logout endpoint in the backend. Logout is a client-side token removal operation in the current frontend.

## 7. Database Design

All schemas use Mongoose. `User`, `Product`, `Category`, `Cart`, and `Order` use timestamps, which adds `createdAt` and `updatedAt`.

### User

- File: `models/User.js`
- Model name: `User`
- Collection name: Mongoose-derived collection name; the explicit collection name is not specified.
- `name`: `String`, required, trimmed.
- `email`: `String`, required, unique, lowercase, trimmed.
- `password`: `String`, required. Stores a bcrypt hash after registration.
- `role`: `String`, enum `user | admin`, default `user`.
- Timestamps: enabled.

### Product

- File: `models/Product.js`
- Model name: `Product`
- `legacyId`: `Number`, optional. Receives the original JSON `id` during seeding.
- `name`: `String`, required, trimmed.
- `slug`: `String`, required, unique.
- `brand`: `String`.
- `category`: MongoDB `ObjectId`, required, references `Category`.
- `subcategory`: `String`.
- `description`: `String`.
- `price`: `Number`, required, minimum `0`.
- `discountPrice`: `Number`, minimum `0`.
- `stock`: `Number`, required, minimum `0`.
- `sku`: `String`, required, unique.
- `rating`: `Number`, minimum `0`, maximum `5`, default `0`.
- `reviewCount`: `Number`, default `0`.
- `images`: array of strings.
- `thumbnail`: `String`.
- `colors`: array of strings.
- `sizes`: array of strings.
- `material`: `String`.
- `capacity`: `String`.
- `weight`: `String`.
- `isBestSeller`: `Boolean`.
- `isFeatured`: `Boolean`.
- `isNewArrival`: `Boolean`.
- `isTrending`: `Boolean`.
- `freeDelivery`: `Boolean`.
- `cashOnDelivery`: `Boolean`.
- `returnDays`: `Number`.
- `warranty`: `String`.
- `tags`: array of strings.
- `vendor`: `String`.
- `origin`: `String`.
- `isActive`: `Boolean`, default `true`.
- Timestamps: enabled.
- Text index: `name`, `description`, and `tags`.

`discountPercentage` exists in the original `products.json`, but it is not declared in the current Product schema. With Mongoose's default strict schema behavior, it is not a declared persisted Product field.

### Category

- File: `models/Category.js`
- Model name: `Category`
- `name`: `String`, required, unique, trimmed.
- `slug`: `String`, required, unique.
- `isActive`: `Boolean`, default `true`.
- Timestamps: enabled.

### Cart

- File: `models/Cart.js`
- Model name: `Cart`
- `user`: MongoDB `ObjectId`, references `User`, unique.
- `items`: array of subdocuments:
  - `product`: MongoDB `ObjectId`, references `Product`.
  - `quantity`: `Number`, required, minimum `1`.
- Timestamps: enabled.

The unique `user` field represents one cart per user.

### Order

- File: `models/Order.js`
- Model name: `Order`
- `user`: MongoDB `ObjectId`, references `User`.
- `items`: array of subdocuments:
  - `product`: MongoDB `ObjectId`, references `Product`.
  - `name`: `String` snapshot of the product name.
  - `price`: `Number` snapshot of the price used at order time.
  - `quantity`: `Number`.
- `totalAmount`: `Number`.
- `shippingAddress`: `String`, required.
- `status`: `String`, enum `pending | confirmed | shipped | delivered | cancelled`, default `pending`.
- Timestamps: enabled.

### Relationship diagram

```text
User 1 ─────── 1 Cart
 │              │
 │              └── Cart.items.product ─────── Product
 │                                              │
 └───────< Order                                └── Product.category ─────── Category
              │
              └── Order.items.product ─────── Product
```

## 8. Main Business Flows

### Registration and login

- Frontend request: `POST /api/auth/register`, then `POST /api/auth/login`.
- Routes: `auth.routes.js`.
- Controllers: `register`, `login` in `auth.controller.js`.
- Database operations: `User.findOne`, `User.create`, bcrypt hash/compare, JWT signing.
- Response: registration returns a user object; login returns a JWT and user object.
- Failures: validation `400`, duplicate email `409`, invalid credentials `401`.

### Product browsing

- Frontend request: `GET /api/products`.
- Route: `product.routes.js`.
- Controller: `listProducts`.
- Database operations: filters active products, optional text/category/price filters, sorting, pagination, and count query.
- Response: `{ success, items, total, page, pages }`.
- Failure: unexpected query/database errors become `500`.

### Product details

- Frontend request: `GET /api/products/:id`.
- Route: `product.routes.js`.
- Controller: `getProduct`.
- Database operation: `Product.findById(req.params.id).populate('category', 'name slug')`.
- Response: `{ success, product }`.
- Failure: `404 Product not found`; malformed IDs are not prevalidated on this public route.

### Add product to cart

- Frontend request: `POST /api/cart` with `{ productId, quantity }`.
- Route: `cart.routes.js`.
- Middleware: `authenticate`, `addRules`, `validate`.
- Controller: `addToCart`.
- Database operations: find active Product, find or create Cart, increment existing item or push a new item, save Cart.
- Response: `201 { success, cart }`.
- Failure: invalid ID `400`, unavailable product `404`, insufficient requested stock `400`.

### Update cart quantity

- Frontend request: `PUT /api/cart/:productId` with `{ quantity }`.
- Controller: `updateCartItem`.
- Database operations: find user's Cart, find item, find Product, compare quantity with stock, save Cart.
- Response: `{ success, cart }`.
- Failure: validation `400`, insufficient stock `400`, missing cart/item `404`.

### Remove cart item

- Frontend request: `DELETE /api/cart/:productId`.
- Controller: `removeCartItem`.
- Database operation: filter the product out of the user's cart and save.
- Response: `{ success, cart }`.
- Failure: missing cart `404`, auth `401`.

### Checkout and order creation

- Frontend request: `POST /api/orders` with one `shippingAddress` string.
- Route: `order.routes.js`.
- Middleware: `authenticate`, `orderRules`, `validate`.
- Controller: `createOrder`.
- Database operations: transaction, cart population, product availability/stock checks, product stock decrement, order creation, cart clearing, commit.
- Response: `201 { success, order }`.
- Failure: empty cart, unavailable product, insufficient stock, validation, auth, or transaction errors.
- Payment: no payment integration exists in the backend.

### Cart clearing after successful order

The order controller sets `cart.items = []` and saves the cart inside the same MongoDB transaction used for product stock updates and order creation. If the transaction fails, it attempts to abort, so the cart should not be cleared by a successful commit that did not happen.

### Order history

- Frontend request: `GET /api/orders`.
- Controller: `getMyOrders`.
- Database operation: `Order.find({ user: req.user.userId }).sort('-createdAt')`.
- Response: `{ success, orders }`.
- Failure: authentication or unexpected database errors.

### Order details

- Frontend request: `GET /api/orders/:id`.
- Controller: `getMyOrder`.
- Database operation: finds by both order `_id` and authenticated `user`.
- Response: `{ success, order }`.
- Failure: `404 Order not found` or authentication failure.

### Admin product management

- Requests: `GET /api/products`, `POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id`, `PATCH /api/products/:id/stock`.
- Routes: `product.routes.js`.
- Middleware: `authenticate`, `authorizeAdmin`, product validation where configured.
- Controllers: product controller functions.
- Database operations: query/create/update/soft-deactivate/increment stock.
- Failure: `401`, `403`, validation errors, `404`, `409` stock errors, or database errors.

### Admin category management

- Requests: `GET /api/categories`, `POST /api/categories`, `PUT /api/categories/:id`, `DELETE /api/categories/:id`.
- Route: `category.routes.js`.
- Middleware: admin routes require `authenticate` and `authorizeAdmin`; the public list does not.
- Controllers: category controller functions.
- Database operations: list active categories, create, update, or set `isActive: false`.
- Failure: `401`, `403`, `404`, schema/unique errors, or unexpected errors.

### Admin order-status updates

- Requests: `GET /api/admin/orders` and `PUT /api/admin/orders/:id/status`.
- Route: `admin.routes.js`.
- Middleware: `authenticate`, `authorizeAdmin`.
- Controllers: `adminListOrders`, `updateOrderStatus`.
- Database operations: populate users for listing; update order status for mutation.
- Failure: `401`, `403`, invalid status `400`, missing order `404`, or unexpected errors.

## 9. Error Handling

### Validation errors

`middleware/validate.js` calls `validationResult(req)`. If errors exist, it returns status `400`:

```json
{
  "success": false,
  "errors": [
    {
      "type": "field",
      "msg": "Name is required",
      "path": "name",
      "location": "body"
    }
  ]
}
```

### Missing fields

Required fields are enforced by express-validator where route rules exist and by Mongoose schema validation when documents are written. Category mutation routes do not use express-validator, so schema validation handles their required fields.

### Invalid MongoDB IDs

Product mutation routes use `idRule` and return `400` validation errors for invalid IDs. Cart and order routes do not consistently apply an ObjectId validator to every URL parameter. Malformed IDs may become Mongoose cast errors and reach the general error handler.

### Missing resources

Controllers return `404` for missing users, products, categories, carts, cart items, and orders where explicitly handled. Typical shapes are:

```json
{
  "success": false,
  "message": "Product not found"
}
```

### Authentication errors

`middleware/auth.js` returns `401` for missing, invalid, or expired tokens.

### Authorization errors

`middleware/admin.js` returns `403`:

```json
{
  "success": false,
  "message": "Admin access required"
}
```

### Insufficient stock

Cart and order controllers return `400` for insufficient stock. The product stock patch controller returns `409` when its update cannot be applied.

### Duplicate email or duplicate data

Registration explicitly returns `409` for an existing email. Product and category schemas mark some fields as unique (`sku`, `slug`, and names in their respective schemas), but the general error handler does not provide a special duplicate-key response format. Such database errors are handled as unexpected `500` responses unless an error object provides `statusCode`.

### Database and unexpected errors

Controllers call `next(err)`. `errorHandler` logs the error and returns:

- `err.statusCode` and `err.message` when `statusCode` exists.
- `500` and `Internal server error` otherwise.

The implementation does not expose stack traces in the HTTP response.

### Unknown routes

`notFound` returns status `404`:

```json
{
  "success": false,
  "message": "Route not found"
}
```

## 10. Product Seeding

### Source data

The seed source is [products.json](products.json), a top-level JSON array. The current catalog contains the product records used by the application.

### Category seeding

`seedProducts.js`:

1. Reads `products.json` using a path resolved relative to the script directory.
2. Collects unique `category` names.
3. Creates or updates each category with `Category.findOneAndUpdate()` using `{ name }` as the lookup.
4. Generates a slug with the local `slugify()` helper.
5. Stores each category's MongoDB `_id` in a map.

### Product seeding

For each JSON product, the script:

- Removes the original JSON `id` from the direct field spread.
- Stores it as `legacyId`.
- Removes JSON `reviews` and stores it as `reviewCount`.
- Replaces the string category name with the category ObjectId.
- Omits JSON `createdAt` and `updatedAt`; Mongoose timestamps generate these values.
- Uses the remaining schema-compatible fields in the upsert.

Products are upserted using `sku` as the lookup key.

### Idempotency and duplicate behavior

The seed script is safe to run again for the same catalog:

- Categories are updated or inserted by name.
- Products are updated or inserted by SKU.
- Existing products are not deleted.
- Existing users, carts, orders, and authentication data are not touched.
- No `deleteMany()` call is used.

The script does not automatically remove database products that are no longer present in `products.json`.

### Run the seed

```powershell
cd "d:\backend projects\ecommerce\backend"
npm.cmd run seed:products
```

## 11. Security

### Implemented measures

- Passwords are hashed with bcrypt before storage.
- JWTs are signed with `JWT_SECRET` and expire after `7d`.
- Protected routes require a Bearer token.
- Admin routes require a JWT role of `admin`.
- Express-validator checks authentication, cart, order, and product request fields where configured.
- CORS restricts the allowed origin to `CLIENT_URL` or a localhost fallback.
- User profile responses exclude the password.
- Order detail lookup includes the authenticated user ID, preventing a user from retrieving another user's order through that route.
- Order creation validates stock and uses a MongoDB transaction for stock decrement, order creation, and cart clearing.
- Secrets are loaded from environment variables in application code.

### Visible limitations

- The checked-in `.env` contains real-looking MongoDB and JWT secret values. These should be rotated and excluded from version control.
- There is no refresh-token mechanism.
- There is no backend logout/revocation endpoint.
- JWTs are bearer tokens; possession of a valid token is sufficient for access until expiry.
- `cookie-parser` is registered, but the current authentication implementation does not use cookies.
- The CORS configuration allows one configured origin, not a list of environments.
- Product list `sort` is passed directly to Mongoose without a whitelist.
- Admin order listing has no pagination or filtering in the backend.
- Category mutation routes do not use express-validator.
- Stock patch requests do not have a dedicated quantity validator.
- Duplicate-key errors do not have a dedicated sanitized error response.
- Rate limiting, CSRF protection, password reset, email verification, and audit logging are not implemented in the visible code.

## 12. Important Implementation Decisions

### MongoDB and Mongoose

MongoDB is used as the persistence layer, and Mongoose models define document shape, validation, references, indexes, and timestamps. This is directly supported by `config/db.js` and the five model files.

### Route/controller separation

Routes define URL and middleware composition, while controllers contain the database and business operations. This keeps route declarations small and centralizes request behavior in controller functions.

### Product IDs

The database uses MongoDB `_id` values as the active product identifiers. The seed process preserves the original JSON numeric ID as `legacyId`. Product `sku` is used by the seed script as the stable upsert key.

### Product/category relationship

Products store `category` as a required ObjectId reference to `Category`. The product detail endpoint populates the category; the product list endpoint returns the category reference without population.

### Cart storage

There is one Cart document per user because `Cart.user` is unique. Each cart item stores a product reference and a quantity. Product information is populated when the cart is read.

### Order storage

Orders store the user reference and item snapshots. Each order item stores product reference, name, price, and quantity so the order retains the values used at order creation.

### Stock and totals

Cart reads calculate a subtotal from the current Product `price`. Order creation also calculates `totalAmount` from `Product.price * quantity`, then decrements current stock inside a transaction.

The use of `price` rather than `discountPrice` for cart and order totals is an observed implementation behavior, not an inferred business rule.

## 13. Known Limitations

The following limitations are visible in the code:

- No payment gateway or payment endpoint exists.
- Checkout stores one combined `shippingAddress` string instead of structured address fields.
- Cart subtotal and order total use `price`, while the seed data also contains `discountPrice`.
- `discountPercentage` exists in `products.json` but is not declared in the Product schema.
- Product list responses do not populate category details; product detail responses do.
- Cart add-to-cart stock validation checks the added quantity but does not explicitly compare existing cart quantity plus the new quantity before saving.
- There is no clear-cart endpoint; clients remove items individually.
- There is no backend endpoint for dashboard analytics such as total users or historical sales chart data.
- The server package has no test script and no repository-defined development script, even though nodemon is installed.
- Category mutation routes do not have express-validator rules.
- Product update validation requires the same core fields as product creation.
- Admin product/category delete operations are soft deactivations, not physical deletion.
- The backend does not serve the local image paths from `products.json` in the visible `app.js`; image hosting is handled separately by the frontend presentation layer.
- No upload route is implemented despite `multer` being installed.
- Transaction support assumes the connected MongoDB deployment supports MongoDB transactions.

## 14. Testing and Verification

### Available scripts

`package.json` currently defines:

```text
npm.cmd start
npm.cmd run seed:products
npm.cmd test
```

The `test` script is the default placeholder:

```text
Error: no test specified
```

There is no repository-defined `dev` script.

### API testing approach

The backend can be tested with PowerShell requests, curl, Postman, or another HTTP client. Important examples:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method Get | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/categories" -Method Get | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "http://localhost:3000/api/products?limit=3" -Method Get | ConvertTo-Json -Depth 8
```

Protected requests need a JWT:

```powershell
$headers = @{ Authorization = "Bearer <jwt-token>" }
Invoke-RestMethod -Uri "http://localhost:3000/api/users/profile" -Headers $headers -Method Get | ConvertTo-Json -Depth 5
```

### Verified behavior documented from project work

The following behaviors have been verified during development of this project:

- `GET /api/health` returned the success health response.
- Product seeding created 15 categories and 200 products.
- Re-running the seed updated existing products without inserting duplicates.
- Product list responses returned MongoDB ObjectIds and preserved price, discount price, stock, and review count fields.
- Product detail responses populated the category object.
- Registration and login were tested with a real development account after fixing model export/import mismatches.
- Profile loading and profile name update were connected to the protected API.
- Cart add, cart persistence, quantity update, and removal were tested against the live backend.
- Checkout created a real order, cleared the cart, and returned an order ID.
- Order history and order details returned the created order.
- An ordinary authenticated user received `403` from `/api/admin/orders`.
- An unauthenticated request to `/api/admin/orders` received `401`.
- Frontend lint and build were run successfully during integration work.

These are development verification results, not an automated backend test suite. The repository itself does not contain automated tests.

## 15. Interview/Viva Summary

### One-minute explanation

This project uses Node.js, Express, MongoDB, and Mongoose to provide the backend for a kitchen-products e-commerce application. Express routes expose public product/category browsing and protected features for authentication, profiles, carts, orders, and administrators. Controllers contain the business logic, while Mongoose models define users, products, categories, carts, and orders. JWT authentication protects user and admin operations. Products are seeded from `products.json`, categories are created from the catalog, and products are upserted by SKU. Order creation validates stock, decreases inventory, creates an order, and clears the cart in a MongoDB transaction.

### Two-minute architecture explanation

The application starts in `server.js`, which loads environment variables, connects to MongoDB through `config/db.js`, and then starts the Express server. `app.js` configures CORS, cookies, JSON parsing, the health endpoint, route modules, and centralized fallback error handling.

Each route group has a file under `routes/`. Routes compose authentication, admin authorization, and validation middleware before calling controller functions. For example, product creation passes through JWT authentication, admin authorization, product validation, and then `createProduct` in `product.controller.js`.

Controllers interact with Mongoose models under `models/`. The Product model references Category, Cart items reference Product, and Orders reference both User and Product. Authentication uses bcrypt for password hashing and JWT claims containing the user ID and role. The order controller uses a MongoDB transaction to validate cart products, decrement stock, create order item snapshots, create the order, and clear the cart together.

The seed script is separate from the HTTP app. It reads `products.json`, upserts categories by name, transforms the original numeric ID into `legacyId`, maps `reviews` to `reviewCount`, maps category names to ObjectIds, and upserts products by SKU. This preserves unrelated user, cart, and order data.

### Ten likely viva/interview questions

1. **Why is `server.js` separate from `app.js`?**  
   `app.js` builds and exports the Express application, while `server.js` handles database initialization and opening the listening port.

2. **How is authentication implemented?**  
   Registration hashes passwords with bcrypt. Login compares the password and returns a JWT containing `userId` and `role`.

3. **How are protected routes identified?**  
   Routes use `authenticate`, which verifies a Bearer JWT and stores the decoded payload in `req.user`.

4. **How are admin routes protected?**  
   Admin routes use `authorizeAdmin` after authentication and require `req.user.role` to equal `admin`.

5. **Why does the Product model use a category ObjectId?**  
   It creates a Mongoose reference to the Category model, allowing category relationships and population on product details.

6. **How is one cart associated with a user?**  
   The Cart model has a unique `user` ObjectId reference, so a user has one cart document containing product references and quantities.

7. **How does checkout update inventory safely?**  
   `createOrder` starts a MongoDB session and transaction, checks stock, decrements product stock, creates the order, clears the cart, and commits together.

8. **What happens when a user requests another user's order?**  
   `getMyOrder` filters by both the order ID and `req.user.userId`, so it returns `Order not found` instead of exposing another user's order.

9. **How does the seed script avoid duplicates?**  
   Categories are upserted by name and products are upserted by SKU. It does not delete existing collections.

10. **What is a major current limitation?**  
    There is no payment integration, and cart/order totals use the Product `price` field rather than `discountPrice`.
