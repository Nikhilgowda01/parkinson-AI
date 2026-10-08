"""
ParkinsonVoice Backend — FastAPI Application Entry Point
"""
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.prediction import router
from app.database import create_table

app = FastAPI(
    title="ParkinsonVoice Multi-Disease API",
    description=(
        "Neurological voice analysis API. Analyses acoustic features "
        "from voice recordings to estimate likelihood scores for 13 "
        "neurological conditions including Parkinson's Disease and related disorders."
    ),
    version="2.0.0",
)

# --- CORS ---
configured_origins = os.getenv("CORS_ALLOWED_ORIGINS", "")
allowed_origins = [
    origin.strip().rstrip("/")
    for origin in configured_origins.split(",")
    if origin.strip()
]
if not allowed_origins:
    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    create_table()
    # Ensure uploads directory exists
    os.makedirs("uploads", exist_ok=True)


app.include_router(router)


@app.get("/")
def root():
    return {
        "message": "ParkinsonVoice Multi-Disease API is running",
        "version": "2.0.0",
        "diseases_supported": 13,
    }


@app.get("/health")
def health():
    return {"status": "ok"}