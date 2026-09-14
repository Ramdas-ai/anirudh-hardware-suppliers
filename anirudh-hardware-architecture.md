# अनिरुद्ध हार्डवेयर एण्ड सप्लायर्स — E-Commerce Platform Architecture

This document covers everything requested before code generation begins: project architecture, database schema, API list, page list, admin features, payment flow, notification flow, and security approach. Review this first — once you confirm or adjust it, we start Phase 1.

---

## 1. Project Architecture

### Folder Structure

```
anirudh-hardware/
├── frontend/                      # React + Vite customer & admin UI
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/            # Navbar, Footer, Button, Loader, etc.
│   │   │   ├── product/           # ProductCard, ProductGrid, Filters
│   │   │   ├── cart/              # CartItem, CartSummary
│   │   │   ├── checkout/          # CheckoutForm, PaymentOptions
│   │   │   └── admin/             # AdminSidebar, AdminTable, StatCard
│   │   ├── pages/
│   │   │   ├── customer/          # Home, Products, ProductDetail, Cart, Checkout, Orders, Login, Register
│   │   │   └── admin/             # Dashboard, Products, Categories, Orders, Customers, Inventory
│   │   ├── context/                # AuthContext, CartContext
│   │   ├── services/                # api.js (axios instance), productService.js, orderService.js, etc.
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── router/
│   │   └── App.jsx
│   ├── .env.example
│   └── vite.config.js
│
├── backend/                        # Node.js + Express API
│   ├── src/
│   │   ├── config/                 # db.js, cloudinary.js, esewa.js, email.js
│   │   ├── models/                 # User, Product, Category, Cart, Order, Payment, Review
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/              # auth.js, adminOnly.js, errorHandler.js, validate.js, rateLimiter.js
│   │   ├── services/                 # stockService, priceCalcService, emailService, esewaService
│   │   ├── utils/
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
└── README.md
```

### Stack Summary
- **Frontend:** React 18 + Vite, Tailwind CSS, React Router, Axios, Context API for cart/auth state
- **Backend:** Node.js, Express, JWT auth, bcrypt, express-validator, helmet, express-rate-limit
- **Database:** MongoDB Atlas via Mongoose
- **Images:** Cloudinary
- **Deployment target:** frontend (Vercel/Netlify-style static host), backend (Render/Railway-style Node host), DB (Atlas) — kept fully decoupled via env vars

---

## 2. Database Schema (Mongoose Models)

**User**
- name, email (unique), phone, passwordHash, role (`customer` | `admin`), addresses[], createdAt

**Category**
- name, slug, description, image, isActive

**Product**
- name, description, category (ref → Category), price, discountPercent, stock, status (`in_stock` | `low_stock` | `out_of_stock` | `coming_soon`), images[], sku, ratingAvg, isActive, createdAt

**Cart** (per user, or session-based for guests)
- user (ref), items: [{ product (ref), quantity, priceAtAdd }]

**Order**
- orderNumber, user (ref), items: [{ product (ref), name, quantity, priceAtPurchase }], subtotal, discount, deliveryCharge, grandTotal, customer: { name, phone, email, address, city, province, postalCode }, paymentMethod (`cod` | `esewa`), paymentStatus (`pending`|`paid`|`failed`|`refunded`), orderStatus (`pending`|`confirmed`|`processing`|`shipped`|`delivered`|`cancelled`), transactionId, createdAt

**Payment**
- order (ref), method, amount, esewaRefId, status, rawGatewayResponse, verifiedAt

**Review** *(optional/later)*
- product (ref), user (ref), rating, comment, createdAt

Indexes: `Product.category`, `Product.status`, `Order.user`, `Order.orderStatus`, text index on `Product.name` for search.

---

## 3. API List (REST)

**Auth** — `/api/auth`
`POST /register` · `POST /login` · `POST /logout` · `GET /me`

**Products** — `/api/products`
`GET /` (search/filter/sort/paginate) · `GET /:id` · `POST /` (admin) · `PUT /:id` (admin) · `DELETE /:id` (admin) · `PATCH /:id/stock` (admin)

**Categories** — `/api/categories`
`GET /` · `POST /` (admin) · `PUT /:id` (admin) · `DELETE /:id` (admin)

**Cart** — `/api/cart`
`GET /` · `POST /add` · `PUT /update` · `DELETE /remove/:productId`

**Orders** — `/api/orders`
`POST /` (create, backend recalculates all totals) · `GET /my-orders` · `GET /:id` · `GET /` (admin, all orders) · `PATCH /:id/status` (admin)

**Payments** — `/api/payments`
`POST /esewa/initiate` · `POST /esewa/verify` (backend-only verification, never trusts frontend) · `GET /:orderId/status`

**Admin Dashboard** — `/api/admin`
`GET /stats` (orders today, total sales, pending, low stock, etc.)

All admin routes protected by `auth` + `adminOnly` middleware. All write endpoints run `express-validator` schemas.

---

## 4. Page List

**Customer:** Home · Product Listing (with filters) · Product Detail · Cart · Checkout · Order Confirmation · My Orders · Order Detail · Login/Register · 404

**Admin:** Dashboard · Products (list/add/edit) · Categories (list/add/edit) · Orders (list/detail/status update) · Customers (list/detail) · Inventory (stock overview)

---

## 5. Admin Features
Full CRUD on products & categories, stock/price updates without touching code, order status/payment visibility, customer list with order history, low-stock/out-of-stock inventory views, dashboard stats (today's orders, total sales, pending/completed orders).

---

## 6. Payment Flow

**Cash on Delivery:** order created with `paymentStatus: pending`, `paymentMethod: cod` → confirmed by admin manually.

**eSewa:**
1. Customer checks out → backend creates an `Order` (status: pending) and a `Payment` record, computing the total server-side.
2. Backend builds the eSewa payment request using `ESEWA_MERCHANT_ID` / `ESEWA_SECRET_KEY` (env vars, never sent to frontend).
3. Customer redirected to eSewa → completes payment.
4. eSewa redirects back with a reference; backend calls eSewa's verification endpoint to confirm the transaction independently — the order is marked `paid` **only** after this server-side check succeeds, never because the frontend says so.
5. Until real merchant credentials are supplied, this runs against eSewa's test/UAT environment via `ESEWA_ENVIRONMENT=test`, clearly marked so it's never mistaken for production-verified.

---

## 7. Notification Flow
- New order → email to admin (customer, items, total, payment method) and confirmation email to customer, via SMTP env vars (no passwords in code).
- Order status change → optional customer email.
- SMS/WhatsApp: service layer stubbed (`smsService.js`) with a clear interface, not wired to a real provider until you choose one and supply credentials.

---

## 8. Security Approach
JWT auth with short-lived tokens, bcrypt password hashing, role-based route guards, all prices/stock recalculated server-side on every order, input validation on every write endpoint, rate limiting on auth & payment routes, helmet for HTTP headers, CORS locked to the frontend origin, `.env`/`.env.example` + `.gitignore` from day one, no secrets ever exposed to the frontend bundle.

---

## Suggested Build Order (Phases 1–13, as you outlined)
Architecture (this doc) → Products/Categories/Search → Cart → Auth → Backend/DB wiring → Orders/Stock → Admin Dashboard → COD → eSewa (test mode) → Email → SMS-ready stub → Security pass → Deployment prep.
