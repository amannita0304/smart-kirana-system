# Smart Kirana Business Manager — Backend API

Production-ready REST API for local kirana/general stores. Handles inventory, sales, udhaar (credit), suppliers, purchases, analytics, and reports.

## Tech Stack

- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose**
- **JWT** authentication
- **express-validator** for input validation
- **Multer** for product image uploads

## Project Structure

```
backend/
├── server.js                 # App entry point
├── uploads/products/         # Product images (auto-created)
└── src/
    ├── config/               # env, database, cors
    ├── constants/
    ├── controllers/          # Business logic
    ├── middleware/           # auth, validation, upload, errors
    ├── models/               # Mongoose schemas (8 models)
    ├── routes/               # API routes (/api/*)
    ├── utils/                # helpers (token, dates, transactions)
    └── validators/           # Request validation rules
```

## Quick Start

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Environment setup

```bash
cp .env.example .env
```

Edit `.env` — set `MONGODB_URI` and `JWT_SECRET`.

### 3. Start MongoDB

Ensure MongoDB is running locally or use MongoDB Atlas connection string.

### 4. Run server

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

Server runs at `http://localhost:5000`

Health check: `GET http://localhost:5000/api/health`

---

## API Endpoints

All protected routes require header:

```
Authorization: Bearer <your_jwt_token>
```

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register shop |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |

**Register body:**
```json
{
  "shopName": "Sharma Kirana Store",
  "ownerName": "Ramesh Sharma",
  "email": "ramesh@example.com",
  "phone": "9876543210",
  "password": "password123"
}
```

### Customers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers?search=ram` | List/search customers |
| POST | `/api/customers` | Add customer |
| GET | `/api/customers/:id` | Get customer |
| PUT | `/api/customers/:id` | Update customer |
| DELETE | `/api/customers/:id` | Soft delete |
| GET | `/api/customers/:id/history` | Purchase + udhaar history |

### Products (Inventory)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products |
| GET | `/api/products?category=rice` | Filter by category |
| GET | `/api/products?stockStatus=low_stock` | Low stock filter |
| GET | `/api/products/low-stock/alerts` | Low stock alerts |
| GET | `/api/products/categories/list` | All categories |
| POST | `/api/products` | Add product (multipart for image) |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Soft delete |

### Sales

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sales` | Create sale invoice |
| GET | `/api/sales?period=daily` | List sales |
| GET | `/api/sales/daily/summary` | Today's summary |
| GET | `/api/sales/:id` | Sale details |

**Create sale body:**
```json
{
  "items": [
    { "productId": "...", "quantity": 2 }
  ],
  "customerId": "...",
  "paymentMethod": "cash",
  "gstEnabled": false,
  "gstPercent": 0
}
```

`paymentMethod`: `cash` | `upi` | `card` | `udhaar` | `mixed`

### Udhaar (Credit)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/udhaar` | List udhaar entries |
| POST | `/api/udhaar` | Add credit entry |
| POST | `/api/udhaar/:id/payment` | Record payment |
| GET | `/api/udhaar/:id/history` | Transaction history |
| GET | `/api/udhaar/pending/summary` | Total pending |

### Suppliers & Purchases

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/suppliers` | Manage suppliers |
| GET | `/api/suppliers/:id/purchases` | Supplier purchases |
| GET/POST | `/api/purchases` | Record purchases |
| POST | `/api/purchases/:id/payment` | Pay supplier |

### Dashboard & Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard?period=weekly` | Dashboard stats |
| GET | `/api/reports/sales?period=monthly` | Sales report |
| GET | `/api/reports/profit?period=monthly` | Profit report |
| GET | `/api/reports/udhaar` | Pending udhaar report |
| GET | `/api/notifications` | Low stock + payment alerts |

**Period query values:** `daily` | `weekly` | `monthly` | `yearly`

---

## Database Models

| Model | Purpose |
|-------|---------|
| User | Shop owner account |
| Customer | Customer with pending balance |
| Product | Inventory with prices & stock |
| Sale | Sales invoices with profit |
| Udhaar | Credit entries |
| PaymentHistory | Udhaar audit trail |
| Supplier | Wholesalers |
| Purchase | Stock purchases |

All models include `timestamps` (`createdAt`, `updatedAt`).

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for JWT signing |
| `JWT_EXPIRE` | No | Token expiry (default: 7d) |
| `PORT` | No | Server port (default: 5000) |
| `CORS_ORIGIN` | No | Frontend URL |
| `NODE_ENV` | No | development / production |

---

## Deployment

### Render / Railway / VPS

1. Set environment variables in hosting dashboard
2. Use MongoDB Atlas for production database
3. Set `NODE_ENV=production`
4. Use a strong `JWT_SECRET`
5. Start command: `npm start`

### MongoDB Atlas

```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/smart-kirana
```

---

## Response Format

**Success:**
```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Next Steps (Frontend)

Connect React frontend with:
- Base URL: `http://localhost:5000/api`
- Store JWT in localStorage
- Attach `Authorization: Bearer <token>` on all requests
