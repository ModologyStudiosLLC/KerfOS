# Modology Cabinet Designer

AI-powered cabinet design tool that makes professional fabrication accessible to everyone.

## 🎯 Vision

Make professional cabinet fabrication accessible to DIYers and small shops by automating complex parts: design optimization, cut list generation, and hardware sourcing.

## 🚀 Features

### Core Features (MVP)

**Cabinet Builder UI** - Drag-and-drop cabinet components (boxes, doors, drawers, shelves)

**3D Preview** - Real-time 3D visualization of cabinet designs

**Material Library** - Pre-configured materials (plywood, MDF, hardwood) with dimensions

**Cut List Generator** - Optimized 2D cutting plans for sheet goods

**Hardware Finder** - Suggest hinges, slides, screws based on cabinet dimensions

**Pricing Calculator** - Estimate material and hardware costs

**Export Options** - PDF cut lists, CSV, DXF for CNC machines

**User Accounts** - Save projects and return later

### ✅ Waste Optimization (Complete)

**2D Bin Packing** - Guillotine-constrained algorithm for sheet goods

**Multi-Sheet Support** - Automatically calculates number of sheets needed

**Waste Percentage** - Shows material utilization efficiency

**Grain Direction** - Respects wood grain orientation

**Edge Banding** - Tracks edge banding requirements

### ✅ CNC G-code Export (Complete)

**Machine Profiles**:
- **GRBL / Generic** - Standard G-code (.nc)
- **ShopBot** - SBP format (.sbp)
- **Shapeoko** - Carbide Motion compatible (.nc)
- **X-Carve** - Easel compatible (.nc)

**Advanced Features**:
- **Tabs/Bridges** - Hold-down tabs at configurable spacing
- **Multiple Pass Depth** - Progressive depth cutting
- **Drilling Operations** - Peck drilling with dwell times
- **Lead-in/Lead-out** - Cleaner cut entry/exit
- **Time Estimation** - Accurate cut time prediction
- **Feed Rate Control** - Per-operation feed rates

### ✅ Collaboration (Complete)

**User Authentication**:
- JWT-based authentication
- Secure password hashing
- User profiles

**Project Sharing**:
- Share projects with team members
- Permission levels: view, edit, admin
- Public/private project visibility

**Team Features**:
- Project ownership
- Shared project dashboard
- Activity tracking

### ✅ Hardware Integration (Complete)

**Supplier Links**:
- Rockler
- Woodcraft
- Home Depot
- McMaster-Carr

**Hardware Types**:
- Hinges (concealed, European, butt)
- Drawer slides (full extension, soft close)
- Screws and fasteners
- Handles and pulls
- Shelf pins and supports

### Nice-to-Have (Future)

**Project Templates** - Pre-built cabinet designs (kitchen, vanity, bookshelf)

**Payment Integration** - Stripe checkout for premium features

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **Next.js 14** | React framework with App Router |
| **React** | UI components |
| **Three.js** | 3D rendering and visualization |
| **Tailwind CSS** | Styling and responsive design |
| **Clerk** | User authentication |
| **Vercel** | Deployment |

### Backend

| Technology | Purpose |
|---|---|
| **FastAPI** | Python web framework |
| **SQLAlchemy** | ORM and database management |
| **PostgreSQL** | Database (via Fly.io) |
| **Pydantic** | Data validation |
| **Uvicorn** | ASGI server |
| **Fly.io** | Deployment and hosting |

## 📁 Project Structure

```
modology-cabinet-designer/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── database.py          # Database configuration
│   │   ├── models.py            # SQLAlchemy models (User, Project, Cabinet, etc.)
│   │   ├── cutlist_optimizer.py # 2D bin packing with guillotine algorithm
│   │   ├── gcode_generator.py   # CNC G-code generation (ShopBot, GRBL, etc.)
│   │   ├── exporters.py         # 3D export (OBJ, STL, DXF, 3MF)
│   │   ├── chat.py              # AI chat assistant
│   │   ├── wizard.py            # Guided design wizard
│   │   ├── init_db.py           # Database initialization script
│   │   └── routers/
│   │       ├── __init__.py
│   │       ├── auth.py          # User authentication (JWT)
│   │       ├── collaboration.py # Project sharing and permissions
│   │       ├── projects.py      # Project management
│   │       ├── cabinets.py      # Cabinet CRUD endpoints
│   │       ├── materials.py     # Material management
│   │       ├── hardware.py      # Hardware inventory with filtering
│   │       ├── cutlists.py      # Cut list generation and optimization
│   │       └── gcode.py         # G-code generation endpoints
│   ├── main.py                 # FastAPI application
│   ├── requirements.txt         # Python dependencies
│   ├── fly.toml                # Fly.io deployment config
│   └── Dockerfile              # Docker configuration
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx       # Root layout with ClerkProvider
│   │   │   ├── page.tsx         # Home page
│   │   │   └── globals.css      # Global styles
│   │   └── components/
│   │       ├── AuthContext.tsx      # Authentication context provider
│   │       ├── CabinetBuilder.tsx   # Main UI with 3D preview
│   │       ├── CabinetPreview.tsx   # Three.js 3D visualization
│   │       ├── MaterialSelector.tsx # Material selection with pricing
│   │       ├── CabinetForm.tsx      # Add cabinets with presets
│   │       ├── DimensionEditor.tsx  # Component management
│   │       ├── CutListExporter.tsx  # PDF, CSV, DXF, G-code exports
│   │       ├── GCodeExporter.tsx    # CNC G-code export with machine profiles
│   │       ├── HardwareFinder.tsx   # Hardware browsing and selection
│   │       ├── DesignAssistant.tsx  # AI-powered design helper
│   │       └── DesignExporter.tsx   # 3D model exports
│   ├── package.json             # NPM dependencies
│   ├── tsconfig.json           # TypeScript config
│   ├── tailwind.config.ts       # Tailwind CSS config
│   └── next.config.mjs          # Next.js config
├── .github/
│   └── workflows/
│       ├── frontend.yml          # Frontend CI/CD (Vercel)
│       ├── backend.yml           # Backend CI/CD (Fly.io)
│       └── rollback.yml          # Rollback workflow
├── README.md
└── LICENSE
```

## 🗄️ Database Setup

### 1. Create PostgreSQL Database on Fly.io

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login to Fly.io
flyctl auth login

# Create PostgreSQL database
flyctl postgres create
```

### 2. Get Database Connection URL

```bash
flyctl postgres connect -a modology-db --console
```

Or to get connection URL:

```bash
flyctl status -a modology-db
```

You'll see something like:
```
Host: xxx-a.db.fly.dev
User: postgres
Database: modology_db
```

**Format your DATABASE_URL:**
```
postgresql://postgres:password@xxx-a.db.fly.dev:5432/modology_db
```

### 3. Attach Database to Backend App

```bash
flyctl postgres attach -a modology-backend modology-db
```

This will:
- Automatically set `DATABASE_URL` environment variable
- Configure firewall rules
- Connect backend to database securely

### 4. Update Secrets (if needed)

```bash
flyctl secrets set DATABASE_URL="postgresql://postgres:password@xxx-a.db.fly.dev:5432/modology_db"
```

## 🔐 Environment Variables

### Backend (Fly.io)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (auto-set by Fly.io) |
| `PORT` | 8000 (set by Fly.io automatically) |
| `SECRET_KEY` | JWT secret key for authentication |

### Frontend (Vercel)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Your Fly.io backend URL (e.g., `https://modology-backend.fly.dev`) |
| `NEXTAUTH_SECRET` | Random string for NextAuth (generate with `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Your Vercel frontend URL |
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key (from Clerk Dashboard) |
| `CLERK_SECRET_KEY` | Clerk secret key (from Clerk Dashboard) |

## 📊 Database Models

### Core Tables

| Table | Description |
|---|---|
| `users` | User accounts with authentication |
| `projects` | Group cabinets into projects with ownership |
| `project_shares` | Project sharing with permission levels |
| `cabinets` | Cabinet designs with dimensions and materials |
| `materials` | Sheet goods (plywood, MDF, hardwood) with pricing |
| `hardware` | Cabinet hardware (hinges, slides, handles) |
| `cabinet_components` | Individual parts of a cabinet |
| `cut_lists` | Optimized cutting plans for CNC/saw |
| `cut_items` | Individual cut positions on sheets |
| `sheets` | Sheet material inventory |
| `parts` | Individual parts for optimization |
| `optimization_results` | Stored optimization results |

## 🦟 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL (local or Fly.io)
- GitHub account
- Vercel account
- Clerk account (for authentication)

### Local Development

#### 1. Clone the Repository

```bash
git clone https://github.com/MJFlanigan5/modology-cabinet-designer.git
cd modology-cabinet-designer
```

#### 2. Set Up Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set DATABASE_URL
export DATABASE_URL="postgresql://postgres:password@localhost:5432/modology_db"

# Initialize database
python -m app.init_db

# Start development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### 3. Set Up Frontend

```bash
cd frontend

# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local and add your API URL
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Start development server
npm run dev
```

#### 4. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Production Deployment

#### Deploy Backend to Fly.io

**Option A: Using Fly.io CLI (Recommended)**

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login

# Deploy
cd backend
flyctl deploy
```

**Option B: Automatic Deployment via GitHub Actions**

The backend is automatically deployed when you push to the `main` branch via the `.github/workflows/backend.yml` workflow.

#### Deploy Frontend to Vercel

**Option A: Using Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel
```

**Option B: Automatic Deployment via GitHub Actions**

The frontend is automatically deployed when you push to the `main` branch via the `.github/workflows/frontend.yml` workflow.

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 📝 API Endpoints

### Health
- `GET /` - API info
- `GET /health` - Health check
- `GET /init-db` - Initialize database tables

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update user profile

### Collaboration
- `POST /api/collaboration/share` - Share project with user
- `GET /api/collaboration/shared-with-me` - Get projects shared with me
- `PUT /api/collaboration/permission/{id}` - Update permission
- `DELETE /api/collaboration/share/{id}` - Remove share

### Projects
- `POST /api/projects` - Create project
- `GET /api/projects` - List my projects
- `GET /api/projects/{id}` - Get project details
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### Cabinets
- `POST /api/cabinets` - Create cabinet
- `GET /api/cabinets` - List all cabinets
- `GET /api/cabinets/{id}` - Get cabinet by ID
- `PUT /api/cabinets/{id}` - Update cabinet
- `DELETE /api/cabinets/{id}` - Delete cabinet

### Materials
- `POST /api/materials` - Create material
- `GET /api/materials` - List all materials
- `GET /api/materials/{id}` - Get material by ID
- `PUT /api/materials/{id}` - Update material
- `DELETE /api/materials/{id}` - Delete material

### Hardware
- `POST /api/hardware` - Create hardware
- `GET /api/hardware?type={type}` - List hardware (optionally filtered by type)
- `GET /api/hardware/{id}` - Get hardware by ID
- `DELETE /api/hardware/{id}` - Delete hardware

### Cut Lists
- `POST /api/cutlists/generate` - Generate optimized cut list
- `GET /api/cutlists` - Get cut list history
- `GET /api/cutlists/{id}` - Get specific cut list
- `DELETE /api/cutlists/{id}` - Delete cut list

### G-code
- `POST /api/gcode` - Generate G-code from cut list
- `POST /api/gcode/preview` - Preview G-code operations
- `GET /api/gcode/profiles` - List machine profiles
- `POST /api/gcode/download` - Download G-code file

### AI Assistant
- `POST /api/chat` - Chat with AI assistant
- `POST /api/wizard/start` - Start guided design wizard
- `POST /api/wizard/next` - Advance wizard step
- `POST /api/wizard/select` - Make wizard selection

### 3D Export
- `POST /api/export/obj` - Export as OBJ
- `POST /api/export/stl` - Export as STL
- `POST /api/export/3mf` - Export as 3MF
- `POST /api/export/dxf` - Export as DXF

## 🔐 GitHub Secrets

### Backend (Fly.io)

| Secret | Description | How to Get It |
|---|---|---|
| `FLY_API_TOKEN` | Fly.io API token | https://fly.io/user/settings/tokens |
| `FLY_APP_NAME` | Fly.io app name | From `fly.toml` or CLI |

### Frontend (Vercel)

| Secret | Description | How to Get It |
|---|---|---|
| `VERCEL_TOKEN` | Vercel API token | https://vercel.com/account/tokens |
| `VERCEL_ORG_ID` | Vercel organization ID | From Vercel dashboard |

### Shared

| Secret | Description | How to Get It |
|---|---|---|
| `SLACK_WEBHOOK_URL` | Slack webhook for notifications | Create Slack app & add incoming webhook |

## 🎨 Deployment Architecture

```
┌─────────────────────────────────────────┐
│   Vercel (Frontend - Next.js)         │
│   - Cabinet Builder UI                 │
│   - Hardware Finder                   │
│   - 3D Preview                      │
│   - Cut List Exporter (PDF/CSV/DXF/G-code)│
└──────────────┬──────────────────────┘
               │
               │ API calls (same domain)
               ▼
┌─────────────────────────────────────────┐
│   Fly.io (Backend - FastAPI)           │
│   - FastAPI native support            │
│   - Cabinets, Materials, Hardware APIs  │
│   - Cut List Optimizer               │
│   - G-Code Generator                │
│   - Auth & Collaboration            │
└──────────────┬──────────────────────┘
               │
               │ DATABASE_URL (same VPC)
               ▼
┌─────────────────────────────────────────┐
│   Fly.io PostgreSQL                   │
│   - Managed database                │
│   - Free tier included              │
│   - Same platform as backend          │
└─────────────────────────────────────────┘
```

## 🔐 Security

- JWT-based authentication with secure password hashing
- All endpoints use CORS configuration
- Database connections use environment variables
- Input validation via Pydantic
- SQL injection prevention via SQLAlchemy
- G-code generation uses safe defaults

## 📈 Roadmap

### Phase 1: MVP ✅ COMPLETE
- [x] Set up GitHub repository
- [x] Create database models and migrations
- [x] Implement basic CRUD endpoints
- [x] Build cabinet builder UI
- [x] Implement 2D cut list generator
- [x] Add pricing calculator
- [x] 3D preview with Three.js
- [x] Hardware finder with supplier integration
- [ ] Deploy to Vercel (frontend)
- [ ] Deploy to Fly.io (backend)

### Phase 2: Advanced Features ✅ COMPLETE
- [x] Waste optimization algorithm (2D bin packing with guillotine)
- [x] CNC G-code export (ShopBot SBP, GRBL, Shapeoko, X-Carve)
- [x] Tabs/bridges for CNC hold-down
- [x] Drilling operations
- [x] Lead-in/lead-out for cleaner cuts
- [x] User accounts and authentication (JWT)
- [x] Project collaboration and sharing
- [x] Permission levels (view, edit, admin)

### Phase 3: Launch & Growth (In Progress)
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to Fly.io
- [ ] Beta launch to 10 users
- [ ] Collect feedback and iterate
- [ ] Payment integration with Stripe
- [ ] Public launch
- [ ] Marketing and content creation
- [ ] Plan Phase 4 features

### Phase 4: Future Enhancements
- [ ] Project templates (kitchen layouts, vanity sets)
- [ ] Live supplier price feeds
- [ ] Mobile companion app
- [ ] Offline mode with sync
- [ ] Advanced nesting algorithm (non-guillotine)
- [ ] Multi-material projects
- [ ] Edge banding optimization
- [ ] Hardware recommendations based on design

## 🤝 Contributing

This is currently a solo project, but contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 👤 Author

**Michael Flanigan** - Modology Studios

## 🔗 Links

- [Modology Studios](https://www.modologystudios.com/)
- [GitHub Repository](https://github.com/MJFlanigan5/modology-cabinet-designer)

## 💬 Support

For questions or issues, please open a GitHub issue.
