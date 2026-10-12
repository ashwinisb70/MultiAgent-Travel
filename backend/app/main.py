from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.config import Base, engine
from app.api import auth, trips, preferences, bookings, documents

# Create tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="AI-powered multi-agent travel planning system"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=settings.API_V1_STR, tags=["auth"])
app.include_router(trips.router, prefix=settings.API_V1_STR, tags=["trips"])
app.include_router(preferences.router, prefix=settings.API_V1_STR, tags=["preferences"])
app.include_router(bookings.router, prefix=settings.API_V1_STR, tags=["bookings"])
app.include_router(documents.router, prefix=settings.API_V1_STR, tags=["documents"])

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "TripGenie - AI Travel Planner API",
        "version": settings.PROJECT_VERSION,
        "docs": "/docs"
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}
