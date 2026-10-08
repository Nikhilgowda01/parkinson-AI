"""
ParkinsonVoice — Multi-Disease Prediction API
=============================================
POST /predict  — accepts an audio file upload, extracts acoustic
features, and returns probability scores for 13 neurological conditions.
"""

import os
import shutil
import uuid
import traceback

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from src.audio.feature_extractor import extract_features
from src.disease_classifier import predict_multi_disease
from app.database import save_prediction

router = APIRouter()

UPLOAD_DIR = "uploads"
ALLOWED_EXTENSIONS = {".wav", ".mp3", ".ogg", ".webm", ".flac", ".m4a"}


def _safe_filename(original: str) -> str:
    """Generate a safe, unique filename preserving the extension."""
    ext = os.path.splitext(original)[1].lower() if original else ".audio"
    if ext not in ALLOWED_EXTENSIONS:
        ext = ".audio"
    return f"{uuid.uuid4().hex}{ext}"


@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Accepts an audio file and returns multi-disease neurological predictions.

    Supported formats: WAV, MP3, OGG, WEBM, FLAC, M4A
    Max recommended duration: 60 seconds
    """

    # --- Validate file presence ---
    if file is None or not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No audio file provided. Please upload a WAV, MP3, or OGG file."
        )

    original_name = file.filename or "unknown.audio"
    safe_name = _safe_filename(original_name)

    # --- Ensure upload directory exists ---
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, safe_name)

    # --- Save uploaded file ---
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save uploaded file: {e}"
        )

    # --- Extract acoustic features ---
    try:
        extracted = extract_features(file_path)
    except FileNotFoundError as e:
        _cleanup(file_path)
        raise HTTPException(status_code=400, detail=str(e))
    except ValueError as e:
        _cleanup(file_path)
        raise HTTPException(status_code=422, detail=str(e))
    except RuntimeError as e:
        _cleanup(file_path)
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        _cleanup(file_path)
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=(
                f"Audio feature extraction failed: {e}. "
                "Ensure the file is a valid audio recording."
            )
        )

    features = extracted["features"]
    metrics = extracted["metrics"]

    # --- Run multi-disease classification ---
    try:
        result = predict_multi_disease(features, metrics)
    except Exception as e:
        _cleanup(file_path)
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Disease classification failed: {e}"
        )

    # --- Persist to database (non-blocking on failure) ---
    try:
        save_prediction(
            patient_id=None,
            filename=original_name,
            prediction=result["primary_prediction"],
            healthy_probability=result["healthy_probability"],
            parkinson_probability=result.get("parkinson_probability", 0.0),
        )
    except Exception:
        pass  # DB failure should not block the response

    # --- Cleanup temporary file ---
    _cleanup(file_path)

    return JSONResponse(content={
        "primary_prediction": result["primary_prediction"],
        "primary_name": result["primary_name"],
        "healthy_probability": result["healthy_probability"],
        "disease_scores": result["disease_scores"],
        "top_parkinsonism": result["top_parkinsonism"],
        "top_other": result["top_other"],
        "confidence": result["confidence"],
        "risk_level": result["risk_level"],
        "metrics": metrics,
        # Legacy fields for backward compatibility
        "prediction": result["primary_prediction"],
        "parkinson_probability": result.get("parkinson_probability", 0.0),
    })


def _cleanup(path: str):
    try:
        if os.path.exists(path):
            os.remove(path)
    except Exception:
        pass