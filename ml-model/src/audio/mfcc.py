from pathlib import Path

import librosa
import numpy as np

base_dir = Path(__file__).resolve().parents[2]
healthy_dir = base_dir / "data" / "raw" / "healthy"
healthy_files = sorted(healthy_dir.glob("*.wav"))

if not healthy_files:
    raise FileNotFoundError(f"No audio files found in {healthy_dir}")

file = healthy_files[0]
audio, sr = librosa.load(file, sr=None)

mfcc = librosa.feature.mfcc(
    y=audio,
    sr=sr,
    n_mfcc=13
)

features = np.mean(mfcc, axis=1)

print(features)