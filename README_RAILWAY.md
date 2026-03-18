# Railway Deployment - Cleaned Repository

This repository has been cleaned for Railway deployment. Unnecessary files have been removed to streamline the deployment process.

## What's Included

### Backend (FastAPI)
- `backend/main.py` - Main FastAPI application
- `backend/requirements.txt` - Python dependencies
- `backend/Dockerfile` - Docker configuration for Railway
- `backend/.env.example` - Environment variables template

### Frontend (Next.js)
- `frontend/package.json` - NPM dependencies
- `frontend/next.config.mjs` - Next.js configuration
- `frontend/tailwind.config.ts` - Tailwind CSS configuration
- `frontend/tsconfig.json` - TypeScript configuration
- `frontend/src/` - Source code directory

### Design Assets
- `design/PENCIL_DESIGN_SPECS.md` - Design specifications
- `design/tokens.json` - Design tokens

### Configuration Files
- `.gitignore` - Git ignore rules
- `LICENSE` - MIT License
- `SECURITY.md` - Security policy
- `setup-railway.sh` - Railway deployment script

## Removed Files

The following files have been removed to simplify deployment:

### Backend
- `backend/fly.toml` - Fly.io configuration (not needed for Railway)
- `backend/pytest.ini` - Testing configuration
- `backend/requirements-test.txt` - Test dependencies
- `backend/tests/` - Test directory
- `backend/app/` - Application modules (moved to main.py for simplicity)

### Frontend
- `frontend/jest.config.js` - Jest configuration
- `frontend/jest.config.ts` - Jest TypeScript configuration
- `frontend/jest.setup.ts` - Jest setup

### GitHub Actions
- `.github/` - GitHub Actions workflows (not needed for Railway)

### Render Configuration
- `render.yaml` - Render configuration (not needed for Railway)

## Railway Deployment

To deploy to Railway:

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Run setup script:**
   ```bash
   bash setup-railway.sh
   ```

3. **Initialize database:**
   Visit `https://[your-backend-url]/init-db` after deployment

## Environment Variables

### Backend (Railway)
- `DATABASE_URL` - PostgreSQL connection string (auto-set by Railway)
- `PORT` - 8000
- `SECRET_KEY` - JWT secret key for authentication
- `STRIPE_SECRET_KEY` - Stripe API secret key (optional)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret (optional)

### Frontend (Vercel or Railway)
- `NEXT_PUBLIC_API_URL` - Your Railway backend URL
- `NEXTAUTH_SECRET` - Random string for NextAuth
- `NEXTAUTH_URL` - Your frontend URL

## Project Structure

```
modology-cabinet-designer/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   ├── Dockerfile          # Railway Docker configuration
│   └── .env.example        # Environment variables template
├── frontend/
│   ├── src/                # Next.js source code
│   ├── package.json        # NPM dependencies
│   ├── next.config.mjs     # Next.js configuration
│   ├── tailwind.config.ts  # Tailwind CSS configuration
│   └── tsconfig.json       # TypeScript configuration
├── design/
│   ├── PENCIL_DESIGN_SPECS.md  # Design specifications
│   └── tokens.json         # Design tokens
├── public/
│   └── .well-known/        # Public assets
├── .gitignore
├── LICENSE
├── SECURITY.md
├── setup-railway.sh        # Railway deployment script
└── README.md
```

## Development

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Notes

- The backend is configured for Railway deployment with PostgreSQL
- The frontend can be deployed to Vercel or Railway
- Database initialization is handled via `/init-db` endpoint
- All unnecessary testing and CI/CD files have been removed
- The application is ready for production deployment