import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("data/features/voice_features.csv")

plt.figure(figsize=(8,5))

plt.scatter(
    df["pitch"],
    df["centroid"],
    c=df["label"]
)

plt.xlabel("Pitch")
plt.ylabel("Centroid")
plt.title("Healthy vs Parkinson")

plt.show()