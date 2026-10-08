from pathlib import Path

import librosa
import numpy as np

base_dir = Path(__file__).resolve().parents[2]
healthy_dir = base_dir / "data" / "raw" / "healthy"
audio_path = next(
    (path for path in sorted(healthy_dir.glob("*.wav")) if path.is_file()),
    None,
)

if audio_path is None:
    raise FileNotFoundError(f"No audio files found in {healthy_dir}")

audio, sr = librosa.load(audio_path, sr=None)

pitch = librosa.yin(
    audio,
    fmin=50,
    fmax=400
)

print(np.mean(pitch))