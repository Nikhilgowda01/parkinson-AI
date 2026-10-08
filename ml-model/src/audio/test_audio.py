import os
from pathlib import Path

import librosa

base_dir = Path(__file__).resolve().parents[2]
healthy_dir = base_dir / "data" / "raw" / "healthy"
parkinson_dir = base_dir / "data" / "raw" / "parkinson"

healthy_files = sorted(healthy_dir.glob("*.wav"))
parkinson_files = sorted(parkinson_dir.glob("*.wav"))

if not healthy_files or not parkinson_files:
    raise FileNotFoundError(
        f"Required audio samples not found in {healthy_dir} or {parkinson_dir}"
    )

files = [
    healthy_files[0],
    healthy_files[1] if len(healthy_files) > 1 else healthy_files[0],
    parkinson_files[0],
]

for file in files:
    audio, sr = librosa.load(file, sr=None)

    print("\nFile:", os.path.basename(file))
    print("Sample Rate:", sr)
    print("Duration:", len(audio) / sr)