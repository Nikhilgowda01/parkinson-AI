import librosa
import numpy as np
import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]

HEALTHY_DIR = BASE_DIR / "data" / "raw" / "healthy"
PARKINSON_DIR = BASE_DIR / "data" / "raw" / "parkinson"

features_list = []

def extract_features(file_path, label):
    try:
        audio, sr = librosa.load(file_path, sr=None)

        # Remove silence
        audio, _ = librosa.effects.trim(audio)

        # MFCC
        mfcc = librosa.feature.mfcc(
            y=audio,
            sr=sr,
            n_mfcc=13
        )

        mfcc_mean = np.mean(mfcc, axis=1)

        # Pitch
        pitch = librosa.yin(
            audio,
            fmin=50,
            fmax=400
        )

        pitch_mean = np.mean(pitch)

        # ZCR
        zcr = librosa.feature.zero_crossing_rate(audio)
        zcr_mean = np.mean(zcr)

        # Spectral Centroid
        centroid = librosa.feature.spectral_centroid(
            y=audio,
            sr=sr
        )

        centroid_mean = np.mean(centroid)

        feature_vector = list(mfcc_mean)

        feature_vector.extend([
            pitch_mean,
            zcr_mean,
            centroid_mean,
            label
        ])

        return feature_vector

    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return None


# Healthy voices
for wav_file in HEALTHY_DIR.glob("*.wav"):
    row = extract_features(wav_file, 0)
    if row:
        features_list.append(row)

# Parkinson voices
for wav_file in PARKINSON_DIR.glob("*.wav"):
    row = extract_features(wav_file, 1)
    if row:
        features_list.append(row)

columns = [
    "mfcc1","mfcc2","mfcc3","mfcc4","mfcc5",
    "mfcc6","mfcc7","mfcc8","mfcc9","mfcc10",
    "mfcc11","mfcc12","mfcc13",
    "pitch",
    "zcr",
    "centroid",
    "label"
]

df = pd.DataFrame(features_list, columns=columns)

output_dir = BASE_DIR / "data" / "features"
output_dir.mkdir(exist_ok=True)

csv_file = output_dir / "voice_features.csv"

df.to_csv(csv_file, index=False)

print(df.head())
print(f"\nDataset saved: {csv_file}")
print(f"Total samples: {len(df)}")