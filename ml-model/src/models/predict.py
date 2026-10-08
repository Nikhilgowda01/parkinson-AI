import joblib
import librosa
import numpy as np
import pandas as pd
from pathlib import Path

# Project root directory
BASE_DIR = Path(__file__).resolve().parents[2]

# Load trained model
MODEL_PATH = BASE_DIR / "models" / "parkinson_rf.pkl"
model = joblib.load(MODEL_PATH)

parkinson_dir = BASE_DIR / "data" / "raw" / "parkinson"
parkinson_files = sorted(parkinson_dir.glob("*.wav"))
if not parkinson_files:
    raise FileNotFoundError(f"No Parkinson audio files found in {parkinson_dir}")

# Audio file to test
file_path = parkinson_files[0]

print(f"Testing file: {file_path}")

# Load audio
audio, sr = librosa.load(file_path, sr=None)

# Remove silence
audio, _ = librosa.effects.trim(audio)

# MFCC Features
mfcc = librosa.feature.mfcc(
    y=audio,
    sr=sr,
    n_mfcc=13
)

mfcc_mean = np.mean(mfcc, axis=1)

# Pitch Feature
pitch = librosa.yin(
    audio,
    fmin=50,
    fmax=400
)

pitch_mean = np.mean(pitch)

# Zero Crossing Rate
zcr = librosa.feature.zero_crossing_rate(audio)
zcr_mean = np.mean(zcr)

# Spectral Centroid
centroid = librosa.feature.spectral_centroid(
    y=audio,
    sr=sr
)

centroid_mean = np.mean(centroid)

# Create feature vector
features = list(mfcc_mean)

features.extend([
    pitch_mean,
    zcr_mean,
    centroid_mean
])

# Column names (must match training data)
columns = [
    "mfcc1", "mfcc2", "mfcc3", "mfcc4", "mfcc5",
    "mfcc6", "mfcc7", "mfcc8", "mfcc9", "mfcc10",
    "mfcc11", "mfcc12", "mfcc13",
    "pitch", "zcr", "centroid"
]

# Convert to DataFrame
input_df = pd.DataFrame(
    [features],
    columns=columns
)

# Predict
prediction = model.predict(input_df)[0]

# Probability
probability = model.predict_proba(input_df)[0]

print("\nPrediction Result")
print("-" * 30)

if prediction == 0:
    print("Class: Healthy Voice")
else:
    print("Class: Parkinson Voice")

print(f"Healthy Probability   : {probability[0]:.2%}")
print(f"Parkinson Probability : {probability[1]:.2%}")