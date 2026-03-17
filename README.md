# Modology Cabinet Designer

## Vision

Make professional cabinet fabrication accessible to DIYers and small shops by automating the complex parts: design optimization, cut list generation, and hardware sourcing.

## MVP Goals (3-4 months)

| Goal | Success Metric |
|---|---|
| **Functional MVP** | Users can design a cabinet and get a cut list |
| **Customer validation** | 10 paying customers or 100 free users |
| **Revenue ready** | Payment integration functional |
| **Process optimized** | From raw materials to CNC-ready files in <30 mins |

## Tech Stack

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
| **Deployment** | Vercel (frontend) + Railway (backend) | Easy, fast, cheap for MVP |

## CI/CD Pipeline

### Overview

This project uses GitHub Actions for continuous integration and deployment with the following workflows:

| Workflow | Triggers | Purpose |
|---|---|---|
| **Frontend CI/CD** | Push to `main`/`develop`, PRs | Lint, test, build, scan, deploy frontend to Vercel |
| **Backend CI/CD** | Push to `main`/`develop`, PRs | Lint, test, scan, build Docker, deploy backend to Railway |
| **Rollback** | Manual dispatch | Rollback frontend/backend to previous stable tag |

### Frontend Pipeline

**Triggers:**
- Push to `main` or `develop` branch (frontend changes only)
- Pull requests to `main` branch

**Jobs:**
1. **Lint** — ESLint on frontend code
2. **Test** — Jest tests with coverage (uploaded to Codecov)
3. **Build** — Next.js production build
4. **Security Scan** — Trivy vulnerability scanner (results uploaded to GitHub Security)
5. **Deploy Preview** — Deploy to Vercel preview environment on PRs
6. **Deploy Production** — Deploy to Vercel production on push to main

**Features:**
- Node.js 18 with npm caching
- Dependency caching for faster builds
- Artifact upload for build outputs
- Slack notifications on deploy success/failure
- Environment URLs exposed in GitHub Actions UI

### Backend Pipeline

**Triggers:**
- Push to `main` or `develop` branch (backend changes only)
- Pull requests to `main` branch

**Jobs:**
1. **Lint** — Ruff linter on Python code
2. **Test** — Pytest tests with coverage (uploaded to Codecov)
3. **Security Scan** — Trivy vulnerability scanner (results uploaded to GitHub Security)
4. **Build Docker** — Build and push Docker image to GitHub Container Registry
5. **Deploy Preview** — Deploy to Railway preview environment on PRs
6. **Deploy Production** — Deploy to Railway production on push to main + run migrations

**Features:**
- Python 3.11 with pip caching
- Docker layer caching via GitHub Actions cache
- Container image push to GHCR with tag (commit SHA)
- Database migrations on production deploy
- Slack notifications on deploy success/failure

### Rollback Pipeline

**Triggers:**
- Manual workflow dispatch (you specify target tag and component)

**Components:**
- `frontend` — Rollback Vercel to specified tag
- `backend` — Rollback Railway to specified tag
- `both` — Rollback both frontend and backend

**Features:**
- Health check after rollback (curl `/api/health`)
- Slack notification on rollback completion
- 30-second sleep for backend to stabilize before health check

## Secrets Required

| Secret | Description | Where to get |
|---|---|---|
| `VERCEL_TOKEN` | Vercel authentication token | [Vercel Settings → Tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Vercel organization ID | [Vercel Project Settings → General](https://vercel.com/your-org/cabinet-designer/settings/general) |
| `VERCEL_PROJECT_ID_FRONTEND` | Frontend project ID | [Vercel Project Settings → General](https://vercel.com/your-org/cabinet-designer/settings/general) |
| `RAILWAY_TOKEN` | Railway authentication token | [Railway Account Settings](https://railway.app/account/tokens) |
| `RAILWAY_DATABASE_URL` | Production database URL | [Railway Project Variables](https://railway.app/project/cabinet-designer/variables) |
| `SLACK_WEBHOOK_URL` | Slack webhook for notifications | [Slack App → Incoming Webhooks](https://api.slack.com/apps) |

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/MJFlanigan5/modology-cabinet-designer.git
cd modology-cabinet-designer
```

### 2. Install Dependencies

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt
```

### 3. Configure GitHub Secrets

Go to your repository settings:
https://github.com/MJFlanigan5/modology-cabinet-designer/settings/secrets/actions

Add all the secrets listed in the table above.

### 4. Configure Vercel Project

1. Create a Vercel account if you don't have one
2. Import the project from GitHub: https://vercel.com/new
3. Select the `frontend` directory as root
4. Get your `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID_FRONTEND`
5. Add these to GitHub secrets

### 5. Configure Railway Project

1. Create a Railway account if you don't have one
2. Create a new project: https://railway.app/new
3. Add a PostgreSQL service
4. Add a service for the backend (select `backend` directory)
5. Get your `RAILWAY_TOKEN` from account settings
6. Get your `RAILWAY_DATABASE_URL` from project variables
7. Add these to GitHub secrets

### 6. Configure Slack (Optional)

1. Create a Slack app: https://api.slack.com/apps
2. Enable "Incoming Webhooks"
3. Create a webhook URL for your desired channel
4. Add the webhook URL to GitHub secrets as `SLACK_WEBHOOK_URL`

### 7. Run Locally

**Frontend:**
```bash
cd frontend
npm run dev
```

**Backend:**
```bash
cd backend
uvicorn main:app --reload
```

## Deployment

### Automatic Deployment

The CI/CD pipelines automatically deploy when you push to the `main` branch:

- **Frontend** → Deploys to Vercel production
- **Backend** → Deploys to Railway production + runs migrations

### Manual Rollback

To rollback to a previous version:

1. Go to Actions tab: https://github.com/MJFlanigan5/modology-cabinet-designer/actions
2. Select the "Rollback" workflow
3. Click "Run workflow"
4. Select the target tag (e.g., `v1.0.1`)
5. Choose component: `frontend`, `backend`, or `both`
6. Click "Run workflow"

## MVP Roadmap

### Phase 1: Foundation (Weeks 1-4)

| Week | Tasks |
|---|---|
| 1 | Set up project, Next.js + FastAPI scaffolding, GitHub repo |
| 2 | Build basic cabinet component library (boxes, doors, drawers) |
| 3 | Implement 2D cut list generator (basic rectangle packing) |
| 4 | Add material library and pricing calculator |

### Phase 2: Core MVP (Weeks 5-8)

| Week | Tasks |
|---|---|
| 5 | Implement 3D preview with Three.js |
| 6 | Build hardware finder (basic matching rules) |
| 7 | Add export functionality (PDF, CSV, DXF) |
| 8 | Set up user accounts (Clerk/Auth0) and project persistence |

### Phase 3: Polish & Revenue (Weeks 9-12)

| Week | Tasks |
|---|---|
| 9 | Integrate Stripe for payments |
| 10 | Build pricing page and subscription/paywall |
| 11 | Add project templates and documentation |
| 12 | Performance testing, bug fixes, beta launch |

### Phase 4: Launch & Iterate (Week 13+)

| Week | Tasks |
|---|---|
| 13 | Soft launch to 10 beta users |
| 14 | Collect feedback, iterate quickly |
| 15 | Public launch, marketing push |
| 16+ | Plan Phase 2 features (CNC export, hardware integration) |

## Revenue Model

### Pricing Options

| Tier | Features | Price |
|---|---|---|
| **Starter** | 3 cabinets/month, basic cut lists, web-only | Free |
| **Pro** | Unlimited cabinets, CNC export, hardware finder | $15/month |
| **Lifetime** | All Pro features, one-time payment | $99 |

## Contributing

This is a Modology Studios project. For questions or collaboration, reach out through [modologystudios.com](https://www.modologystudios.com/).

## License

MIT
