# Parkinson AI - Early Detection & Voice Monitoring System

An end-to-end AI-powered platform for early detection and continuous monitoring of Parkinson's Disease using voice biomarker analysis and machine learning.

## Voice prediction scope

The current voice classifier distinguishes Parkinson-associated voice samples
from control samples. Uploaded and recorded audio are sent to the same
prediction endpoint, and the result displays the model's Parkinson-associated
score as a percentage. This score is not a calibrated probability that a
person has Parkinson's disease and is not a clinical diagnosis. The model does
not identify other diseases; its output should not be used to make medical
decisions. Consult a qualified clinician for diagnosis and care.

---

## 📁 Repository Structure

```
.
├── backend/            # FastAPI backend service, API endpoints, auth, and database
├── frontend/           # React + Vite frontend user interface
├── ml-model/           # ML training pipeline, audio feature extractors, and notebooks
├── .gitignore          # Git ignore rules for Python, Node, and IDE files
└── README.md           # Project documentation
```

---

## 🚀 Quick Start Guide

### 1. Backend Service (`/backend`)
FastAPI application with database integration, authentication, and voice analysis APIs.
```bash
cd backend
pip install -r requirements.txt
python run.py
```
- API Docs: `http://localhost:8000/api/docs`

### 2. Frontend Application (`/frontend`)
React UI for voice recording upload, dashboard visualization, and analysis reports.
```bash
cd frontend
npm install
npm run dev
```
- Web App: `http://localhost:5173`
- Start the backend in a separate terminal before uploading or recording audio:
  ```bash
  cd backend
  python run.py
  ```
- For a separately hosted backend, set `VITE_API_BASE_URL` to its base URL
  when building the frontend, and set `CORS_ALLOWED_ORIGINS` on the backend to
  the frontend's origin. The local development server proxies `/predict` to
  `http://127.0.0.1:8000`.

### 3. ML Model & Audio Pipeline (`/ml-model`)
Machine learning model training (Random Forest, SVM, XGBoost) and audio feature extraction (MDVP & MFCC biomarkers).
```bash
cd ml-model
pip install -r requirements.txt
python src/models/train_rf.py
```

---

## 🛠️ Deployment with Docker

Run the full system using Docker Compose:
```bash
cd backend
docker-compose up -d
```

---

## 📄 License
This project is for research and educational purposes.


## TERMINAL 1 - BACKEND
cd parkinson-main/backend
python run.py

## TERMINAL 2 - FRONTEND
cd parkinson-main/frontend
npm run dev

