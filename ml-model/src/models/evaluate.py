import pandas as pd
import matplotlib.pyplot as plt

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
    ConfusionMatrixDisplay
)

# Load dataset
df = pd.read_csv("data/features/voice_features.csv")

# Features and Labels
X = df.drop("label", axis=1)
y = df["label"]

# Train/Test Split
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# Train Model
model = RandomForestClassifier(
    n_estimators=200,
    random_state=42
)

model.fit(X_train, y_train)

# Predictions
y_pred = model.predict(X_test)

# Metrics
accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)

# Print Results
print("\n===== MODEL EVALUATION =====\n")

print(f"Accuracy : {accuracy:.4f}")
print(f"Precision: {precision:.4f}")
print(f"Recall   : {recall:.4f}")
print(f"F1 Score : {f1:.4f}")

print("\n===== CONFUSION MATRIX =====\n")
cm = confusion_matrix(y_test, y_pred)
print(cm)

print("\n===== CLASSIFICATION REPORT =====\n")
print(classification_report(y_test, y_pred))

# Save results to file
with open("reports/results/model_results.txt", "w") as f:
    f.write("===== MODEL EVALUATION =====\n\n")
    f.write(f"Accuracy : {accuracy:.4f}\n")
    f.write(f"Precision: {precision:.4f}\n")
    f.write(f"Recall   : {recall:.4f}\n")
    f.write(f"F1 Score : {f1:.4f}\n\n")

    f.write("===== CONFUSION MATRIX =====\n")
    f.write(str(cm))
    f.write("\n\n")

    f.write("===== CLASSIFICATION REPORT =====\n")
    f.write(classification_report(y_test, y_pred))

print("\nResults saved to reports/results/model_results.txt")

# Confusion Matrix Plot
plt.figure(figsize=(6, 6))

ConfusionMatrixDisplay.from_predictions(
    y_test,
    y_pred,
    display_labels=["Healthy", "Parkinson"]
)

plt.title("Confusion Matrix")

plt.savefig(
    "reports/results/confusion_matrix.png",
    dpi=300,
    bbox_inches="tight"
)

print("Confusion Matrix saved to reports/results/confusion_matrix.png")

plt.show()