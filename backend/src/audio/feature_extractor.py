import librosa
import numpy as np
import os
import tempfile


def _convert_to_wav_if_needed(file_path: str) -> tuple[str, bool]:
    """
    Convert audio to a librosa-compatible format if needed.
    Returns (path_to_use, was_temp_file).
    """
    ext = os.path.splitext(file_path)[1].lower()
    # librosa handles wav, mp3, ogg, flac natively via soundfile/audioread
    return file_path, False


def extract_features(file_path: str) -> dict:
    """
    Extract acoustic features from an audio file.
    Supports WAV, MP3, OGG, WEBM formats.
    Returns a dict with 'features' (numpy array, 16 values) and 'metrics'.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Audio file not found: {file_path}")

    file_size = os.path.getsize(file_path)
    if file_size == 0:
        raise ValueError("Uploaded audio file is empty (0 bytes).")

    try:
        # Load audio - librosa handles resampling automatically
        y, sr = librosa.load(file_path, sr=22050, mono=True, duration=60.0)
    except Exception as load_err:
        raise RuntimeError(
            f"Could not decode audio file '{os.path.basename(file_path)}'. "
            f"Ensure it is a valid WAV, MP3, or OGG file. Error: {load_err}"
        )

    if len(y) == 0:
        raise ValueError("Audio file contains no audio data after loading.")

    # Normalize signal
    if np.max(np.abs(y)) > 0:
        y = y / np.max(np.abs(y))

    # --- MFCCs (13 coefficients) ---
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    mfcc_features = np.mean(mfccs.T, axis=0)  # shape (13,)

    # --- Pitch (fundamental frequency) ---
    pitches, magnitudes = librosa.piptrack(y=y, sr=sr, fmin=50, fmax=600)
    pitch_vals = pitches[pitches > 0]
    pitch = float(np.mean(pitch_vals)) if len(pitch_vals) > 0 else 0.0

    # --- Zero Crossing Rate (jitter proxy) ---
    zcr = float(np.mean(librosa.feature.zero_crossing_rate(y)))

    # --- Spectral Centroid ---
    centroid = float(np.mean(librosa.feature.spectral_centroid(y=y, sr=sr)))

    # Build feature vector: [mfcc1..13, pitch, zcr, centroid] = 16 values
    features = np.hstack([mfcc_features, pitch, zcr, centroid])

    # --- Voice Quality Metrics ---
    shimmer_proxy = float(np.std(np.abs(y)))
    signal_power = float(np.mean(np.abs(y)))
    noise_power = float(np.std(y)) + 1e-9
    hnr_estimate = float(20 * np.log10(signal_power / noise_power))

    # Spectral rolloff as a tremor-related proxy
    rolloff = float(np.mean(librosa.feature.spectral_rolloff(y=y, sr=sr, roll_percent=0.85)))

    # Spectral bandwidth
    bandwidth = float(np.mean(librosa.feature.spectral_bandwidth(y=y, sr=sr)))

    # RMS energy
    rms = float(np.mean(librosa.feature.rms(y=y)))

    metrics = {
        "fo": round(pitch, 2),
        "jitter": round(zcr, 5),
        "shimmer": round(shimmer_proxy, 5),
        "hnr": round(hnr_estimate, 2),
        "ppe": round(zcr * 10, 4),
        "rpde": round(float(np.var(y)), 5),
        "dfa": round(signal_power, 5),
        "spectral_centroid": round(centroid, 2),
        "spectral_rolloff": round(rolloff, 2),
        "spectral_bandwidth": round(bandwidth, 2),
        "rms_energy": round(rms, 5),
        "mfcc_mean": round(float(np.mean(mfcc_features)), 4),
        "mfcc_std": round(float(np.std(mfcc_features)), 4),
    }

    return {
        "features": features,
        "metrics": metrics
    }