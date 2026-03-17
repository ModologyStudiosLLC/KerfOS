from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.routers import cabinets, materials, hardware
from app.database import engine
from app.models import Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create database tables
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown
    pass


app = FastAPI(
    title="Modology Cabinet Designer API",
    description="API for AI-powered cabinet design tool",
    version="0.1.0",
    lifespan=lifespan
)

# CORS - Allow Cloudflare Pages and local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:4173",
        "https://modologystudios.com",
        "*.pages.dev"  # Cloudflare Pages preview URLs
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "message": "Modology Cabinet Designer API",
        "version": "0.1.0",
        "status": "running"
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.get("/init-db")
async def init_database():
    """
    Initialize database tables.
    This endpoint can be used to manually trigger table creation.
    """
    try:
        Base.metadata.create_all(bind=engine)
        tables = list(Base.metadata.tables.keys())
        return {
            "status": "success",
            "message": "Database tables created/verified",
            "tables": tables
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Include routers
app.include_router(cabinets.router)
app.include_router(materials.router)
app.include_router(hardware.router)