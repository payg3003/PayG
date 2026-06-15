# PayG

PayG is the mother/umbrella site and monorepo for all PayG products.

## Folder Structure

```
PayG/                          ← Mother site (this repo root)
├── src/                       ← PayG mother site source (React/Vite)
├── public/
├── package.json
├── vite.config.js
├── netlify.toml
│
└── health-insurance/          ← Health Insurance product
    ├── frontend/              ← React/Vite frontend (PayG-Frontend1)
    │   ├── src/
    │   ├── .env               ← VITE_API_BASE_URL points to backend
    │   ├── .env.example
    │   ├── package.json
    │   └── vite.config.js
    │
    └── backend/               ← Node.js/Express API (Payg-backend)
        ├── routes/
        ├── models/
        ├── middleware/
        ├── utils/
        ├── .env               ← FRONTEND_URL points to frontend
        ├── .env.example
        ├── package.json
        └── server.js
```

## Sites & Products

| Site/App | Folder | Description |
|----------|--------|-------------|
| PayG (Mother) | `/` | Main marketing & gateway site |
| Health Insurance Frontend | `health-insurance/frontend/` | Customer-facing insurance app |
| Health Insurance Backend | `health-insurance/backend/` | REST API for the insurance app |

## Local Development

### Mother Site
```bash
cd PayG/
npm install
npm run dev        # runs on http://localhost:5173
```

### Health Insurance Frontend
```bash
cd PayG/health-insurance/frontend/
npm install
cp .env.example .env   # set VITE_API_BASE_URL=http://localhost:5000/api
npm run dev        # runs on http://localhost:5174
```

### Health Insurance Backend
```bash
cd PayG/health-insurance/backend/
npm install
cp .env.example .env   # fill in MongoDB, JWT, Paystack, Africa's Talking keys
npm run dev        # runs on http://localhost:5000
```

## Deployment

- **Mother site** → Deploy `/` to Netlify
- **Health Insurance Frontend** → Deploy `health-insurance/frontend/` to Netlify/Vercel
- **Health Insurance Backend** → Deploy `health-insurance/backend/` to Render
