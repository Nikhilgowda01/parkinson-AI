"""
Multi-Disease Neurological Classifier
=====================================
Uses acoustic voice features to estimate likelihood percentages
for 13 neurological / movement disorders.

Category A – Parkinsonism-related (7 conditions)
Category B – Other neurological conditions affecting voice/speech (6 conditions)

NOTE: This is a rule-based probabilistic model derived from peer-reviewed
acoustic biomarker literature. It is NOT a validated clinical diagnostic tool.
All output values are research estimates only.
"""

import numpy as np


# ---------------------------------------------------------------------------
# Disease catalogue
# ---------------------------------------------------------------------------

DISEASES = [
    # --- Category A: Parkinsonism-related ---
    {
        "id": "PD",
        "name": "Parkinson's Disease",
        "short": "PD",
        "category": "A",
        "category_label": "Parkinsonism-Related",
        "description": (
            "Classic idiopathic Parkinson's disease — characterised by "
            "bradykinesia, rigidity, resting tremor, and postural instability. "
            "Voice markers: hypophonia, monopitch, reduced loudness variation."
        ),
    },
    {
        "id": "MSA",
        "name": "Multiple System Atrophy",
        "short": "MSA",
        "category": "A",
        "category_label": "Parkinsonism-Related",
        "description": (
            "Atypical parkinsonism with autonomic failure. "
            "Voice markers: mixed hypo/hyperkinetic dysarthria, irregular pitch."
        ),
    },
    {
        "id": "PSP",
        "name": "Progressive Supranuclear Palsy",
        "short": "PSP",
        "category": "A",
        "category_label": "Parkinsonism-Related",
        "description": (
            "Tau-related atypical parkinsonism with vertical gaze palsy. "
            "Voice markers: harsh, strained, low-pitched voice with dysarthria."
        ),
    },
    {
        "id": "CBD",
        "name": "Corticobasal Degeneration",
        "short": "CBD",
        "category": "A",
        "category_label": "Parkinsonism-Related",
        "description": (
            "Rare atypical parkinsonism with cortical signs. "
            "Voice markers: apraxia of speech, variable articulation errors."
        ),
    },
    {
        "id": "DLB",
        "name": "Dementia with Lewy Bodies",
        "short": "DLB",
        "category": "A",
        "category_label": "Parkinsonism-Related",
        "description": (
            "Lewy body dementia with fluctuating cognition and parkinsonism. "
            "Voice markers: similar to PD with added cognitive interference."
        ),
    },
    {
        "id": "VP",
        "name": "Vascular Parkinsonism",
        "short": "VP",
        "category": "A",
        "category_label": "Parkinsonism-Related",
        "description": (
            "Parkinsonism caused by cerebrovascular disease. "
            "Voice markers: spastic/ataxic dysarthria, irregular prosody."
        ),
    },
    {
        "id": "DIP",
        "name": "Drug-Induced Parkinsonism",
        "short": "DIP",
        "category": "A",
        "category_label": "Parkinsonism-Related",
        "description": (
            "Parkinsonism secondary to dopamine-blocking medications. "
            "Voice markers: similar to PD but potentially reversible."
        ),
    },
    # --- Category B: Other neurological conditions ---
    {
        "id": "ET",
        "name": "Essential Tremor",
        "short": "ET",
        "category": "B",
        "category_label": "Other Neurological (Voice/Speech)",
        "description": (
            "Common movement disorder with action/postural tremor. "
            "Voice markers: voice tremor (8–12 Hz), amplitude modulation."
        ),
    },
    {
        "id": "ALS",
        "name": "Amyotrophic Lateral Sclerosis",
        "short": "ALS",
        "category": "B",
        "category_label": "Other Neurological (Voice/Speech)",
        "description": (
            "Motor neuron disease with progressive bulbar involvement. "
            "Voice markers: spastic/flaccid dysarthria, hypernasality, weak voice."
        ),
    },
    {
        "id": "HD",
        "name": "Huntington's Disease",
        "short": "HD",
        "category": "B",
        "category_label": "Other Neurological (Voice/Speech)",
        "description": (
            "Autosomal dominant neurodegeneration with chorea. "
            "Voice markers: hyperkinetic dysarthria, irregular voice onset, breathiness."
        ),
    },
    {
        "id": "CA",
        "name": "Cerebellar Ataxia",
        "short": "CA",
        "category": "B",
        "category_label": "Other Neurological (Voice/Speech)",
        "description": (
            "Cerebellar dysfunction with ataxic speech. "
            "Voice markers: scanning speech, irregular pitch/loudness, ataxic dysarthria."
        ),
    },
    {
        "id": "SRD",
        "name": "Stroke-related Dysarthria",
        "short": "SRD",
        "category": "B",
        "category_label": "Other Neurological (Voice/Speech)",
        "description": (
            "Dysarthria following cerebrovascular accident. "
            "Voice markers: spastic dysarthria, reduced rate, strained-strangled voice."
        ),
    },
    {
        "id": "MS",
        "name": "Multiple Sclerosis",
        "short": "MS",
        "category": "B",
        "category_label": "Other Neurological (Voice/Speech)",
        "description": (
            "Demyelinating CNS disease with variable speech involvement. "
            "Voice markers: mixed dysarthria, dysphonia, fatigue-related decline."
        ),
    },
]

DISEASE_IDS = [d["id"] for d in DISEASES]


# ---------------------------------------------------------------------------
# Feature-based scoring functions (literature-derived heuristics)
# ---------------------------------------------------------------------------

def _sigmoid(x: float) -> float:
    return 1.0 / (1.0 + np.exp(-x))


def _normalize(arr: np.ndarray) -> np.ndarray:
    """Normalize array to sum to 1."""
    total = arr.sum()
    if total == 0:
        return np.ones(len(arr)) / len(arr)
    return arr / total


def compute_disease_scores(features: np.ndarray, metrics: dict) -> dict:
    """
    Compute a raw likelihood score (0–1) for each disease based on
    acoustic feature patterns documented in clinical speech research.

    Literature references (abbreviated):
    - Tsanas et al. (2012) – PD MFCC/jitter/shimmer markers
    - Skodda et al. (2011) – PD pitch, HNR
    - Rusz et al. (2011, 2014, 2018) – atypical parkinsonism, ALS, HD acoustic markers
    - Whitfield & Goberman (2014) – MSA/PSP voice
    - Kent et al. (2000) – ALS dysarthria
    - Gamboa et al. (1997) – ET voice tremor
    - Patel (2002) – MS dysphonia
    """

    # Unpack key metrics
    fo = metrics.get("fo", 0.0)           # fundamental frequency Hz
    jitter = metrics.get("jitter", 0.0)   # ZCR-based jitter proxy
    shimmer = metrics.get("shimmer", 0.0) # amplitude variation proxy
    hnr = metrics.get("hnr", 0.0)         # harmonic-to-noise ratio estimate
    centroid = metrics.get("spectral_centroid", 1500.0)
    bandwidth = metrics.get("spectral_bandwidth", 800.0)
    rolloff = metrics.get("spectral_rolloff", 3500.0)
    rms = metrics.get("rms_energy", 0.05)
    mfcc_mean = metrics.get("mfcc_mean", 0.0)
    mfcc_std = metrics.get("mfcc_std", 10.0)

    # Normalised input helpers (clipped to reasonable ranges)
    fo_norm = np.clip(fo / 300.0, 0, 1)           # 0=low pitch, 1=high pitch
    jitter_norm = np.clip(jitter * 50, 0, 1)       # 0=smooth, 1=jagged
    shimmer_norm = np.clip(shimmer * 10, 0, 1)     # 0=stable, 1=variable
    hnr_norm = np.clip((hnr + 20) / 40.0, 0, 1)   # 0=noisy, 1=clean
    rms_norm = np.clip(rms * 20, 0, 1)             # 0=weak, 1=loud
    centroid_norm = np.clip(centroid / 4000.0, 0, 1)
    bandwidth_norm = np.clip(bandwidth / 2000.0, 0, 1)
    mfcc_var_norm = np.clip(mfcc_std / 30.0, 0, 1)

    scores = {}

    # ------------------------------------------------------------------
    # A1. Parkinson's Disease (PD)
    # Hallmarks: reduced fo variability, high jitter, high shimmer, low HNR,
    #            low voice energy (hypophonia), low MFCC variation
    # ------------------------------------------------------------------
    pd_score = (
        0.25 * (1 - fo_norm)          # monopitch / low F0 range
        + 0.20 * jitter_norm           # increased jitter
        + 0.20 * shimmer_norm          # increased shimmer
        + 0.15 * (1 - hnr_norm)       # reduced HNR (breathy/noisy)
        + 0.12 * (1 - rms_norm)       # hypophonia
        + 0.08 * (1 - mfcc_var_norm)  # reduced spectral variation
    )
    scores["PD"] = float(np.clip(pd_score, 0, 1))

    # ------------------------------------------------------------------
    # A2. Multiple System Atrophy (MSA)
    # Hallmarks: mixed dysarthria, irregular pitch, sighs/gasps
    # ------------------------------------------------------------------
    msa_score = (
        0.22 * jitter_norm
        + 0.18 * shimmer_norm
        + 0.18 * (1 - hnr_norm)
        + 0.15 * bandwidth_norm        # broader spectral spread
        + 0.12 * (1 - fo_norm)
        + 0.10 * mfcc_var_norm         # more irregular spectrum
        + 0.05 * (1 - rms_norm)
    )
    scores["MSA"] = float(np.clip(msa_score, 0, 1))

    # ------------------------------------------------------------------
    # A3. Progressive Supranuclear Palsy (PSP)
    # Hallmarks: harsh strained voice, low pitch, reduced rate
    # ------------------------------------------------------------------
    psp_score = (
        0.25 * (1 - fo_norm)          # low pitch
        + 0.20 * shimmer_norm          # harsh/strained voice
        + 0.18 * (1 - hnr_norm)
        + 0.15 * (1 - centroid_norm)   # dark/low spectral centroid
        + 0.12 * jitter_norm
        + 0.10 * (1 - rms_norm)
    )
    scores["PSP"] = float(np.clip(psp_score, 0, 1))

    # ------------------------------------------------------------------
    # A4. Corticobasal Degeneration (CBD)
    # Hallmarks: apraxia of speech, variable articulatory errors, groping
    # ------------------------------------------------------------------
    cbd_score = (
        0.28 * mfcc_var_norm           # variable/inconsistent articulation
        + 0.20 * jitter_norm
        + 0.18 * shimmer_norm
        + 0.14 * bandwidth_norm
        + 0.12 * (1 - fo_norm)
        + 0.08 * (1 - hnr_norm)
    )
    scores["CBD"] = float(np.clip(cbd_score, 0, 1))

    # ------------------------------------------------------------------
    # A5. Dementia with Lewy Bodies (DLB)
    # Hallmarks: similar to PD + cognitive/fluctuating aspects
    # ------------------------------------------------------------------
    dlb_score = (
        0.22 * (1 - fo_norm)
        + 0.18 * jitter_norm
        + 0.18 * shimmer_norm
        + 0.14 * (1 - hnr_norm)
        + 0.14 * mfcc_var_norm         # fluctuating cognitive interference
        + 0.08 * (1 - rms_norm)
        + 0.06 * (1 - centroid_norm)
    )
    scores["DLB"] = float(np.clip(dlb_score, 0, 1))

    # ------------------------------------------------------------------
    # A6. Vascular Parkinsonism (VP)
    # Hallmarks: lower-body parkinsonism, spastic/ataxic dysarthria
    # ------------------------------------------------------------------
    vp_score = (
        0.22 * (1 - hnr_norm)         # spastic quality
        + 0.20 * bandwidth_norm        # broader bandwidth from spasticity
        + 0.18 * shimmer_norm
        + 0.15 * (1 - centroid_norm)
        + 0.14 * jitter_norm
        + 0.11 * (1 - fo_norm)
    )
    scores["VP"] = float(np.clip(vp_score, 0, 1))

    # ------------------------------------------------------------------
    # A7. Drug-Induced Parkinsonism (DIP)
    # Hallmarks: similar to PD, may have less bradyphonia
    # ------------------------------------------------------------------
    dip_score = (
        0.24 * (1 - fo_norm)
        + 0.20 * jitter_norm
        + 0.18 * shimmer_norm
        + 0.15 * (1 - hnr_norm)
        + 0.13 * (1 - rms_norm)
        + 0.10 * (1 - mfcc_var_norm)
    )
    scores["DIP"] = float(np.clip(dip_score, 0, 1))

    # ------------------------------------------------------------------
    # B1. Essential Tremor (ET)
    # Hallmarks: rhythmic voice tremor 8–12 Hz, amplitude modulation
    # ------------------------------------------------------------------
    et_score = (
        0.30 * jitter_norm             # oscillatory jitter from tremor
        + 0.25 * shimmer_norm          # amplitude modulation
        + 0.18 * hnr_norm              # relatively clean signal (ET ≠ noisy)
        + 0.15 * fo_norm               # pitch within normal range
        + 0.12 * rms_norm              # normal-loud voice
    )
    scores["ET"] = float(np.clip(et_score, 0, 1))

    # ------------------------------------------------------------------
    # B2. ALS – Amyotrophic Lateral Sclerosis
    # Hallmarks: mixed spastic+flaccid dysarthria, hypernasality, weak/breathy
    # ------------------------------------------------------------------
    als_score = (
        0.25 * (1 - hnr_norm)         # breathy/noisy voice
        + 0.22 * (1 - rms_norm)       # weak voice output
        + 0.18 * shimmer_norm          # amplitude instability
        + 0.15 * bandwidth_norm        # spectral smearing from weakness
        + 0.12 * jitter_norm
        + 0.08 * (1 - centroid_norm)  # low spectral centroid (hypernasality)
    )
    scores["ALS"] = float(np.clip(als_score, 0, 1))

    # ------------------------------------------------------------------
    # B3. Huntington's Disease (HD)
    # Hallmarks: hyperkinetic dysarthria, irregular voice onset, breathiness
    # ------------------------------------------------------------------
    hd_score = (
        0.28 * mfcc_var_norm           # highly variable spectrum
        + 0.22 * jitter_norm
        + 0.20 * shimmer_norm
        + 0.15 * bandwidth_norm
        + 0.10 * (1 - hnr_norm)
        + 0.05 * fo_norm
    )
    scores["HD"] = float(np.clip(hd_score, 0, 1))

    # ------------------------------------------------------------------
    # B4. Cerebellar Ataxia (CA)
    # Hallmarks: scanning/explosive speech, irregular pitch & loudness
    # ------------------------------------------------------------------
    ca_score = (
        0.28 * mfcc_var_norm           # irregular/scanning prosody
        + 0.22 * bandwidth_norm        # wide spectral range
        + 0.18 * jitter_norm           # pitch irregularity
        + 0.15 * shimmer_norm
        + 0.12 * fo_norm               # may be higher pitch
        + 0.05 * (1 - hnr_norm)
    )
    scores["CA"] = float(np.clip(ca_score, 0, 1))

    # ------------------------------------------------------------------
    # B5. Stroke-related Dysarthria (SRD)
    # Hallmarks: spastic dysarthria, strained-strangled voice, reduced rate
    # ------------------------------------------------------------------
    srd_score = (
        0.25 * (1 - hnr_norm)         # strained quality
        + 0.22 * (1 - centroid_norm)  # low spectral centroid (spasticity)
        + 0.18 * shimmer_norm
        + 0.15 * (1 - rms_norm)
        + 0.12 * jitter_norm
        + 0.08 * (1 - fo_norm)
    )
    scores["SRD"] = float(np.clip(srd_score, 0, 1))

    # ------------------------------------------------------------------
    # B6. Multiple Sclerosis (MS)
    # Hallmarks: mixed/variable dysarthria, fatigue effects, dysphonia
    # ------------------------------------------------------------------
    ms_score = (
        0.22 * mfcc_var_norm           # variable/inconsistent patterns
        + 0.20 * (1 - hnr_norm)
        + 0.18 * bandwidth_norm
        + 0.16 * shimmer_norm
        + 0.14 * jitter_norm
        + 0.10 * (1 - rms_norm)
    )
    scores["MS"] = float(np.clip(ms_score, 0, 1))

    return scores


# ---------------------------------------------------------------------------
# Healthy baseline reference
# ---------------------------------------------------------------------------

def compute_healthy_score(metrics: dict) -> float:
    """
    High HNR, low jitter, low shimmer, normal-loud RMS, moderate pitch
    → healthy voice.
    """
    hnr_norm = np.clip((metrics.get("hnr", 0) + 20) / 40.0, 0, 1)
    jitter_norm = np.clip(metrics.get("jitter", 0) * 50, 0, 1)
    shimmer_norm = np.clip(metrics.get("shimmer", 0) * 10, 0, 1)
    rms_norm = np.clip(metrics.get("rms_energy", 0) * 20, 0, 1)

    health = (
        0.35 * hnr_norm
        + 0.25 * (1 - jitter_norm)
        + 0.25 * (1 - shimmer_norm)
        + 0.15 * rms_norm
    )
    return float(np.clip(health, 0, 1))


# ---------------------------------------------------------------------------
# Main prediction function
# ---------------------------------------------------------------------------

def predict_multi_disease(features: np.ndarray, metrics: dict) -> dict:
    """
    Given acoustic features and metrics, return a full multi-disease
    prediction with calibrated percentage scores for all 13 conditions,
    plus an overall healthy probability.

    Returns:
        {
          "primary_prediction": str,          # top disease ID or "Healthy"
          "primary_name": str,
          "healthy_probability": float,       # 0–100
          "disease_scores": [                 # ordered by score desc
            {
              "id": str,
              "name": str,
              "short": str,
              "category": "A" | "B",
              "category_label": str,
              "description": str,
              "probability": float,           # 0–100
              "is_primary": bool,
            },
            ...
          ],
          "top_parkinsonism": {...},          # top Category A result
          "top_other": {...},                 # top Category B result
          "confidence": str,                  # "High" | "Moderate" | "Low"
          "risk_level": str,
        }
    """
    raw_scores = compute_disease_scores(features, metrics)
    healthy = compute_healthy_score(metrics)

    # Convert to numpy array for easy normalisation
    ids = list(raw_scores.keys())
    score_arr = np.array([raw_scores[d] for d in ids])

    # Softmax calibration for smoother probability distribution
    temperature = 0.6  # lower = sharper, higher = flatter
    exp_scores = np.exp(score_arr / temperature)
    # Include a "healthy" slot in the softmax
    healthy_exp = np.exp(healthy / temperature)
    total_exp = exp_scores.sum() + healthy_exp

    calibrated = exp_scores / total_exp
    healthy_prob = float(healthy_exp / total_exp)

    # Round to 2 decimal places, expressed as percentage
    calibrated_pct = {ids[i]: round(float(calibrated[i]) * 100, 2) for i in range(len(ids))}
    healthy_pct = round(healthy_prob * 100, 2)

    # Build disease score list
    disease_score_list = []
    for disease in DISEASES:
        did = disease["id"]
        disease_score_list.append({
            **disease,
            "probability": calibrated_pct.get(did, 0.0),
            "is_primary": False,
        })

    # Sort by probability descending
    disease_score_list.sort(key=lambda x: x["probability"], reverse=True)

    # Mark primary
    top_disease = disease_score_list[0]
    primary_id = top_disease["id"]
    primary_name = top_disease["name"]
    top_prob = top_disease["probability"]

    # If healthy score is well above all diseases, call it Healthy
    if healthy_pct > top_prob and healthy_pct > 30:
        primary_id = "Healthy"
        primary_name = "Healthy (No significant neurological voice pattern)"
        for d in disease_score_list:
            d["is_primary"] = False
    else:
        for d in disease_score_list:
            d["is_primary"] = (d["id"] == primary_id)

    # Category A and B bests
    cat_a = [d for d in disease_score_list if d["category"] == "A"]
    cat_b = [d for d in disease_score_list if d["category"] == "B"]
    top_parkinsonism = cat_a[0] if cat_a else None
    top_other = cat_b[0] if cat_b else None

    # Confidence level
    if top_prob > 30:
        confidence = "High"
    elif top_prob > 18:
        confidence = "Moderate"
    else:
        confidence = "Low"

    # Risk level
    if primary_id == "Healthy":
        risk_level = "No significant risk detected"
    elif primary_id in ("PD", "MSA", "PSP", "CBD", "DLB", "ALS"):
        risk_level = "High Clinical Concern"
    elif primary_id in ("VP", "DIP", "HD", "SRD"):
        risk_level = "Moderate Clinical Concern"
    else:
        risk_level = "Low–Moderate Concern"

    return {
        "primary_prediction": primary_id,
        "primary_name": primary_name,
        "healthy_probability": healthy_pct,
        "disease_scores": disease_score_list,
        "top_parkinsonism": top_parkinsonism,
        "top_other": top_other,
        "confidence": confidence,
        "risk_level": risk_level,
        # Legacy fields for backward compatibility
        "prediction": primary_id,
        "parkinson_probability": calibrated_pct.get("PD", 0.0),
    }
