import sys, numpy as np
sys.path.insert(0, '.')
from src.disease_classifier import predict_multi_disease

metrics = {
    'fo': 90.0,
    'jitter': 0.018,
    'shimmer': 0.08,
    'hnr': -5.0,
    'rms_energy': 0.02,
    'spectral_centroid': 800.0,
    'spectral_bandwidth': 600.0,
    'spectral_rolloff': 2000.0,
    'mfcc_mean': -5.0,
    'mfcc_std': 18.0,
}

fake_features = np.zeros(16)
result = predict_multi_disease(fake_features, metrics)

print("Primary:", result["primary_prediction"], "-", result["primary_name"])
print("Healthy probability:", result["healthy_probability"], "%")
print("Confidence:", result["confidence"])
print("Risk level:", result["risk_level"])
print()
print("Top 5 disease scores:")
for d in result["disease_scores"][:5]:
    cat = d["category"]
    short = d["short"]
    name = d["name"][:35]
    prob = d["probability"]
    print(f"  [{cat}] {short:<5} {name:<35} {prob:5.1f}%")
