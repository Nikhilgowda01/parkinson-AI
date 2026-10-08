import pandas as pd
import matplotlib.pyplot as plt

from sklearn.ensemble import RandomForestClassifier

# Load dataset
df = pd.read_csv("data/features/voice_features.csv")

# Features and labels
X = df.drop("label", axis=1)
y = df["label"]

# Train model
model = RandomForestClassifier(
    n_estimators=200,
    random_state=42
)

model.fit(X, y)

# Feature importance
importance = model.feature_importances_

# Create dataframe
importance_df = pd.DataFrame({
    "Feature": X.columns,
    "Importance": importance
})

# Sort descending
importance_df = importance_df.sort_values(
    by="Importance",
    ascending=False
)

print("\n===== FEATURE IMPORTANCE =====\n")
print(importance_df)

# Plot
plt.figure(figsize=(12, 6))

plt.bar(
    importance_df["Feature"],
    importance_df["Importance"]
)

plt.title("Feature Importance - Parkinson Voice Detection")
plt.xlabel("Features")
plt.ylabel("Importance")

plt.xticks(rotation=90)

plt.tight_layout()

# Save graph
plt.savefig(
    "reports/results/feature_importance.png",
    dpi=300,
    bbox_inches="tight"
)

print("\nFeature Importance graph saved:")
print("reports/results/feature_importance.png")

plt.show()