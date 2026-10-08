from pathlib import Path

import librosa
import soundfile as sf

base_dir = Path(__file__).resolve().parents[2]
healthy_dir = base_dir / "data" / "raw" / "healthy"
healthy_files = sorted(healthy_dir.glob("*.wav"))

if not healthy_files:
    raise FileNotFoundError(f"No audio files found in {healthy_dir}")

input_file = healthy_files[0]
audio, sr = librosa.load(input_file, sr=None)

audio_trimmed, _ = librosa.effects.trim(audio)

output_dir = base_dir / "data" / "processed"
output_dir.mkdir(parents=True, exist_ok=True)
output_file = output_dir / f"{input_file.stem}_clean.wav"

sf.write(output_file, audio_trimmed, sr)

print(f"Saved: {output_file}")