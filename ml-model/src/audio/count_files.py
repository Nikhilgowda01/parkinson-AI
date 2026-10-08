from pathlib import Path

healthy = len(list(Path("data/raw/healthy").glob("*")))
parkinson = len(list(Path("data/raw/parkinson").glob("*")))

print("Healthy:", healthy)
print("Parkinson:", parkinson)
print("Total:", healthy + parkinson)