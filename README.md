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
- **Rockler** - https://www.rockler.com
- **Woodcraft** - https://www.woodcraft.com
- **Home Depot** - https://www.homedepot.com
- **Lowe's** - https://www.lowes.com
- **Menards** - https://www.menards.com
- **Ace Hardware** - https://www.acehardware.com
- **McMaster-Carr** - https://www.mcmaster.com
- **Blum** - https://www.blum.com
- **Häfele** - https://www.hafele.com
- **Grass** - https://www.grassusa.com
- **Sugatsune** - https://www.sugatsune.com
- **Accuride** - https://www.accuride.com
- **Woodworker Express** - https://www.woodworkerexpress.com
- **DK Hardware** - https://www.dkhardware.com
- **CabinetParts.com** - https://www.cabinetparts.com
- **Woodworker's Hardware** - https://www.wwhardware.com
- **Hardware Tree** - https://www.hardwaretree.com
- **Amazon** - https://www.amazon.com
- **Lee Valley** - https://www.leevalley.com
- **Kreg** - https://www.kregtool.com
- **Columbia Forest Products** - https://www.cfpwood.com
- **Hardwood Store** - https://www.hardwoodstore.com
- **Bell Forest** - https://www.bellforestproducts.com
- **Advantage Lumber** - https://www.advantagelumber.com

**Hardware Types**:
- Hinges (concealed, European, butt, piano, pivot, soft-close)
- Drawer slides (full extension, soft close, under-mount, side-mount)
- Screws and fasteners (wood, machine, confirmat, pocket-hole, shelf-pin)
- Handles and pulls (cabinet pull, drawer pull, appliance pull, cup pull, bin pull)
- Knobs (round, square, t-bar, glass, ceramic)
- Brackets and supports (corner, shelf, countertop, closet, furniture)
- Door hardware (catch, latch, magnet, bumper, lift-system)
- Shelf hardware (pin, bracket, standard, clip, support)
- Cabinet lighting (LED strip, puck, under-cabinet, motion sensor)

**Features**:
- Direct search links to all suppliers
- Price comparison across suppliers
- Hardware recommendations based on cabinet dimensions
- Sample hardware database for quick start
- Recommended suppliers by hardware type
- Supplier metadata (specialties, price range, notes)

### ✅ Project Templates (Complete)

**Template Gallery**:
- Pre-built cabinet configurations for common room types
- Kitchen layouts: L-shaped, U-shaped, galley, island configurations
- Vanity sets: single sink, double sink, floating vanity options
- Bookshelf and storage unit templates
- Entertainment centers and garage storage

**Template Features**:
- Searchable and filterable by style, room, difficulty
- Style presets: Shaker, flat-panel, raised-panel, slab, beadboard, louvered, glass front, open shelf, barn door
- Difficulty levels: Beginner, Intermediate, Advanced
- Estimated time and cost ranges
- Component and hardware lists included
- Joinery and finishing suggestions
- Cut list preview and export

**Inspirations**:
- YouTube woodworkers: Steve Ramsey, April Wilkerson, Jon Peters, Marc Spagnuolo, Jay Bates, John Heisz, Matt Cremona, Frank Howarth, Patrick Sorrell
- Cabinet manufacturers: Cabinets To Go, Cliffside Cabinets, Barker Door, Conestoga, Decora, KraftMaid

### ✅ Payment Integration (Complete)

**Stripe Integration**:
- Secure checkout sessions
- Subscription management
- Billing portal access
- Invoice history

**Subscription Plans**:
| Plan | Price | Features |
|------|-------|----------|
| **Free** | $0 | 3 projects, basic templates, cut lists, GRBL export |
| **Hobbyist** | $9/mo | Unlimited projects, all templates, all G-code formats, 3D exports |
| **Pro** | $29/mo | Advanced nesting, live pricing, templates library, team (3 members) |
| **Shop** | $79/mo | Unlimited team, custom branding, priority support, API access |

**Webhook Handling**:
- Checkout completion
- Subscription updates
- Payment failures
- Automatic tier management

### ✅ Live Supplier Price Feeds (Complete)

**Supplier Integration**:
- Rockler, Woodcraft, Home Depot, Lowe's, Menards, Ace Hardware
- McMaster-Carr, Amazon, Lee Valley, Kreg
- Woodworker Express, DK Hardware, CabinetParts.com
- Blum, Häfele, Grass, Sugatsune, Accuride
- Columbia Forest Products, Hardwood Store, Bell Forest, Advantage Lumber

**Features**:
- Search links across all suppliers
- Price comparison by hardware type
- Estimated price ranges by category
- Hardware category browser
- Price estimate API
- Recommended suppliers by category

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
│   │   ├── templates.py         # Project templates (kitchen, vanity, bookshelf)
│   │   ├── price_feeds.py       # Live supplier price feeds
│   │   ├── scrap_tracker.py     # Leftover piece tracking
│   │   ├── advanced_nesting.py  # Non-guillotine nesting algorithms
│   │   ├── edge_banding.py      # Edge banding optimization
│   │   ├── hardware_recommendations.py # Design-based hardware suggestions
│   │   ├── localization.py      # Local supplier search by zip code
│   │   ├── design_doctor.py     # Design mistake detection
│   │   ├── style_presets.py     # Style presets gallery
│   │   ├── cost_optimizer.py    # "Best Bang for Your Buck" cost analysis
│   │   ├── board_yield.py       # Board yield optimization
│   │   ├── brag_sheet.py        # Social media share generator
│   │   ├── contractor_handoff.py # Professional PDF generation
│   │   ├── version_history.py   # Design version tracking
│   │   ├── climate.py           # Climate-based recommendations
│   │   ├── sketch_to_design.py  # Sketch/photo to 3D model conversion
│   │   ├── ar_scanner.py        # AR space scanning
│   │   ├── scratch_build.py     # Scratch build calculator
│   │   ├── store_integration.py # Home Depot/Lowe's integration
│   │   ├── community_gallery.py # Community build gallery
│   │   ├── init_db.py           # Database initialization script
│   │   └── routers/
│   │       ├── __init__.py
│   │       ├── auth.py          # User authentication (JWT)
│   │       ├── collaboration.py # Project sharing and permissions
│   │       ├── projects.py      # Project management
│   │       ├── cabinets.py      # Cabinet CRUD endpoints
│   │       ├── materials.py     # Material management
│   │       ├── hardware.py      # Hardware inventory with supplier integration
│   │       ├── cutlists.py      # Cut list generation and optimization
│   │       ├── gcode.py         # G-code generation endpoints
│   │       ├── stripe.py        # Stripe payment integration
│   │       ├── price_feeds.py   # Price feeds API router
│   │       ├── advanced_nesting.py # Advanced nesting endpoints
│   │       ├── edge_banding.py  # Edge banding endpoints
│   │       ├── hardware_recommendations.py # Hardware recommendation endpoints
│   │       ├── localization.py  # Local supplier search API
│   │       ├── design_doctor.py # Design doctor API
│   │       ├── style_presets.py # Style presets API
│   │       ├── cost_optimizer.py # Cost optimizer API
│   │       ├── board_yield.py   # Board yield API
│   │       ├── brag_sheet.py    # Brag sheet API
│   │       ├── contractor_handoff.py # Contractor handoff API
│   │       ├── version_history.py # Version history API
│   │       ├── climate.py       # Climate adjustment API
│   │       ├── scrap.py         # Scrap tracker endpoints
│   │       ├── sketch_to_design.py # Sketch to design API
│   │       ├── ar_scanner.py    # AR scanner API
│   │       ├── scratch_build.py # Scratch build API
│   │       ├── store_integration.py # Store integration API
│   │       └── community_gallery.py # Community gallery API
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
│   │   ├── lib/
│   │   │   ├── UnitContext.tsx  # Unit system context (metric/imperial)
│   │   │   └── units.ts         # Unit conversion utilities
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
│   │       ├── DesignExporter.tsx   # 3D model exports
│   │       ├── TemplateGallery.tsx  # Project templates browser
│   │       ├── ScrapTracker.tsx     # Leftover piece tracker
│   │       ├── Localization.tsx     # Local supplier finder by zip code
│   │       ├── DesignDoctor.tsx     # Design mistake checker
│   │       ├── StylePresetsGallery.tsx # Style presets browser
│   │       ├── CostOptimizer.tsx    # Cost optimization report
│   │       ├── BoardYieldOptimizer.tsx # Board yield calculator
│   │       ├── BragSheet.tsx        # Social media share generator
│   │       ├── ContractorHandoff.tsx # Professional PDF generator
│   │       ├── VersionHistory.tsx   # Design version history
│   │       ├── ClimateAdjustment.tsx # Climate-based recommendations
│   │       ├── SketchToDesign.tsx   # Sketch/photo to 3D converter
│   │       ├── ARScanner.tsx        # AR space scanning
│   │       ├── ScratchBuildCalculator.tsx # Scratch build calculator
│   │       ├── StoreIntegration.tsx # Home Depot/Lowe's integration
│   │       └── CommunityGallery.tsx # Community build gallery
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
| `STRIPE_SECRET_KEY` | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRICE_HOBBYIST` | Hobbyist plan price ID |
| `STRIPE_PRICE_PRO` | Pro plan price ID |
| `STRIPE_PRICE_SHOP` | Shop plan price ID |

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
- Stripe account (for payments)

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
- `GET /api/hardware?type={type}&supplier={supplier}&search={query}` - List hardware with filters
- `GET /api/hardware/suppliers` - List all supported suppliers
- `GET /api/hardware/categories` - Get hardware categories with subtypes
- `GET /api/hardware/search/{query}` - Get search links for all suppliers
- `GET /api/hardware/compare/{type}` - Compare prices across suppliers
- `GET /api/hardware/recommended/{cabinet_type}` - Get hardware recommendations
- `GET /api/hardware/{id}` - Get hardware by ID
- `DELETE /api/hardware/{id}` - Delete hardware
- `POST /api/hardware/seed` - Seed sample hardware data

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

### Templates
- `GET /api/templates/` - List all project templates
- `GET /api/templates/{id}` - Get template details
- `GET /api/templates/{id}/cutlist` - Get template cut list
- `GET /api/templates/styles` - List template styles
- `GET /api/templates/rooms` - List room types
- `GET /api/templates/inspirations` - List inspiration sources

### Price Feeds
- `GET /api/price-feeds/suppliers` - List all supported suppliers
- `GET /api/price-feeds/search-links/{query}` - Get search links across suppliers
- `POST /api/price-feeds/compare` - Compare prices across suppliers
- `GET /api/price-feeds/estimates` - Get all price estimates by category
- `GET /api/price-feeds/estimates/{hardware_type}/{subcategory}` - Get specific price estimate
- `GET /api/price-feeds/hardware-categories` - Get hardware categories

### Localization
- `GET /api/localization/suppliers/{zip_code}` - Find local suppliers near zip code
- `GET /api/localization/price-comparison/{zip_code}` - Compare prices across local and online suppliers
- `GET /api/localization/search-links` - Generate direct search links for suppliers
- `GET /api/localization/inventory/{zip_code}/{supplier_key}` - Check local inventory status
- `GET /api/localization/categories` - List all supplier categories
- `GET /api/localization/store-types` - List all store types

### Design Doctor
- `POST /api/design-doctor/check` - Check design for common mistakes
- `GET /api/design-doctor/rules` - List all design rules
- `GET /api/design-doctor/categories` - List mistake categories

### Style Presets
- `GET /api/style-presets/` - List all style presets
- `GET /api/style-presets/{id}` - Get preset details
- `POST /api/style-presets/apply/{cabinet_id}` - Apply style to cabinet
- `GET /api/style-presets/categories` - List style categories

### Cost Optimizer
- `POST /api/cost-optimizer/analyze` - Analyze design for cost savings
- `GET /api/cost-optimizer/alternatives/{material_id}` - Get material alternatives
- `GET /api/cost-optimizer/bulk-suggestions` - Get bulk purchasing suggestions

### Board Yield
- `POST /api/board-yield/calculate` - Calculate board yield optimization
- `GET /api/board-yield/layouts/{optimization_id}` - Get cut layouts
- `GET /api/board-yield/suggestions` - Get yield improvement suggestions

### Brag Sheet
- `POST /api/brag-sheet/generate` - Generate social media share content
- `GET /api/brag-sheet/templates` - List share templates
- `GET /api/brag-sheet/platforms` - List supported platforms

### Contractor Handoff
- `POST /api/contractor-handoff/generate` - Generate professional PDF
- `GET /api/contractor-handoff/templates` - List handoff templates
- `GET /api/contractor-handoff/include-options` - List PDF include options

### Version History
- `GET /api/version-history/{project_id}` - Get project version history
- `POST /api/version-history/{project_id}` - Save new version
- `POST /api/version-history/{project_id}/restore/{version}` - Restore to version
- `GET /api/version-history/{project_id}/compare/{v1}/{v2}` - Compare versions

### Climate Adjustment
- `GET /api/climate/zones` - List climate zones
- `POST /api/climate/recommendations` - Get climate-based recommendations
- `GET /api/climate/humidity-zones` - List humidity zones

### Sketch to Design
- `POST /api/sketch-to-design/upload` - Upload sketch/photo for conversion
- `POST /api/sketch-to-design/analyze` - Analyze uploaded image
- `POST /api/sketch-to-design/convert` - Convert to 3D cabinet model
- `GET /api/sketch-to-design/status/{job_id}` - Get conversion job status
- `GET /api/sketch-to-design/history` - Get conversion history

### AR Scanner
- `POST /api/ar-scanner/scan` - Process AR scan data
- `POST /api/ar-scanner/analyze-space` - Analyze scanned space
- `GET /api/ar-scanner/suggestions/{scan_id}` - Get cabinet suggestions for space
- `POST /api/ar-scanner/save-space` - Save scanned space for future reference
- `GET /api/ar-scanner/spaces` - List saved spaces

### Scratch Build Calculator
- `POST /api/scratch-build/calculate` - Calculate time and effort estimates
- `GET /api/scratch-build/tools` - List available tools
- `POST /api/scratch-build/tools` - Add custom tool
- `GET /api/scratch-build/techniques/{tool_combo}` - Get techniques for tool combination
- `GET /api/scratch-build/rental-suggestions` - Get tool rental recommendations

### Store Integration
- `POST /api/store-integration/check-inventory` - Check store inventory
- `POST /api/store-integration/add-to-cart` - Add items to cart
- `GET /api/store-integration/prices/{zip_code}` - Get local store prices
- `POST /api/store-integration/route-optimize` - Optimize pickup route
- `GET /api/store-integration/stores/{zip_code}` - List nearby stores

### Community Gallery
- `GET /api/community-gallery/` - List community builds
- `POST /api/community-gallery/` - Submit a build
- `GET /api/community-gallery/{id}` - Get build details
- `POST /api/community-gallery/{id}/like` - Like a build
- `POST /api/community-gallery/{id}/comment` - Comment on a build
- `GET /api/community-gallery/categories` - List build categories
- `GET /api/community-gallery/featured` - Get featured builds

### Payments (Stripe)
- `GET /api/stripe/plans` - Get all subscription plans
- `POST /api/stripe/create-checkout-session` - Create checkout session
- `POST /api/stripe/create-portal-session` - Create billing portal session
- `POST /api/stripe/webhook` - Stripe webhook handler
- `GET /api/stripe/subscription/{customer_id}` - Get subscription status
- `POST /api/stripe/cancel-subscription` - Cancel subscription
- `POST /api/stripe/reactivate-subscription` - Reactivate subscription
- `GET /api/stripe/invoices/{customer_id}` - Get invoice history
- `POST /api/stripe/create-products` - Create Stripe products (setup)

### Scrap Tracker
- `GET /api/scrap/` - List all scraps
- `POST /api/scrap/` - Add new scrap piece
- `GET /api/scrap/{id}` - Get scrap by ID
- `PUT /api/scrap/{id}` - Update scrap
- `DELETE /api/scrap/{id}` - Delete scrap
- `GET /api/scrap/find` - Find scrap matching dimensions
- `GET /api/scrap/suggestions` - Get project suggestions for scraps
- `POST /api/scrap/mark-used/{id}` - Mark scrap as used

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
│   - Template Gallery                  │
│   - Scrap Tracker                     │
│   - Localization Finder               │
│   - Design Doctor                     │
│   - Style Presets Gallery             │
│   - Cost Optimizer                    │
│   - Board Yield Optimizer             │
│   - Brag Sheet Generator              │
│   - Contractor Handoff                │
│   - Version History                   │
│   - Climate Adjustment                │
│   - Sketch to Design                  │
│   - AR Scanner                        │
│   - Scratch Build Calculator          │
│   - Store Integration                 │
│   - Community Gallery                 │
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
│   - Stripe Payments                 │
│   - Templates API                   │
│   - Price Feeds API                 │
│   - Scrap Tracker API               │
│   - Localization API                │
│   - Design Doctor API               │
│   - Style Presets API               │
│   - Cost Optimizer API              │
│   - Board Yield API                 │
│   - Brag Sheet API                  │
│   - Contractor Handoff API          │
│   - Version History API             │
│   - Climate Adjustment API          │
│   - Sketch to Design API            │
│   - AR Scanner API                  │
│   - Scratch Build API               │
│   - Store Integration API           │
│   - Community Gallery API           │
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
- Stripe webhook signature verification

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
- [x] Hardware supplier integration (24 suppliers)
- [x] Price comparison across suppliers
- [x] Hardware recommendations

### Phase 3: Launch & Growth (In Progress)
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to Fly.io
- [ ] Beta launch to 10 users
- [ ] Collect feedback and iterate
- [x] Payment integration with Stripe
- [ ] Public launch
- [ ] Marketing and content creation
- [ ] Plan Phase 4 features

### Phase 4: Future Enhancements ✅ COMPLETE

#### ✅ Project Templates
- [x] Pre-built cabinet configurations for common room types
- [x] Kitchen layouts: L-shaped, U-shaped, galley, island configurations
- [x] Vanity sets: single sink, double sink, floating vanity options
- [x] Bookshelf and storage unit templates
- [x] Customizable template parameters (dimensions, materials, hardware)
- [x] Template sharing and community contributions
- [x] One-click template import with auto-scaling to room dimensions
- [x] Inspiration from YouTube woodworkers and cabinet manufacturers

#### ✅ Live Supplier Price Feeds
- [x] Search integration with supported suppliers
- [x] Price comparison across suppliers
- [x] Price estimates by hardware category
- [x] Hardware category browser
- [x] Price estimate API

#### 📋 Planned

- [ ] **Mobile Companion App**
  - iOS and Android native apps (React Native)
  - View and edit projects on-the-go
  - Take photos and attach to projects
  - Barcode scanning for material inventory
  - Push notifications for project updates
  - Offline viewing of cut lists and 3D previews
  - Quick material calculator for in-store use
  - Share projects with team members via mobile

- [ ] **Offline Mode with Sync**
  - Full offline functionality using service workers
  - Local storage for projects, materials, and hardware
  - Background sync when connection restored
  - Conflict resolution for concurrent edits
  - Progressive Web App (PWA) support
  - Offline 3D preview rendering
  - Cache management and storage limits

- [ ] **Advanced Nesting Algorithm (Non-Guillotine)**
  - True shape nesting for irregular parts
  - Optimized packing for CNC routers
  - Support for rotated parts at any angle
  - Multiple sheet size optimization
  - Nesting preview with drag-to-adjust
  - Automatic grain direction override for better yield
  - Export nested layouts to DXF/SVG
  - Estimated vs. actual waste comparison

- [ ] **Multi-Material Projects**
  - Mix plywood, MDF, hardwood, and other materials in one project
  - Material-specific cutting parameters
  - Cross-material cost optimization
  - Visual differentiation in 3D preview
  - Separate cut lists per material type
  - Material compatibility warnings
  - Alternative material suggestions

- [ ] **Edge Banding Optimization**
  - Automatic edge banding calculation based on exposed edges
  - Support for different banding types (PVC, wood veneer, iron-on)
  - Banding cost estimation and supplier links
  - Visual edge banding indicators in 3D preview
  - Banding waste calculation
  - Pre-glued vs. separate glue options
  - Banding machine settings export

- [ ] **Hardware Recommendations Based on Design**
  - AI-powered hardware suggestions based on cabinet type
  - Weight capacity calculations for slides and hinges
  - Hardware quantity optimization (avoid over-ordering)
  - Compatibility checking between components
  - Style matching (modern, traditional, rustic)
  - Budget-tier recommendations
  - Hardware placement guides and templates
  - Automatic hardware list generation for projects

### Phase 5: User Experience & Woodworker-Focused Features ✅ COMPLETE

#### ✅ Design & Planning

- [x] **Sketch-to-Design Import**
  - Upload a pencil sketch or photo → AI converts to 3D cabinet model
  - Perfect for DIYers who think on paper first
  - Automatic dimension detection
  - Style recognition (shaker, flat-panel, etc.)
  - Manual adjustment tools
  - Image processing and cabinet detection
  - Multi-cabinet recognition
  - Confidence scoring for detected elements

- [x] **"What Would Fit?" AR Scanner**
  - Point phone at a space (garage corner, closet nook)
  - AR suggests cabinet configurations that maximize storage
  - Real-time dimension capture
  - Multiple layout options
  - Save scanned spaces for future reference
  - Space analysis and optimization
  - Cabinet fit suggestions
  - 3D space visualization

- [x] **Style Presets Gallery**
  - Shaker, flat-panel, raised-panel, inset doors, face-frame vs frameless
  - One-click style swap to visualize options
  - Mix and match styles
  - Preview with different materials and colors
  - Community-contributed styles
  - Style categories (modern, traditional, rustic, contemporary)
  - Apply to entire project or individual cabinets

- [x] **Design Doctor (Mistake Checker)**
  - AI checks your design for common mistakes
  - Unsupported spans detection
  - Drawer clearance issues
  - Hardware conflicts
  - Moisture trap warnings
  - Suggested fixes with explanations
  - Severity levels (warning, error, critical)
  - Auto-fix suggestions where applicable

#### ✅ Materials & Cost

- [x] **"Best Bang for Your Buck" Report**
  - Analyze design → suggest cheaper alternatives
  - MDF vs plywood recommendations
  - Alternative hardware options
  - Cost/quality tradeoff analysis
  - Bulk purchasing suggestions
  - Potential savings breakdown
  - Quality impact ratings

- [x] **Board Yield Optimizer**
  - Enter plywood prices from your supplier
  - Get exact sheets needed
  - Which cuts to make from which sheet
  - Minimize waste per board
  - Visual cut layouts
  - Waste percentage per sheet
  - Cost optimization across multiple sheet sizes

- [x] **Home Depot/Lowe's Integration**
  - One-click "Add to Cart" with local store inventory check
  - Real-time stock availability
  - Price comparison between stores
  - Material pickup route optimization
  - Store finder by zip code
  - Shopping list generation
  - Cart deep links

#### ✅ Sharing & Documentation

- [x] **"Brag Sheet" Generator**
  - Auto-create shareable before/after posts
  - Cut list, cost, and time invested
  - Perfect for social media
  - Watermark-free images
  - Multiple platform formats (Instagram, Facebook, Pinterest)
  - Custom captions and hashtags
  - Project statistics and achievements

- [x] **Contractor Handoff Mode**
  - Generate professional PDF
  - Specs, materials, and hardware list
  - Send to a cabinetmaker if DIY gets too complex
  - Include CAD files for professional tools
  - Contact information templates
  - Project timeline estimates
  - Professional formatting and branding

- [x] **Community Build Gallery**
  - Browse designs others have actually built
  - Real photos of completed projects
  - Cost breakdowns
  - Lessons learned and tips
  - Rating and comments
  - Build categories (kitchen, bathroom, garage, etc.)
  - Featured builds
  - Search and filter

- [x] **Version History for Builds**
  - "I modified the pantry design 3 times"
  - Keep all versions
  - Notes on why you changed things
  - Branch and compare versions
  - Restore previous versions
  - Version comparison (diff view)
  - Automatic version naming

#### ✅ Quality of Life

- [x] **Scrap Tracker**
  - Automatically tracks usable offcuts after cuts
  - Shows what's left: "You have a 12×24" piece — perfect for drawer bottoms"
  - Suggests future projects that can use existing scraps
  - Groups scraps by material type
  - Find matching scrap for needed dimensions
  - Mark scraps as used or delete them
  - Summary view with total pieces, square footage, and suggested uses
  - Priority-ranked suggestions for scrap utilization

- [x] **Unit Toggle (Metric/Imperial)**
  - Instant toggle between inches and millimeters
  - Persistent preferences saved to localStorage
  - Fraction display support for imperial (1/16", 1/8", etc.)
  - Unit input components with automatic conversion
  - Format display for both systems
  - Seamless switching without re-entering values
  - Supports feet, inches, mm, cm, and meters

- [x] **Localization (Local Supplier Finder)**
  - Search for suppliers by zip code
  - Find nearby stores with distances
  - Filter by category (plywood, hardware, tools, etc.)
  - Filter by store type (big box, specialty, lumber yard, online)
  - Price tier indicators (budget, mid, premium)
  - In-stock probability estimates
  - Direct links to store websites and search pages
  - Price comparison across local and online suppliers
  - Personalized recommendations based on location
  - Quick links to popular suppliers

- [x] **Scratch-Build Calculator**
  - Enter tools you own (table saw, router, etc.)
  - Get time estimates specific to your setup
  - Tips and techniques for your tool combination
  - Tool rental recommendations for specialized cuts
  - Skill level adjustments
  - Material-specific time estimates
  - Alternative tool suggestions

- [x] **Climate Adjustment**
  - Enter your humidity zone
  - Suggests plywood/MDF considerations
  - Joint tolerance adjustments
  - Seasonal movement warnings
  - Finish recommendations for your climate
  - Wood acclimation guidelines
  - Climate zone lookup by zip code

## 🤝 Contributing

This is currently a solo project, but contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 👤 Author

**Michael Flanigan** - Modology Studios

## 🔗 Links

- [Modology Studios](https://www.modologystudios.com/)
- [GitHub Repository](https://github.com/MJFlanigan5/modology-cabinet-designer)

## 💬 Support

For questions or issues, please open a GitHub issue.
