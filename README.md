# KerfOS

**Precision cabinet design for woodworkers and DIYers.**

AI-powered cabinet design tool that makes professional fabrication accessible to everyone.

> **Kerf** /kɜːrf/ — The width of material removed by a cut. A woodworker's most fundamental measurement.

---

## 🎯 Vision

Make professional cabinet fabrication accessible to DIYers and small shops by automating complex parts: design optimization, cut list generation, and hardware sourcing.

## 🚀 Features

### Core Features
- **Cabinet Builder UI** - Drag-and-drop cabinet components
- **3D Preview** - Real-time 3D visualization
- **Material Library** - Pre-configured materials with dimensions
- **Cut List Generator** - Optimized 2D cutting plans
- **Hardware Finder** - Suggest hinges, slides, screws
- **Pricing Calculator** - Estimate material and hardware costs
- **Export Options** - PDF cut lists, CSV, DXF for CNC machines

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React** - UI components
- **Three.js** - 3D rendering and visualization
- **Tailwind CSS** - Styling and responsive design

### Backend
- **FastAPI** - Python web framework
- **PostgreSQL** - Database (via Railway)
- **Railway** - Deployment and hosting

## 🚀 Railway Deployment

This repository is configured for Railway deployment. See `README_RAILWAY.md` for deployment instructions.

## 📁 Project Structure

```
modology-cabinet-designer/
├── backend/           # FastAPI backend
├── frontend/          # Next.js frontend
├── design/            # Design specifications
├── public/            # Public assets
├── .gitignore
├── LICENSE
├── SECURITY.md
├── setup-railway.sh   # Railway deployment script
├── README.md          # This file
└── README_RAILWAY.md  # Railway deployment guide
```

## 🧪 Getting Started

### Local Development

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Production Deployment

1. **Deploy backend to Railway:**
   ```bash
   bash setup-railway.sh
   ```

2. **Deploy frontend to Vercel or Railway**

## 📝 License

MIT License - see LICENSE file for details.

## 👤 Author

**Michael Flanigan**

## 🔗 Links

- **GitHub Repository:** https://github.com/MJFlanigan5/modology-cabinet-designer
- **Design Specifications:** [design/PENCIL_DESIGN_SPECS.md](design/PENCIL_DESIGN_SPECS.md)