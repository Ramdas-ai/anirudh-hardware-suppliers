# अनिरुद्ध हार्डवेयर एण्ड सप्लायर्स — E-Commerce Platform

Full-stack MERN e-commerce site for Anirudh Hardware and Suppliers (Nepal).
See `anirudh-hardware-architecture.md` for the full architecture, schema,
API list, and phase plan this project follows.

## 🌐 Live Website

https://anirudh-hardware-suppliers-cuy2.vercel.app

## Phase 1 — Project Architecture + Frontend Design (this delivery)

What's included:
- `frontend/` — React + Vite + Tailwind app, fully scaffolded and routed
  - Design system: navy/white/amber hardware-store palette, Barlow Condensed +
    Work Sans + IBM Plex Mono type system, a "tick-ruler" divider and
    "stock gauge" bar as recurring signature elements (see design notes below)
  - Built-out **Home** page (hero, category grid, featured products, offers
    banner, trust strip) using placeholder NPR product/category data
  - Navbar (search bar, cart count, mobile menu) and Footer, shared across
    every route
  - Every customer and admin route from the architecture doc is wired up in
    `App.jsx` — most render a labeled placeholder page until their phase
  - `AuthContext` and `CartContext` stubs, ready to be filled in during
    Phase 3 (Cart) and Phase 4 (Authentication)
- `backend/` — Express skeleton
  - Folder structure for `config/models/controllers/routes/middleware/services`
  - A minimal running server with `helmet`, `cors`, `morgan`, error handling,
    and a `/api/health` route, so `npm run dev` works today
  - `.env.example` listing every env var the full build will need (DB, JWT,
    Cloudinary, eSewa, SMTP) — nothing hard-coded, nothing committed

## How to run it

**Frontend**
```
cd frontend
npm install
cp .env.example .env
npm run dev
```
Opens at http://localhost:5173

**Backend**
```
cd backend
npm install
cp .env.example .env
npm run dev
```
Runs at http://localhost:5000 — visit http://localhost:5000/api/health to confirm it's up.
(Leaving `MONGO_URI` blank in `.env` is fine for now — the server logs a
warning and still starts; the real DB connection is wired in Phase 5.)

## How to test it

- Frontend: browse to `/`, `/products`, `/cart`, `/admin`, etc. — every route
  from the architecture doc resolves to either the real Home page or a
  labeled placeholder, and the 404 page catches anything else.
- Backend: `GET /api/health` should return `{ status: "ok", ... }`.

## What you need to configure

Nothing is required to run Phase 1 — it works entirely on placeholder data.
When you're ready to move forward, you'll eventually provide (as noted in
the brief): logo, shop photos, address/phone/WhatsApp/email, opening hours,
product list with real prices/stock/images, and eSewa merchant credentials.
None of that is needed yet.

## Design notes

- **Palette:** Ink Navy `#0F2540`, Steel Blue `#1E4E79`, Safety Amber
  `#F5A623`, Warm White `#FAFAF7`, Iron Gray `#4B5563`, Signal Rust `#D64545`
  (out-of-stock/alerts), Leaf Green `#2E7D4F` (healthy stock) — navy/white/amber
  as you specified, with rust and green added for stock-status signaling.
- **Type:** Barlow Condensed (display/headings — stenciled, industrial feel),
  Work Sans (body), IBM Plex Mono (prices, SKUs, stock labels — gives numbers
  a precise, spec-sheet feel).
- **Signature elements:** a tick-mark "measuring tape" rule divides sections
  site-wide, and a small color-coded stock gauge bar (green → amber → rust)
  appears on every product card — both reference the shop's own tools while
  encoding real information rather than just decorating.

## Phase 2 — Products + Categories + Search + Filters (this delivery)

Real, working functionality — not just UI — on top of Phase 1's design and
routes. Nothing from Phase 1 was removed or restructured; routes are unchanged.

**What's new:**
- `src/data/catalog.js` — 23 placeholder products across all 9 categories,
  each with a slug, description, price, discount, and stock count (shape
  matches the Product/Category models in the architecture doc)
- `src/services/productService.js` — `getProducts()`, `getCategories()`,
  `getProductBySlug()`, all returning Promises so this is a drop-in swap for
  real API calls once the backend is live in Phase 5
- `CartContext` now has real logic: `addItem`, `removeItem`,
  `updateQuantity`, `clear`, live `count`/`subtotal`, persisted to
  `localStorage` so the cart survives a refresh
- **Product Listing** (`/products`) — live search, category filter, max
  price filter, in-stock-only toggle, and sort (newest/popular/price), all
  reflected in the URL (`?search=&category=&sort=&maxPrice=&inStock=`) so
  results are shareable/bookmarkable
- **Product Detail** (`/products/:slug`) — real product data, quantity
  selector clamped to available stock, Add to Cart / Buy Now
- **Product Card** — Add to Cart adds the item (briefly shows "Added ✓");
  Buy Now adds the item and routes to `/checkout`; both are disabled and
  show "Out of Stock" when `stock === 0`
- **Cart page** (`/cart`) — real items, quantity +/- clamped to stock,
  remove, running subtotal
- **Checkout page** — shows the real cart summary you arrived with (proving
  the Buy Now / Proceed to Checkout flow actually works end to end); the
  delivery form and payment methods are still Phase 6/9
- **Navbar search** — desktop and mobile search bars both submit to
  `/products?search=...`
- Home page's category tiles and Featured Products now pull from the same
  catalog/service instead of separate sample data

**Not in scope for Phase 2** (as planned): backend/API calls (still
client-side placeholder data — Phase 5), authentication (Phase 4), real
checkout/payment (Phase 6/9), admin product management (Phase 7).

### How to test every feature locally

1. `cd frontend && npm install && npm run dev`, open http://localhost:5173
2. **Search:** type "drill" or "cement" into the navbar search bar and
   press enter/Search → lands on `/products?search=...` with matching
   results only.
3. **Category filter:** click any category tile on the homepage, or a
   category in the `/products` sidebar → URL gets `?category=...` and the
   grid updates to that category only. Click "All Categories" to clear it.
4. **Price filter:** on `/products`, enter a value in "Max Price (NPR)" →
   grid updates to products at or under that price.
5. **In-stock-only filter:** check "In stock only" on `/products` → the
   out-of-stock placeholder products (Circular Saw — 7 inch, Pipe Wrench —
   14 inch, MCB Switch — 32A) disappear from the results.
6. **Sort:** change the sort dropdown on `/products` between Newest /
   Popular / Price Low-High / Price High-Low and confirm order changes.
7. **Stock checking:** find a product with the "Out of Stock" overlay (e.g.
   Circular Saw — 7 inch, Pipe Wrench — 14 inch, MCB Switch — 32A) — both
   Add to Cart and Buy Now are disabled/greyed on the card and on its detail
   page.
8. **Add to Cart:** on any in-stock product, click "Add to Cart" → button
   briefly shows "Added ✓", and the cart icon badge count in the navbar
   increases. Go to `/cart` and confirm the item, quantity, and subtotal are
   correct.
9. **Buy Now:** click "Buy Now" on any in-stock product → you're taken
   straight to `/checkout` and the item is already in the order summary
   there (and also in `/cart`, since Buy Now adds to cart first).
10. **Quantity limits:** on a low-stock product (e.g. Adjustable Wrench,
    stock 4), try increasing quantity past the stock count on the product
    detail page or in the cart — it stops at the max and a "Max available
    stock reached" note appears in the cart.
11. **Persistence:** add items to the cart, refresh the page → cart
    contents are still there (stored in `localStorage`).
12. **Existing Phase 1 routes/design unaffected:** `/`, `/admin/*`,
    `/login`, `/register`, `/orders` still load their Phase 1 placeholders
    or design unchanged; the navy/amber/tick-divider/stock-gauge design
    system is unchanged.

## Phase 3 — Complete Checkout + Authentication (this delivery)

Real registration, login, profile, delivery addresses, and a working
checkout that creates real orders — all connected to the existing cart.
Nothing from Phase 1 or Phase 2 was removed; all previous routes still work
exactly as before, and `/orders` and `/account` now require login.

**What's new:**
- `src/services/authService.js` — register/login/logout/profile/address
  functions, backed by `localStorage`. Passwords are SHA-256 digested (not
  plaintext) but this is explicitly **not** a substitute for the real
  bcrypt + JWT auth that lands server-side in Phase 5 — see the comment at
  the top of the file.
- `AuthContext` now has real `register`, `login`, `logout`, `addAddress`,
  `removeAddress`, and a `user` object that's `null` until logged in.
- **Register** (`/register`) and **Login** (`/login`) — real forms with
  validation (name, email format, Nepali phone format, password length/match)
  and inline error messages; redirect back to wherever you came from
  (e.g. straight back to Checkout).
- **Account** (`/account`, new route, login required) — profile info plus a
  delivery address book: add/remove saved addresses.
- **Checkout** (`/checkout`) — full delivery form (name, phone, email,
  street/city/province/postal code) with validation; if logged in, pick a
  saved address or add a new one (optionally saving it to your account);
  payment method selection (Cash on Delivery vs eSewa); creates a real order
  and clears the cart on success. Guest checkout is still allowed — an
  account isn't required to buy.
- `src/services/orderService.js` — `createOrder`, `getOrdersByUser`,
  `getOrderById`, `calculateTotals`. Orders are stored in `localStorage`
  (shape matches the Order model in the architecture doc) so this is a
  drop-in swap for real `POST /api/orders` calls in Phase 5, at which point
  totals get re-verified server-side rather than trusted from the client as
  they necessarily are here.
- **Assumed delivery rule** (not specified in the brief, so I picked a
  sensible default): flat NPR 150 delivery, free above NPR 5,000 subtotal —
  defined once in `orderService.js` (`DELIVERY_CHARGE`,
  `FREE_DELIVERY_THRESHOLD`) and used consistently on Cart, Checkout, and
  the order confirmation. Tell me if you want different numbers or
  city-based rates and I'll change it.
- **Order Confirmation** (`/order-confirmation/:id`) — shows the real order
  just placed, including payment status (always `pending` — neither COD nor
  eSewa is auto-marked "paid," per the architecture doc's security rules).
- **My Orders** (`/orders`, login required) and **Order Detail**
  (`/orders/:id`, login + ownership required) — list and view real past
  orders for the logged-in customer.
- **Navbar** — shows "Hi, [Name]" + Log Out when logged in, "Account" →
  `/login` otherwise.
- eSewa: selectable as a payment method, but **no real merchant
  credentials or gateway calls** — orders placed with eSewa just record
  `paymentMethod: 'esewa'` and `paymentStatus: 'pending'`, clearly labeled
  "test mode" on confirmation. Real eSewa integration is still Phase 9.

**Not in scope for Phase 3** (as planned): backend/database (Phase 5 — all
of this is still `localStorage`, not MongoDB), admin order management
(Phase 7), real eSewa payment verification (Phase 9), email notifications
(Phase 10).

### How to test every feature locally

1. `cd frontend && npm install && npm run dev` → http://localhost:5173
2. **Register:** go to `/register`, try submitting empty → see validation
   errors; fill in a name, valid email, a 10-digit number starting `97`/`98`,
   matching passwords (6+ chars) → account created, redirected to `/`, navbar
   now shows "Hi, [Name]".
3. **Duplicate email:** register again with the same email → "An account
   with this email already exists."
4. **Logout / Login:** click Log Out in the navbar, then `/login` with the
   same email/password → logs back in. Wrong password → "Incorrect
   password."
5. **Protected routes:** while logged out, visit `/orders` or `/account`
   directly → redirected to `/login`; after logging in you're sent back to
   the page you tried to visit.
6. **Guest checkout:** log out, add a product to the cart, go to
   `/checkout` → see the "Log in for a saved address" banner, fill the
   delivery form manually, place the order with Cash on Delivery → lands on
   Order Confirmation with a real order number.
7. **Logged-in checkout with saved address:** log in, go to `/account`,
   add a delivery address → go to `/checkout` → your saved address appears
   as a selectable option instead of blank fields.
8. **Add a new address at checkout:** on `/checkout`, choose "Use a new
   address," fill it in, leave "Save this address" checked, place the order
   → check `/account` afterward and confirm the address was saved.
9. **Validation:** on `/checkout`, try placing an order with an invalid
   phone number or a missing city → inline errors block submission.
10. **Payment method:** switch between Cash on Delivery and eSewa on
    `/checkout` before placing the order → confirm the order confirmation
    page reflects whichever you picked, and eSewa is labeled "test mode."
11. **Order history:** after placing 2–3 orders while logged in, visit
    `/orders` → all of them are listed with order number, date, total,
    status; click one → `/orders/:id` shows the full detail.
12. **Ownership check:** copy an order's URL (`/orders/<id>`), log out, log
    in as a *different* account, and visit that URL directly → "Order Not
    Found" (orders aren't visible across accounts).
13. **Cart totals still correct:** add items, check `/cart` shows the same
    subtotal/delivery/total as `/checkout` for the same items.
14. **Existing Phase 1/2 behavior unaffected:** search, category filters,
    Add to Cart / Buy Now, and the navy/amber design are all unchanged;
    `/admin/*` still shows Phase 1 placeholders.

## Phase 4 — Real Backend + Database (this delivery)

Everything that was `localStorage` in Phases 2–3 (products, categories,
auth, cart, orders) is now backed by a real Express API and MongoDB
database. No frontend routes or design changed; only the service layer
(`authService.js`, `productService.js`, `orderService.js`, new
`cartService.js`) was rewired to call the API instead of the browser.

**What's new — Backend:**
- **Models** (`backend/src/models/`): `User` (embedded addresses, bcrypt
  password hash), `Category`, `Product` (with a virtual `status` field
  derived from stock), `Cart` (one per user), `Order`
- **Auth:** `POST /api/auth/register`, `POST /api/auth/login` — passwords
  hashed with **bcrypt** (10 salt rounds), never stored in plain text;
  `GET /api/auth/me`, `POST/DELETE /api/auth/addresses` for the profile
  address book; JWT issued on register/login and required (as a `Bearer`
  token) on any protected route; rate-limited (50 requests / 15 min) against
  brute-force attempts
- **Products & Categories:** public `GET /api/products` (search/category/
  sort/maxPrice/inStock query params — same filters ProductListing already
  used), `GET /api/products/:slug`, `GET /api/categories`; admin-only
  CRUD routes are built and protected, ready for Phase 7's Admin Dashboard
- **Cart:** `GET/POST/PUT/DELETE /api/cart/*`, persisted per logged-in user
  in MongoDB. **Guest cart is still localStorage** (there's no account to
  attach a server cart to) — on login, any guest cart items are
  automatically merged into the server cart.
- **Orders — the core of this phase's security requirement:**
  `POST /api/orders` never trusts the client for price, stock, or totals.
  It receives only `{ productId, quantity }` pairs, then:
  1. re-fetches each product from the database
  2. rejects the **entire** order (409 Conflict) if any item requests more
     than the current stock
  3. computes `priceAtPurchase` from the live DB price/discount, not
     whatever the client sent
  4. recalculates subtotal, delivery charge (flat NPR 150, free ≥ NPR 5,000
     — same rule as Phase 3), and grand total server-side
  5. decrements stock and clears the user's server cart
  6. sets `paymentStatus: 'pending'` unconditionally — COD and eSewa both
     require separate confirmation, exactly as the architecture doc
     specifies
  - `orderStatus` uses the full enum: `pending`, `confirmed`, `processing`,
    `shipped`, `delivered`, `cancelled`
  - `GET /api/orders/my-orders` (auth required) and `GET /api/orders/:id`
    (ownership-checked — a logged-in customer can't view another
    customer's order by guessing the ID) back MyOrders/OrderDetail
  - `GET /api/orders/all` and `PATCH /api/orders/:id/status` are admin-only
    and built ahead of Phase 7
- **Seed script:** `npm run seed` (in `backend/`) populates MongoDB with
  the same 9 categories / 23 products used since Phase 1, so the site looks
  identical to before — just reading from a real database now.

**What's new — Frontend:**
- `authService.js`, `productService.js`, `orderService.js` — same function
  signatures as their Phase 3 localStorage versions, now calling the API
  via the existing `services/api.js` (axios, attaches the JWT automatically)
- New `cartService.js` for the backend cart endpoints
- `CartContext` now syncs with the backend for logged-in users (merges any
  guest-cart items on login) and falls back to localStorage for guests —
  no visible behavior change from Phase 3, just where the data lives
- New `CategoryContext` — category names now come live from the database
  instead of a static frontend file (relevant since categories are
  admin-editable via the API built this phase)
- Removed the now-unused static `src/data/catalog.js` — `backend/src/utils/seed.js`
  is the single source of truth for placeholder data going forward

**Not in scope for Phase 4** (as planned): Admin Dashboard UI (Phase 7 —
the backend routes for it already exist and are protected), Cash-on-Delivery
manual confirmation workflow, real eSewa merchant integration (Phase 9 —
`paymentMethod: 'esewa'` is still selectable and still just sets
`paymentStatus: 'pending'`, no real gateway call), email notifications
(Phase 10).

### Database setup

You need a MongoDB instance — either **local** or **MongoDB Atlas**.

**Option A — Local MongoDB** (fastest for testing):
```
# macOS (Homebrew)
brew tap mongodb/brew && brew install mongodb-community
brew services start mongodb-community

# Ubuntu/Debian
sudo apt install mongodb
sudo systemctl start mongodb
```
Then use `MONGO_URI=mongodb://localhost:27017/anirudh-hardware`

**Option B — MongoDB Atlas** (free tier, no local install):
1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Create a database user (Database Access) and allow your IP
   (Network Access — `0.0.0.0/0` for quick local testing)
3. Get the connection string from "Connect → Drivers" and use it as
   `MONGO_URI`, e.g.
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/anirudh-hardware`

### How to run it — step by step

**1. Backend**
```
cd backend
npm install
cp .env.example .env
```
Edit `backend/.env` and fill in:
- `MONGO_URI` — from the database setup above
- `JWT_SECRET` — any long random string, e.g. run `openssl rand -hex 32`
  and paste the output (never reuse example/demo secrets in production)

Then seed the database and start the server:
```
npm run seed   # populates categories + products (safe to re-run — it resets them)
npm run dev    # starts the API on http://localhost:5000
```
Visit http://localhost:5000/api/health — you should see
`{ "status": "ok", ..., "phase": 4 }`. If it instead logs a `MONGO_URI not
set` warning, double check `.env` is filled in and you restarted `npm run dev`.

**2. Frontend**
```
cd frontend
npm install
cp .env.example .env    # VITE_API_URL already points at localhost:5000/api
npm run dev
```
Opens at http://localhost:5173 — it now talks to your real backend.

### How to test every Phase 4 feature

1. **Health check:** `GET http://localhost:5000/api/health` returns
   `{ status: "ok", phase: 4 }`.
2. **Real products from the database:** browse `/` and `/products` — the
   same catalog as before, but now confirm it survives a **backend
   restart** (`Ctrl+C` and `npm run dev` again in `backend/`) — the
   products are still there, proving they're in MongoDB, not memory.
3. **Register:** `/register` with a valid name/email/Nepali phone/password
   → account created. Open MongoDB (Compass, Atlas UI, or `mongosh`) and
   confirm a new document exists in the `users` collection with a
   `passwordHash` field that is a long bcrypt string — **not** your typed
   password.
4. **Login:** log out, log back in with the same credentials → works.
   Wrong password → rejected with "Incorrect password."
5. **Password hashing proof:** try to log in with the correct email but a
   password you just made up close to the real one → rejected. bcrypt
   comparison is exact.
6. **Profile & addresses:** `/account` → add a delivery address → check
   MongoDB's `users` collection → the address is now embedded in that
   user's document, persisted.
7. **Cart connected to backend:** log in, add 2–3 products to the cart,
   then **open the site in a different browser** (or incognito window) and
   log into the *same* account → the cart is already there — proof it's
   stored server-side per account, not per browser.
8. **Guest cart merge:** log out, add an item to the cart as a guest, then
   log in → that item is now in your account's server cart (check by
   refreshing or switching browsers as in step 7).
9. **Stock enforcement — the key security test:** pick a low-stock product
   (e.g. "Spirit Level — 24 inch," seeded with stock 2). Add it to the cart.
   Using a REST client (Postman/curl) or by editing `frontend/src/pages/customer/Checkout.jsx`
   temporarily, try submitting an order with `quantity: 999` for that
   product's ID directly against `POST /api/orders` → the request is
   rejected with a 409 and a message like `"... only has 2 in stock —
   requested 999."` The normal UI already clamps quantity to stock, so this
   step specifically proves the *server* enforces it too, not just the UI.
10. **Price/total tampering test:** same idea — call `POST /api/orders`
    directly with a `priceAtPurchase` or `grandTotal` field forged in the
    request body → the response ignores it entirely; the order that gets
    created uses the price computed from the database.
11. **Place a real order (UI):** go through Checkout normally with Cash on
    Delivery → Order Confirmation shows a real order number. Check
    MongoDB's `orders` collection → the order is there, `orderStatus:
    "pending"`, `paymentStatus: "pending"`, and linked via `user` to your
    account's `_id`.
12. **Stock actually decrements:** note a product's stock on `/products`
    before ordering it, place the order, refresh `/products` → stock is
    now lower by the ordered quantity.
13. **My Orders from the backend:** visit `/orders` → your order is listed.
    Restart the backend (`Ctrl+C`, `npm run dev`) and refresh `/orders` →
    it's still there (proof it's not in-memory).
14. **Order ownership:** log in as a second account, try visiting the
    first account's `/orders/<id>` URL directly → "Order Not Found" (403
    from the API, translated to a friendly message).
15. **Design/routes unchanged:** compare against Phase 3 — navy/amber
    design, tick-divider, stock gauge, all routes, guest checkout, and
    eSewa "test mode" labeling are all exactly as before.

## Next: Phase 5 / 7

With a real backend now in place, the next steps are Cloudinary image
upload for products (folded into Phase 2's original slot) and the Admin
Dashboard (Phase 7) — the admin API routes (`POST/PUT/DELETE /products`,
`/categories`, `PATCH /orders/:id/status`, `GET /orders/all`) already exist
and are protected by `adminOnly`; they just need a UI and a way to create
the first admin user (currently every registration defaults to
`role: 'customer'` — promoting an admin has to be done directly in the
database for now, e.g. via `mongosh`: `db.users.updateOne({email:
"you@example.com"}, {$set: {role: "admin"}})`).
