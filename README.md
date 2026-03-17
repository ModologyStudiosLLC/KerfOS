# Modology Cabinet Designer

> Making professional cabinet fabrication accessible to everyone

[![CI/CD](https://github.com/MJFlanigan5/modology-cabinet-designer/actions/workflows/frontend.yml/badge.svg)](https://github.com/MJFlanigan5/modology-cabinet-designer/actions/workflows/frontend.yml)
[![Security Scan](https://github.com/MJFlanigan5/modology-cabinet-designer/actions/workflows/frontend.yml/badge.svg)](https://github.com/MJFlanigan5/modology-cabinet-designer/security)

---

## 🎯 Product Vision

Make professional cabinet fabrication accessible to DIYers and small shops by automating the complex parts: design optimization, cut list generation, and hardware sourcing.

### Target Users
- **DIY Woodworkers**: Weekend warriors building cabinets for kitchens, bathrooms, vanities
- **Small Cabinet Shops**: 1-3 person shops that need to speed up quoting and material planning
- **Makerspaces & FabLabs**: Community spaces that need tools for teaching cabinet design

---

## 🚀 MVP Features

### Core Features (Must Have)
| Feature | What it does |
|---|---|
| **Cabinet Builder UI** | Drag-and-drop cabinet components (boxes, doors, drawers, shelves) |
| **3D Preview** | Real-time 3D visualization of the cabinet |
| **Material Library** | Pre-configured materials (plywood, MDF, hardwood) with dimensions |
| **Cut List Generator** | Optimized 2D cutting plans for sheet goods |
| **Hardware Finder** | Suggest hinges, slides, screws based on cabinet dimensions |
| **Pricing Calculator** | Estimate material and hardware costs |
| **Export Options** | PDF cut list, CSV, DXF for CNC machines |
| **User Accounts** | Save projects, return later |

### Nice-to-Have (Phase 2)
| Feature | What it does |
|---|---|
| **Project Templates** | Pre-built cabinet designs (kitchen, vanity, bookshelf) |
| **Waste Optimization** | Bin packing algorithm for sheet goods |
| **CNC G-code Export** | Direct output for ShopBot, Shapeoko, etc. |
| **Hardware Integration** | Direct links to suppliers (Rockler, Woodcraft, etc.) |
| **Collaboration** | Share projects with others |

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Frontend** | Next.js 14 + React | Great DX, built-in API routes, easy deployment |
| **3D Rendering** | Three.js | Industry standard for WebGL, great docs |
| **Styling** | Tailwind CSS | Fast development, responsive out of the box |
| **Backend** | Python + FastAPI | Perfect for calculations, async, type hints |
| **Database** | PostgreSQL | Robust, good for relational data |
| **Authentication** | Clerk or Auth0 | User accounts, SSO ready |
| **Payment** | Stripe | Industry standard, good docs |
| **Storage** | AWS S3 or Google Cloud Storage | File storage for exports |
| **Deployment** | Cloudflare Pages (frontend) + Railway (backend) | Fast, global CDN, easy deployment |

---

## 📦 Project Structure

```
modology-cabinet-designer/
├── frontend/                 # Next.js 14 frontend
│   ├── src/
│   │   ├── app/             # Next.js App Router
│   │   ├── components/      # React components
│   │   ├── lib/             # Utilities
│   │   └── styles/          # Global styles
│   ├── public/              # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   └── tailwind.config.ts
├── backend/                  # FastAPI backend
│   ├── main.py              # Application entry point
│   ├── api/                 # API routes
│   ├── models/              # Database models
│   ├── schemas/             # Pydantic schemas
│   ├── services/            # Business logic
│   └── requirements.txt
├── .github/
│   └── workflows/
│       ├── frontend.yml      # Frontend CI/CD
│       ├── backend.yml       # Backend CI/CD
│       └── rollback.yml      # Rollback workflow
└── README.md
```

---

## 🚢 Deployment

### Frontend (Cloudflare Pages)

The frontend is automatically deployed to Cloudflare Pages using GitHub Actions.

**What happens on push to `main`:**
1. Lint (ESLint)
2. Test (Jest)
3. Build (Next.js)
4. Security scan (Trivy)
5. Deploy to Cloudflare Pages production
6. Verify deployment
7. Send Slack notification (optional)

**What happens on pull requests:**
1. Same CI checks
2. Deploy to Cloudflare Pages preview environment
3. Comment PR with preview URL

**Manual rollback:**
- Go to Actions tab → Rollback workflow
- Select target tag (e.g., `v1.0.1`)
- Choose component (frontend, backend, or both)
- Deployment rolls back using Wrangler CLI

### Backend (Railway)

The backend is automatically deployed to Railway using GitHub Actions.

**What happens on push to `backend/main`:**
1. Lint (Ruff)
2. Test (Pytest)
3. Build Docker image
4. Push to GitHub Container Registry
5. Deploy to Railway
6. Run database migrations
7. Health check
8. Send Slack notification (optional)

---

## 🔑 Required Secrets

### Frontend (Cloudflare Pages)

| Secret | Description | Where to Get It |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token for Wrangler CLI | https://dash.cloudflare.com/profile/api-tokens |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare Account ID | Cloudflare Dashboard URL (in the URL) |
| `NEXT_PUBLIC_API_URL` | Backend API URL | Your Railway backend URL |
| `NEXTAUTH_SECRET` | Random string for NextAuth | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your Cloudflare Pages URL | `https://modology-cabinet-designer.pages.dev` |
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key | https://dashboard.clerk.com/ |
| `CLERK_SECRET_KEY` | Clerk secret key | https://dashboard.clerk.com/ |

**Add secrets here:** https://github.com/MJFlanigan5/modology-cabinet-designer/settings/secrets/actions

### Backend (Railway)

| Secret | Description | Where to Get It |
|---|---|---|
| `RAILWAY_TOKEN` | Railway authentication token | https://railway.app/account/tokens |
| `RAILWAY_DATABASE_URL` | Production database URL | Railway Project Variables |
| `DATABASE_URL` | PostgreSQL connection URL | Railway Project Variables |
| `STRIPE_SECRET_KEY` | Stripe secret key | https://dashboard.stripe.com/apikeys |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Stripe Dashboard → Webhooks |

**Add secrets here:** https://github.com/MJFlanigan5/modology-cabinet-designer/settings/secrets/actions

### Optional

| Secret | Description |
|---|---|
| `SLACK_WEBHOOK_URL` | Slack webhook for notifications |

---

## 🗓️ Development Phases

### Phase 1: Foundation (Weeks 1-4)
- ✅ Set up project, Next.js + FastAPI scaffolding, GitHub repo
- ⏳ Build basic cabinet component library (boxes, doors, drawers)
- ⏳ Implement 2D cut list generator (basic rectangle packing)
- ⏳ Add material library and pricing calculator

### Phase 2: Core MVP (Weeks 5-8)
- ⏳ Implement 3D preview with Three.js
- ⏳ Build hardware finder (basic matching rules)
- ⏳ Add export functionality (PDF, CSV, DXF)
- ⏳ Set up user accounts (Clerk/Auth0) and project persistence

### Phase 3: Polish & Revenue (Weeks 9-12)
- ⏳ Integrate Stripe for payments
- ⏳ Build pricing page and subscription/paywall
- ⏳ Add project templates and documentation
- ⏳ Performance testing, bug fixes, beta launch

### Phase 4: Launch & Iterate (Week 13+)
- ⏳ Soft launch to 10 beta users
- ⏳ Collect feedback, iterate quickly
- ⏳ Public launch, marketing push
- ⏳ Plan Phase 2 features (CNC export, hardware integration)

---

## 💰 Pricing Model

| Tier | Features | Price |
|---|---|---|
| **Starter** | 3 cabinets/month, basic cut lists, web-only | Free |
| **Pro** | Unlimited cabinets, CNC export, hardware finder | $15/month |
| **Lifetime** | All Pro features, one-time payment | $99 |

---

## 🎨 Modology Brand

This project is part of **Modology Studios** — a concept design studio making design accessible to everyone.

- **Website**: https://www.modologystudios.com/
- **Philosophy**: "Making Dreams Happen" — we handle complexity so clients can focus on their goals
- **Services**: Interior Design, Digital Fabrication, CAD, Prototyping, Business Strategy, Ethnographic Research

---

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

---

## 📄 License

MIT License — feel free to use this project for your own cabinet design needs.

---

## 📞 Contact

**Michael Flanigan** — Founder, Modology Studios
- GitHub: [@MJFlanigan5](https://github.com/MJFlanigan5)
- Web: https://www.modologystudios.com/

---

**Status**: 🚧 MVP in Development — Target launch: Q2 2025
