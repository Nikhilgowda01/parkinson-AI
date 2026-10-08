from fastapi import APIRouter, UploadFile, File
import shutil
import os
import joblib
import pandas as pd

from src.audio.feature_extractor import extract_features

router = APIRouter()

model = joblib.load("models/parkinson_rf.pkl")

FEATURE_NAMES = [
    "mfcc1",
    "mfcc2",
    "mfcc3",
    "mfcc4",
    "mfcc5",
    "mfcc6",
    "mfcc7",
    "mfcc8",
    "mfcc9",
    "mfcc10",
    "mfcc11",
    "mfcc12",
    "mfcc13",
    "pitch",
    "zcr",
    "centroid"
]

@router.post("/predict")
async def predict(file: UploadFile = File(...)):

    os.makedirs("uploads", exist_ok=True)

    file_path = f"uploads/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    extracted = extract_features(file_path)

    features = extracted["features"]
    metrics = extracted["metrics"]

    X = pd.DataFrame(
        [features],
        columns=FEATURE_NAMES
    )

    prediction = model.predict(X)[0]

    probabilities = model.predict_proba(X)[0]

    healthy_prob = round(
        float(probabilities[0] * 100),
        2
    )

    parkinson_prob = round(
        float(probabilities[1] * 100),
        2
    )

    if abs(parkinson_prob - healthy_prob) < 10:
        final_prediction = "Uncertain"
    else:
        final_prediction = (
            "Parkinson"
            if prediction == 1
            else "Healthy"
        )

    return {
        "prediction": final_prediction,
        "healthy_probability": healthy_prob,
        "parkinson_probability": parkinson_prob,
        "metrics": metrics
    }