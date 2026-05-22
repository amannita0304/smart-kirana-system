# Smart Kirana — Frontend

React dashboard for kirana shop management. Connects to the backend API at `http://localhost:5000`.

## Tech Stack

- React 19 + Vite
- Tailwind CSS v4
- Redux Toolkit
- React Router
- Axios
- Recharts
- React Hot Toast
- Lucide Icons

## Quick Start

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open **http://localhost:3000**

> Backend must be running on port 5000 (`cd backend && npm run dev`)

## Features

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | Stats, charts, low stock |
| Sales | `/sales` | POS-style billing |
| Products | `/products` | Inventory management |
| Customers | `/customers` | Customer CRUD |
| Udhaar | `/udhaar` | Credit & payments |
| Suppliers | `/suppliers` | Supplier list |
| Purchases | `/purchases` | Stock purchases |
| Reports | `/reports` | Sales, profit, udhaar |
| Alerts | `/notifications` | Low stock & reminders |

## Environment

```
VITE_API_URL=http://localhost:5000/api
```

Vite proxies `/api` and `/uploads` to the backend in development.

## Build for Production

```bash
npm run build
npm run preview
```

Deploy `dist/` to Vercel, Netlify, or any static host. Set `VITE_API_URL` to your production API.

## UI Features

- Mobile-responsive sidebar
- Dark mode toggle
- Hindi + English labels
- Large touch-friendly buttons
- Toast notifications
