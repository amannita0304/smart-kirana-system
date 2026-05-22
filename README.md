# Smart Kirana Business Manager

Full-stack application for local kirana/general stores — manage sales, udhaar (credit), inventory, suppliers, and analytics.

## Project Structure

```
smart-kirana-system/
├── backend/     # Node.js + Express + MongoDB API
└── frontend/    # React + Tailwind + Redux UI
```

## Quick Start (Full Stack)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # Set MONGODB_URI + JWT_SECRET
npm run dev            # http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev            # http://localhost:3000
```

### 3. Register & use

1. Open http://localhost:3000/register
2. Create your shop account
3. Add products → create sales → track udhaar

## Documentation

- [Backend API](./backend/README.md)
- [Frontend UI](./frontend/README.md)

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, Vite, Tailwind CSS, Redux Toolkit, Recharts |
| Backend | Node.js, Express, Mongoose, JWT |
| Database | MongoDB |

## License

ISC
