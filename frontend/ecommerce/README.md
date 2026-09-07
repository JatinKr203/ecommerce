# Kitchenly Frontend

Kitchenly is a React/Vite frontend for a kitchen-products e-commerce application. It communicates with the project's Express/MongoDB backend through a centralized Axios service and presents customer shopping flows plus protected admin screens.

This documentation describes the current code in `frontend/ecommerce`. It does not assume features that are not implemented. Where the code does not specify a detail, this document says so explicitly.

## 1. Project Overview

The frontend provides:

- A Kitchenly home page with live product/category merchandising.
- Product browsing backed by the catalog API.
- Search, category filtering, price-range filtering, sorting, and pagination controls.
- Product detail pages with a gallery, stock, specifications, related products, and add-to-cart behavior.
- Registration and login forms connected to the backend authentication API.
- JWT persistence and session restoration.
- Protected profile, cart, checkout, and order pages.
- Backend-synchronized cart operations.
- Backend order placement and order history/detail views.
- Admin product, category, and order-management views protected by the user's role.
- Responsive layout styling for desktop, tablet, and mobile breakpoints.
- Hosted product-image fallbacks because the catalog's original image fields are local paths that are not served by the visible backend code.

The application is a kitchen-products storefront with two supported frontend user types:

- Customer/authenticated user: browses products, manages a cart, places orders, views orders, and edits the supported profile field.
- Admin: accesses protected admin routes when the authenticated backend user has `role === "admin"`.

The frontend does not implement a payment gateway. Checkout is an order-placement flow using the backend's shipping-address request.

## 2. Technology Stack

| Technology | Evidence in code | Use in this project |
|---|---|---|
| React | `react` and `react-dom` in `package.json` | Component-based UI and local state. |
| Vite | `vite`, `vite.config.js`, `npm run dev/build/preview` | Development server, module bundling, and production build. |
| JavaScript/JSX | `src/**/*.js`, `src/**/*.jsx` | Application source language. |
| React Router | `react-router-dom` and `src/routes/AppRoutes.jsx` | Client-side routes, dynamic product/order routes, redirects, and nested layouts. |
| Axios | `axios` and `src/services/api.js` | Centralized HTTP requests and interceptors. |
| Context API | `AuthContext.jsx`, `CartContext.jsx`, and custom hooks | Authentication and cart state shared across the application. |
| CSS | `src/index.css`, `src/App.css` | Global reset/accessibility helpers and the main responsive design system. |
| Local storage | `localStorage` calls in `AuthContext.jsx` and `api.js` | JWT persistence under `kitchenly_token`. |
| `@vitejs/plugin-react` | `vite.config.js` | React support in Vite. |
| ESLint | `eslint.config.js` and lint script | JavaScript/JSX linting, React Hooks rules, and Fast Refresh rules. |

Not used in the active frontend code:

- Redux or another external state-management library.
- Tailwind CSS configuration or Tailwind utility classes.
- React Hook Form or another form library.
- A dedicated icon library.
- A toast/notification library.
- A frontend test runner.

The package manifest contains React type packages, but this application source is JavaScript rather than TypeScript. The repository does not specify a required Node.js version.

## 3. Actual Frontend Project Structure

```text
frontend/ecommerce/
├── .env.example
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── public/
├── src/
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   ├── main.jsx
│   ├── assets/
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── components/
│   │   ├── admin/
│   │   │   └── AdminSidebar.jsx
│   │   ├── common/
│   │   │   ├── Breadcrumb.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── FormField.jsx
│   │   │   ├── LoadingState.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── SectionTitle.jsx
│   │   ├── layout/
│   │   │   ├── Footer.jsx
│   │   │   ├── Layout.jsx
│   │   │   └── Navbar.jsx
│   │   └── products/
│   │       ├── ProductCard.jsx
│   │       ├── ProductFilters.jsx
│   │       ├── ProductGallery.jsx
│   │       └── ProductGrid.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── CartContext.jsx
│   │   ├── auth-context-value.js
│   │   ├── cart-context-value.js
│   │   ├── useAuth.js
│   │   └── useCart.js
│   ├── data/
│   │   └── mockData.js
│   ├── pages/
│   │   ├── Admin.jsx
│   │   ├── AuthPages.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── Home.jsx
│   │   ├── Orders.jsx
│   │   ├── PlaceholderPage.jsx
│   │   ├── ProductDetails.jsx
│   │   ├── Products.jsx
│   │   └── Profile.jsx
│   ├── routes/
│   │   ├── AdminRoute.jsx
│   │   ├── AppRoutes.jsx
│   │   └── ProtectedRoute.jsx
│   ├── services/
│   │   ├── api.js
│   │   └── productService.js
│   └── utils/
│       └── imageUrl.js
├── public/
└── vite.config.js
```

`dist/` is a generated Vite build output directory and is excluded from lint through `eslint.config.js`.

### Important folders and files

| File/folder | Responsibility |
|---|---|
| `src/main.jsx` | Loads global CSS, mounts React with `StrictMode`, and renders `App`. |
| `src/App.jsx` | Imports the application CSS and wraps routes with `AuthProvider`, `CartProvider`, and `BrowserRouter`. |
| `src/routes/AppRoutes.jsx` | Declares all client-side routes and wraps protected/admin route branches. |
| `src/routes/ProtectedRoute.jsx` | Shows a loading state during auth restoration, redirects unauthenticated users to `/login`, and renders protected children otherwise. |
| `src/routes/AdminRoute.jsx` | Requires an authenticated user with `role === "admin"`; otherwise redirects to login or home. |
| `src/components/layout/` | Shared `Navbar`, `Footer`, and `Layout` with `Outlet`. |
| `src/components/common/` | Reusable buttons, form fields, breadcrumbs, section headings, modal, loading state, and empty state. |
| `src/components/products/` | Product card/grid, filter controls, and product gallery. |
| `src/components/admin/AdminSidebar.jsx` | Admin navigation and admin-side logout control. |
| `src/context/` | Shared authentication and cart state plus their hooks/context values. |
| `src/services/api.js` | Axios instance, JWT interceptor, response error normalization, and endpoint groups. |
| `src/services/productService.js` | Product response normalization and product list/detail service helpers. |
| `src/utils/imageUrl.js` | Converts unavailable local image paths into category/name-relevant hosted images and safe fallbacks. |
| `src/data/mockData.js` | Empty transitional exports only; it is not the product/cart/order source of truth. |
| `src/pages/` | Route-level page components. |
| `src/App.css` | Main Kitchenly palette, layout, component, admin, form, and responsive styles. |
| `src/index.css` | Base HTML/body styles, font defaults, form inheritance, and screen-reader helper. |

## 4. Application Entry Point

The startup sequence is:

1. Vite loads `index.html`.
2. `index.html` provides `<div id="root"></div>` and loads `/src/main.jsx`.
3. `main.jsx` imports `index.css`, imports `App`, and mounts it with `createRoot` inside `StrictMode`.
4. `App.jsx` imports `App.css` and composes providers in this order:

```text
AuthProvider
  └── CartProvider
        └── BrowserRouter
              └── AppRoutes
```

5. `AppRoutes` renders the route tree.
6. The shared `Layout` renders `Navbar`, the route's page through `Outlet`, and `Footer`.
7. Providers initialize authentication/cart state, then pages request data where their `useEffect`/deferred loader runs.

`AuthProvider` checks `localStorage.kitchenly_token` and calls the profile endpoint when a token exists. `CartProvider` waits for auth initialization, then loads the authenticated user's cart. Public product routes can render while the authentication state is being restored.

## 5. Routing and Navigation

Routes are declared in `src/routes/AppRoutes.jsx` and all are nested under the shared `Layout`.

| Route | Component/page | Access | Purpose |
|---|---|---|---|
| `/` | `Home` | Public | Home merchandising, categories, featured/new products, benefits, newsletter UI. |
| `/products` | `Products` | Public | Live product listing, filters, sorting, and pagination. |
| `/products/:id` | `ProductDetails` | Public | Live product detail, gallery, specifications, stock, related products. |
| `/login` | `Login` from `AuthPages` | Public | Backend login form. |
| `/register` | `Register` from `AuthPages` | Public | Backend registration form. |
| `/cart` | `Cart` | Protected | Authenticated user's backend cart. |
| `/checkout` | `Checkout` | Protected | Shipping form and backend order placement. |
| `/orders` | `Orders` | Protected | Authenticated order history. |
| `/orders/:id` | `OrderDetails` | Protected | Individual authenticated order detail. |
| `/profile` | `Profile` | Protected | Authenticated profile display and name update. |
| `/admin/*` | `Admin` | Admin only | Admin overview, product, category, and order screens. |

### Access behavior

- `ProtectedRoute` redirects unauthenticated users to `/login` with `location.pathname` in router state as `from`.
- Login navigates to `location.state?.from` or `/` after success.
- `AdminRoute` redirects unauthenticated users to `/login` and authenticated non-admin users to `/`.
- There is no explicit catch-all `*` route or custom frontend 404 page in `AppRoutes.jsx`.
- `BrowserRouter` handles client-side navigation.
- `Navbar`, `Footer`, `Button`, breadcrumbs, product links, order links, and admin sidebar use React Router `Link`/`NavLink`.

## 6. Complete Frontend Architecture

The frontend uses route-level pages, reusable components, Context providers, service modules, and a centralized Axios client.

```text
Page route
  -> reusable component or form event
  -> Context method or service method
  -> Axios request from services/api.js
  -> backend response
  -> page/context state update
  -> React re-render
```

Examples:

### Product listing

`Products.jsx` owns search/category/price/sort/page state. It calls `listProducts()` from `productService.js`, which calls `productsApi.list()` from `api.js` and normalizes the backend items. The page renders `ProductGrid`, which renders reusable `ProductCard` components.

### Authentication

`AuthPages.jsx` calls `login()` or `register()` from `useAuth()`. `AuthContext.jsx` calls `authApi`, stores the login JWT, updates the current user, and exposes methods to the rest of the application.

### Cart

`CartContext.jsx` owns the authenticated cart, count, subtotal, loading/error state, and action state. `Navbar`, `ProductCard`, `ProductDetails`, `Cart`, and `Checkout` consume it through `useCart()`.

### Admin

`Admin.jsx` selects an admin subview using the current pathname. Each subview owns its API loading/error/form state and calls the endpoint groups exported by `api.js`.

## 7. Component Architecture

### Layout components

- `Layout`: renders `Navbar`, `Outlet`, and `Footer`.
- `Navbar`: manages mobile menu state, displays public links, current auth user, logout, and cart count from `useCart()`.
- `Footer`: shared brand and navigation links.

### Common components

- `Button`: renders either a React Router `Link` when `to` is supplied or a native button otherwise. Supports `variant`, `className`, `type`, and forwarded props.
- `Breadcrumb`: links Home and Shop, then displays the current label.
- `SectionTitle`: renders an eyebrow, heading, and optional action.
- `EmptyState`: reusable empty-state message.
- `LoadingState`: three-dot loading indicator.
- `Modal`: backdrop/dialog wrapper with title, close button, and child content.
- `FormField`: label plus native input and optional inline error text.

### Product components

- `ProductCard`: receives a normalized product and optional `onAdd`. It displays image, badge, category, name, rating/review count, current/original price, stock, and add-to-cart UI. It redirects logged-out users to login and uses `useCart()` for authenticated adds.
- `ProductGrid`: maps products to `ProductCard`.
- `ProductFilters`: controlled search input and category, price, and sort selects.
- `ProductGallery`: keeps selected gallery image in local state and changes it when a thumbnail is clicked.

### Admin component

- `AdminSidebar`: admin navigation links, profile/storefront link, and logout using `useAuth()` and `useNavigate()`.

### Page-specific components

Pages contain the page-specific request lifecycle, layout, and form behavior. `Admin.jsx` contains the admin dashboard/product/category/order subviews as internal functions rather than separate page files.

## 8. State Management

The application uses local React state plus two Context API providers. Redux is not used.

### Authentication state

- Stored in: `AuthContext.jsx`.
- Values: `user`, `initializing`, `isAuthenticated`.
- Updated by: `login`, `updateProfile`, `logout`, and profile restoration.
- Consumed by: `Navbar`, `AuthPages`, `Profile`, `ProtectedRoute`, `AdminRoute`, `AdminSidebar`, `ProductCard`, and `ProductDetails`.
- Persistence: JWT in `localStorage` under `kitchenly_token`; user is restored by calling `GET /users/profile` after refresh.
- Unauthorized behavior: Axios removes the token and dispatches `kitchenly:unauthorized`; the provider clears the user.

### Cart state

- Stored in: `CartContext.jsx`.
- Values: normalized `items`, `subtotal`, derived `count`, `loading`, `actionId`, `error`.
- Updated by: initial cart load, `addToCart`, `updateQuantity`, `removeFromCart`, and `refreshCart`.
- Consumed by: `Navbar`, `ProductCard`, `ProductDetails`, `Cart`, `Checkout`.
- Persistence: backend cart, not local storage.
- Cart product fields are normalized through `normalizeProduct`.

### Page-local state

- `Home`: loaded products/status/error.
- `Products`: search, category, category map/options, sort, price range, products, total, pages, current page, status, error.
- `ProductDetails`: product, related products, quantity, status, error, add-to-cart message.
- `AuthPages`: controlled form values, field errors, form error, submitting state, password visibility.
- `Profile`: editable name, saving state, saved state, error.
- `Orders`/`OrderDetails`: fetched data, loading/error status.
- `Admin`: catalog/orders/categories, modal state, edit state, form values, search, status/error state, selected order.

### Derived state

- Navbar cart count is the sum of item quantities.
- Home category cards are derived from loaded product categories.
- Home sections filter products by `isFeatured`, `isBestSeller`, and `isNewArrival`, with fallback slices when a section has no flagged products.
- Listing filter requests derive query params from local controls.
- Admin revenue is derived from loaded order `totalAmount` values.

## 9. Authentication and Authorization Flow

1. Register form validates name, email, password length, and password confirmation.
2. `authApi.register()` sends `{ name, email, password }`.
3. Registration success navigates to `/login` with a registration message. The backend registration response does not provide a token.
4. Login form validates email and password.
5. `authApi.login()` sends `{ email, password }`.
6. `AuthContext.login()` stores the returned JWT in:

```text
localStorage.kitchenly_token
```

7. The Axios request interceptor reads that key and attaches:

```http
Authorization: Bearer <token>
```

8. `AuthProvider` restores the user after refresh with `profileApi.get()` when the token exists.
9. `ProtectedRoute` allows `/cart`, `/checkout`, `/orders`, `/orders/:id`, and `/profile` only when `isAuthenticated` is true.
10. `AdminRoute` additionally requires `user.role === "admin"`.
11. `logout()` removes the JWT and clears the user locally.
12. A `401` response clears the token and dispatches the unauthorized event.

No user object is persisted separately in local storage. The current user is held in React context and restored from the profile API.

## 10. API Integration

### Base URL and Axios behavior

`src/services/api.js` creates one Axios instance:

```js
baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
```

The environment template contains:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

The request interceptor attaches the JWT when present. The response interceptor:

- Detects `401`.
- Removes `kitchenly_token`.
- Dispatches `kitchenly:unauthorized`.
- Converts backend message/validation arrays into a rejected `Error` with a readable message.

### API service table

| Feature | Method | Endpoint | Service/API method | Frontend use |
|---|---:|---|---|---|
| Register | POST | `/auth/register` | `authApi.register` | `AuthPages.jsx` registration. |
| Login | POST | `/auth/login` | `authApi.login` | `AuthPages.jsx` login. |
| Profile load | GET | `/users/profile` | `profileApi.get` | Auth restoration. |
| Profile name update | PUT | `/users/profile` | `profileApi.update` | `Profile.jsx`. |
| Product list | GET | `/products` | `productsApi.list`, `listProducts` | Home, listing, admin catalog. |
| Product detail | GET | `/products/:id` | `productsApi.getById`, `getProduct` | `ProductDetails.jsx`. |
| Category list | GET | `/categories` | `categoriesApi.list` | Home, filters, cart normalization, admin. |
| Add cart item | POST | `/cart` | `cartApi.add` | Product card/detail through `CartContext`. |
| Load cart | GET | `/cart` | `cartApi.get` | `CartContext`. |
| Update cart quantity | PUT | `/cart/:productId` | `cartApi.update` | `Cart.jsx`. |
| Remove cart item | DELETE | `/cart/:productId` | `cartApi.remove` | `Cart.jsx`. |
| Create order | POST | `/orders` | `ordersApi.create` | `Checkout.jsx`. |
| Order history | GET | `/orders` | `ordersApi.list` | `Orders.jsx`. |
| Order detail | GET | `/orders/:id` | `ordersApi.getById` | `OrderDetails`. |
| Admin product create | POST | `/products` | `productsApi.create` | Admin product modal. |
| Admin product update | PUT | `/products/:id` | `productsApi.update` | Admin product edit. |
| Admin product deactivate | DELETE | `/products/:id` | `productsApi.remove` | Admin product deactivate. |
| Admin category create | POST | `/categories` | `categoriesApi.create` | Admin category modal. |
| Admin category update | PUT | `/categories/:id` | `categoriesApi.update` | Admin category edit. |
| Admin category deactivate | DELETE | `/categories/:id` | `categoriesApi.remove` | Admin category deactivate. |
| Admin order list | GET | `/admin/orders` | `adminOrdersApi.list` | Admin dashboard/order screen. |
| Admin status update | PUT | `/admin/orders/:id/status` | `adminOrdersApi.updateStatus` | Admin order table. |
| Backend health | GET | `/health` | `healthApi.check` | Service method exists; no page currently calls it. |

Response handling is JSON through Axios. Page components set loading/error/success state around requests. Empty results use `EmptyState`; request failures use inline error messages with retry buttons where implemented.

## 11. Product Browsing Flow

1. User opens `/products`.
2. `Products.jsx` requests categories and product data.
3. Category responses are converted into `{ id, name }` options and an ID-to-name map.
4. `listProducts()` calls `GET /products` with `search`, category ID, `minPrice`, `maxPrice`, `sort`, `page`, and `limit=12`.
5. `normalizeProducts()` converts backend products into display objects.
6. `ProductGrid` renders `ProductCard` components.
7. Search/category/price/sort handlers reset page to `1`, set loading, and trigger a new request.
8. Pagination renders up to five page buttons and a Next button.
9. Loading, API error/retry, and no-results states are rendered.

The backend performs the search/filter/sort/pagination query. The frontend controls the query parameters and renders the response.

Home uses a separate `GET /products` request with `limit=100`, then derives category cards and featured/bestseller/new-arrival sections from the returned product flags.

## 12. Product Details Flow

1. React Router supplies `id` from `/products/:id` through `useParams()`.
2. `ProductDetails` calls `getProduct(id)`.
3. The service calls `GET /products/:id` and normalizes the returned product.
4. The page displays category, name, rating, review count, discount/current/original price, description, stock, delivery/return flags, and specifications.
5. `ProductGallery` shows the main image and clickable thumbnails.
6. Quantity is controlled locally and capped at product stock.
7. Add to cart uses the normalized Mongo `_id` through `CartContext`.
8. Logged-out users are redirected to `/login` with the original detail path.
9. Related products are fetched from a product list and filtered by normalized category.
10. Loading, unavailable/error, not-found, add success, and add failure states are shown.

## 13. Cart Flow

1. `CartProvider` waits for authentication initialization.
2. When a user exists, it calls `GET /cart` and `GET /categories`.
3. Cart product references are normalized and category IDs are mapped to names.
4. Navbar receives the derived quantity count from `useCart()`.
5. Product cards/details call `CartContext.addToCart(product, quantity)`.
6. The context checks local product stock before calling `POST /cart` with the actual Mongo product ID.
7. After any add/update/remove mutation, the context reloads the backend cart.
8. `Cart.jsx` calls `PUT /cart/:productId` for quantity changes and `DELETE /cart/:productId` for removal.
9. Quantity buttons are disabled at minimum `1`, maximum `product.stock`, or while that item is active.
10. The server subtotal is displayed in the order summary.
11. The protected cart route shows loading, error, and empty-cart states.

The “Save for later” button is currently presentational and does not call an API.

## 14. Checkout and Order Flow

1. `/checkout` is protected by `ProtectedRoute`.
2. Checkout loads the authenticated cart from `CartContext`.
3. An empty cart renders an empty state and a link to products.
4. The form collects name, address, city, state, postal code, and country locally.
5. The frontend combines those values into one `shippingAddress` string because that is the backend request shape.
6. `ordersApi.create()` sends `{ shippingAddress }` to `POST /orders`.
7. On success, the page stores the returned order, refreshes the cart, and shows confirmation with the order ID.
8. The order detail link navigates to `/orders/:id`.
9. The backend transaction creates the order and clears the cart.
10. On failure, the form shows the backend error and does not intentionally clear local cart state.

There is no online payment UI/API. The page explicitly says that payment and delivery arrangements are handled separately.

`Orders.jsx` loads `GET /orders`, displays order IDs, dates, status, item count, totals, and links to detail. `OrderDetails` loads `GET /orders/:id` and displays shipping address, item snapshots, status, and total.

## 15. Admin Frontend Flow

Admin routes are wrapped in `AdminRoute`.

### Admin access

- No separate admin login page exists.
- The user must log in through the normal login page.
- The backend login response supplies `user.role`.
- `AdminRoute` allows only `role === "admin"`.
- Unauthenticated users go to `/login`.
- Authenticated non-admin users go to `/`.

### Dashboard

`Dashboard` loads live product/category catalog data and admin orders. It displays:

- Product total.
- Order count.
- User count as `Unavailable`, because no user-statistics endpoint exists in the frontend service/backend contract.
- Sum of loaded order `totalAmount` values.
- Recent orders table.
- Low-stock product list.

It does not display a real historical sales chart.

### Product management

`ProductsAdmin`:

- Loads products and categories.
- Searches product names locally after loading the catalog.
- Opens an add/edit modal.
- Sends `POST /products` or `PUT /products/:id`.
- Deactivates products with `DELETE /products/:id` after `window.confirm()`.
- Uses real Mongo IDs and category IDs.
- Displays loading/error/empty/action-error states.

The form sends product name, price, discount price, stock, SKU, category, and description. The backend may require additional fields such as category and SKU according to its validators.

### Category management

`CategoriesAdmin`:

- Loads categories from `GET /categories`.
- Creates categories with generated slug values.
- Updates categories.
- Deactivates categories after confirmation.
- Uses a modal and inline errors.

### Order management

`OrdersAdmin`:

- Loads `GET /admin/orders`.
- Displays order ID, populated customer name, date, total, and status.
- Calls `PUT /admin/orders/:id/status` for the supported statuses.
- Opens a modal with order shipping/details.

No user-management API or admin user-management screen exists in the current frontend.

## 16. Forms and Validation

### Login

`AuthPages.jsx` uses controlled state for email and password. It validates:

- Email required.
- Email format.
- Password required.
- Password minimum 8 characters.

It disables the submit button while waiting, supports password visibility, and displays API errors.

### Registration

The same file adds:

- Full name required.
- Email required and format-checked.
- Password required and minimum 8 characters.
- Confirm-password equality.
- Terms checkbox marked required by native HTML.

Registration submits only `name`, `email`, and `password`, matching the backend.

### Checkout

`Checkout.jsx` uses controlled state and checks that name, address, city, state, postal code, and country are non-empty before building the backend's one-string shipping address. It disables submission while placing an order.

### Profile

`Profile.jsx` allows editing only the supported `name` field. Email is read-only because the backend profile controller only updates `name`.

### Admin forms

Admin product and category modals use controlled inputs with `FormField`. Product fields include name, original price, discount price, stock, SKU, category, and description. Category forms include category name. Backend errors are shown in modal/page error banners.

### Search/filter controls

Product search and filter inputs are controlled by `Products.jsx`. Admin product search is local after the catalog request. Admin order status is a controlled select per row.

## 17. Loading, Error, and Empty States

Implemented mechanisms include:

- `LoadingState` component for loading indicators.
- `EmptyState` for empty products/categories/cart/orders/related-products cases.
- Inline error panels with retry buttons on Home, Products, ProductDetails, Orders, and Admin state wrappers.
- Form-level error banners for auth, profile, checkout, cart, and admin mutations.
- Field-level validation messages on auth forms.
- Redirect to login for protected-route access without a user.
- Axios network/backend error normalization.
- Automatic local token removal on a `401` response.
- Image `onError` fallbacks for product cards and galleries.

There are no toast notifications or external alert/notification libraries. Admin deactivate confirmations use the browser's native `window.confirm()`.

## 18. Responsive Design and UI Structure

The styling is CSS-based and centralized mainly in `App.css` with base rules in `index.css`.

The design uses:

- Warm neutral page background.
- White/off-white surfaces.
- Terracotta accent color.
- Serif display headings and sans-serif body text.
- Product grids and cards.
- Sticky desktop header.
- Collapsible mobile navigation controlled by `Navbar` state.
- Responsive product/category grids.
- Mobile single-column details, cart, checkout, profile, and admin layouts.
- Admin sidebar that changes to a horizontal navigation treatment on small screens.
- Responsive form grids and tables with overflow wrappers.

Breakpoints visible in `App.css` include approximately `900px` and `720px`. The CSS includes mobile behavior for navigation, product grids, gallery, checkout, account, and admin layouts.

## 19. Environment Setup

The repository does not specify a required Node.js version.

Install dependencies:

```powershell
cd "d:\backend projects\ecommerce\frontend\ecommerce"
npm.cmd install
```

Create a local `.env` file from `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

This is the only frontend environment variable visible in `.env.example` and used in the code.

Commands:

```powershell
npm.cmd run dev
npm.cmd run build
npm.cmd run preview
npm.cmd run lint
```

The backend must be running and reachable at the configured API URL for live products, authentication, cart, orders, and admin data.

## 20. Running the Project

### Backend

The backend is a sibling project under `backend/`. Its documented start command is:

```powershell
cd "d:\backend projects\ecommerce\backend"
npm.cmd start
```

The backend must have its own MongoDB/JWT environment configuration and seeded catalog.

### Frontend

```powershell
cd "d:\backend projects\ecommerce\frontend\ecommerce"
npm.cmd install
npm.cmd run dev
```

Open the Vite URL printed by the terminal, normally `http://localhost:5173/`.

### Basic connectivity check

The frontend has a `healthApi.check()` service method for `GET /health`, although no current page invokes it automatically. The backend health endpoint can be checked separately at:

```text
http://localhost:3000/api/health
```

### Main local flow

1. Open `/products`.
2. Select a product.
3. Register or log in.
4. Add the product to the cart.
5. Open `/cart`.
6. Continue to `/checkout`.
7. Submit shipping information.
8. View the created order in `/orders`.

## 21. Main User Flows

### Customer flow

```text
/ 
  -> /products
  -> /products/:id
  -> /register or /login
  -> /cart
  -> /checkout
  -> /orders
  -> /orders/:id
  -> /profile
  -> Logout
```

The flow is implemented through `AppRoutes`, `Layout`, `ProductGrid`, `ProductCard`, `AuthContext`, `CartContext`, `Checkout`, and `Orders`.

### Admin flow

```text
/login
  -> user.role === "admin"
  -> /admin
  -> /admin/products
  -> /admin/categories
  -> /admin/orders
  -> API mutation
  -> reload live data
```

There is no separate frontend admin login form. Admin access depends on the role in the backend login response/profile response.

## 22. Security Considerations

Implemented frontend measures:

- JWT is not hardcoded; it is received from login.
- JWT is stored under `localStorage.kitchenly_token`.
- Axios attaches it as a Bearer header.
- Protected routes prevent unauthenticated page rendering.
- Admin routes check the authenticated role before rendering admin pages.
- `401` API responses clear the token and user state.
- Input validation runs before login/registration/order/profile submissions.
- API base URL is configurable through Vite environment configuration.
- No secret values are included in frontend source or `.env.example`.

Frontend limitations:

- `localStorage` is accessible to JavaScript and therefore is not immune to XSS risks.
- Actual authorization is enforced by the backend; frontend route checks are only a UI/navigation guard.
- The frontend does not implement token refresh or token revocation.
- Backend validation and authorization remain authoritative.

## 23. Known Limitations

Confirmed from the code:

- No payment integration exists; checkout places an order for fulfillment.
- The “Save for later” cart button has no handler/API integration.
- The “Buy now” product-detail button has no handler.
- The Google/social login button is UI-only.
- The newsletter form prevents default submission but has no subscription API.
- The navbar notification control is presentational.
- No frontend 404/catch-all route is defined.
- `PlaceholderPage.jsx` remains in the source tree but is not used by the current route map.
- `src/data/mockData.js` exports empty arrays and is not a real data source.
- The frontend displays normalized `discountPrice` as the current product price, while the backend cart/order totals use backend product `price`; this can produce pricing differences.
- Related products are loaded by requesting up to 100 products and filtering in the client.
- Home loads up to 100 products for merchandising rather than using dedicated featured/category endpoints.
- Admin dashboard user statistics are displayed as `Unavailable` because no user-statistics endpoint is integrated.
- The admin dashboard has no real historical sales chart.
- Admin product/category deactivate operations use browser confirmation and backend soft-delete APIs.
- Admin product update/create forms do not expose every Product schema field.
- There is no separate frontend service for health checking beyond the method in `api.js`.
- The current frontend package has no automated test script or test framework.
- Actual backend image paths are converted by `imageUrl.js` to hosted presentation fallbacks; the original local image files are not required for the visible product UI.

## 24. Testing and Verification Checklist

This is a manual checklist, not an assertion that every item is currently passing in every environment.

### Application and navigation

- [ ] Start the backend and frontend.
- [ ] Open `/` successfully.
- [ ] Navigate to `/products`.
- [ ] Open a product detail route.
- [ ] Verify the mobile navbar opens and closes.
- [ ] Verify shared footer links.

### Product browsing

- [ ] Product list loads from the backend.
- [ ] Product images display or fall back safely.
- [ ] Search sends a new product query.
- [ ] Category filter works.
- [ ] Price range filter works.
- [ ] Sort options work.
- [ ] Pagination works.
- [ ] Loading, error, and empty states appear correctly.

### Authentication

- [ ] Register with valid fields.
- [ ] Confirm invalid email/password/confirmation messages.
- [ ] Log in with valid credentials.
- [ ] Confirm `localStorage.kitchenly_token` exists.
- [ ] Refresh and confirm profile restoration.
- [ ] Open `/profile` while logged out and confirm redirect.
- [ ] Log out and confirm user UI/token removal.

### Cart

- [ ] Add a product using its live Mongo ID.
- [ ] Confirm navbar cart count.
- [ ] Refresh `/cart` and confirm backend persistence.
- [ ] Increase/decrease quantity within stock.
- [ ] Try exceeding stock.
- [ ] Remove the item.
- [ ] Confirm empty-cart state.

### Checkout and orders

- [ ] Prevent checkout with an empty cart.
- [ ] Submit all shipping fields.
- [ ] Confirm order-placement request succeeds.
- [ ] Confirm the backend-created order ID.
- [ ] Confirm cart refreshes after successful order.
- [ ] Open order history.
- [ ] Open order details.
- [ ] Confirm failed order placement preserves the cart UI.
- [ ] Confirm payment is not presented as implemented.

### Admin

- [ ] Log in with a real backend admin account.
- [ ] Confirm ordinary users are redirected from `/admin`.
- [ ] Load dashboard live data.
- [ ] Load products and categories.
- [ ] Create/edit/deactivate a permitted test product.
- [ ] Create/edit/deactivate a permitted test category.
- [ ] Load admin orders.
- [ ] Update a supported order status.
- [ ] Verify backend/API errors appear in the admin UI.

### Quality checks

```powershell
cd "d:\backend projects\ecommerce\frontend\ecommerce"
npm.cmd run lint
npm.cmd run build
```

The repository does not contain a frontend automated test command. Browser/network testing should be performed with the backend running.

## 25. Interview and Viva Explanation

### Why React?

React is used for component-based UI. The application separates reusable layout/common/product components from route-level pages and uses React state/hooks for interactions.

### Why Vite?

Vite provides the development server and production build pipeline. The package scripts expose `dev`, `build`, and `preview`, and `vite.config.js` enables the React plugin.

### How does routing work?

`BrowserRouter` wraps `AppRoutes`. `Routes` and `Route` map URLs to page components. Nested routes use `Layout` and `Outlet`; `ProtectedRoute` and `AdminRoute` guard private branches.

### How is state managed?

Authentication and cart state use React Context providers with custom hooks. Individual page concerns such as filters, forms, loading states, selected images, modals, and API results use local `useState`/`useEffect` state.

### How does the frontend communicate with the backend?

All requests go through the Axios instance in `src/services/api.js` or wrappers in `productService.js`. The base URL comes from `VITE_API_BASE_URL`, and the request interceptor adds the JWT.

### How does authentication work?

Login receives a JWT, stores it under `kitchenly_token`, sets the current user, and redirects. On refresh, the provider calls the profile API to restore the user. A `401` clears the token and user state.

### How do protected routes work?

`ProtectedRoute` checks `isAuthenticated`; `AdminRoute` additionally checks `user.role === "admin"`. Both show a loading state while authentication restoration is pending.

### How are reusable components designed?

Common primitives such as `Button`, `FormField`, `Modal`, `EmptyState`, and `LoadingState` are shared. Product card/grid/gallery/filter components are reused by Home, Products, and ProductDetails. Layout components are rendered around all routes.

### How are API errors handled?

Axios normalizes backend messages and validation arrays into rejected `Error` objects. Pages show inline errors and retry controls where implemented. A `401` also clears the stored token and dispatches an auth event.

### How do cart and order flows work?

Cart operations are centralized in `CartContext`, which calls backend cart endpoints and reloads the server cart after mutations. Checkout combines shipping fields into the backend-supported `shippingAddress`, calls `POST /orders`, refreshes the cart, and links to order details.

### What challenges are visible in the implementation?

The frontend must normalize different backend product shapes, including category IDs versus populated category objects, preserve Mongo IDs, and replace unusable local catalog image paths with safe hosted presentation images. It also separates product display price normalization from backend cart/order behavior.

### What improvements could be made?

Reasonable next improvements are:

- Add automated frontend tests.
- Add a dedicated data-fetching/cache layer.
- Add structured price handling so cart/order totals use the same discount policy as display.
- Add a clear-cart endpoint or coordinated client workflow.
- Add dedicated analytics endpoints for admin dashboards.
- Add a payment integration only when the backend supports it.
- Add a real notification system instead of presentational controls.
- Split the large `Admin.jsx` into separate page/component modules.
- Add a frontend catch-all/404 route.
