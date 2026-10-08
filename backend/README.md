# ParkinsonVoice Backend

> **AI-Based Voice Monitoring System for Parkinson's Disease**
> FastAPI · SQLAlchemy · JWT · ML Pipeline · Docker

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your settings
```

### 3. Train the AI model (optional but recommended)
```bash
python app/ml/train_model.py
```

### 4. Run the server
```bash
python run.py
# OR
uvicorn app.main:app --reload --port 8000
```

### 5. Open the API docs
Visit: **http://localhost:8000/api/docs**

---

## 📁 Project Structure

```
Backend/
├── app/
│   ├── main.py                    # FastAPI app, middleware, lifespan
│   ├── core/
│   │   ├── config.py              # Pydantic settings (env vars)
│   │   ├── database.py            # Async SQLAlchemy engine & session
│   │   ├── security.py            # JWT creation & bcrypt hashing
│   │   ├── deps.py                # Auth dependency injection
│   │   └── init_db.py             # DB seeding (superuser creation)
│   ├── models/
│   │   ├── user.py                # User account model
│   │   ├── patient.py             # Patient medical profile
│   │   ├── voice_recording.py     # Audio file metadata
│   │   ├── analysis.py            # MDVP features + AI predictions
│   │   └── report.py              # Health reports
│   ├── schemas/
│   │   ├── auth.py                # Token / login schemas
│   │   ├── user.py                # User request/response
│   │   ├── patient.py             # Patient schemas
│   │   ├── voice.py               # Voice recording schemas
│   │   ├── analysis.py            # Analysis result schemas
│   │   └── report.py              # Report schemas
│   ├── api/v1/endpoints/
│   │   ├── auth.py                # Register, login, refresh, logout
│   │   ├── users.py               # User CRUD + avatar upload
│   │   ├── patients.py            # Patient profile management
│   │   ├── voice.py               # Voice upload + AI trigger
│   │   ├── analysis.py            # Analysis results + trends
│   │   ├── reports.py             # Report generation
│   │   └── admin.py               # System stats, user management
│   └── ml/
│       ├── feature_extractor.py   # librosa-based MDVP + MFCC extraction
│       ├── predictor.py           # ML model + rule-based fallback
│       ├── train_model.py         # Model training script
│       └── models/                # .pkl model files (after training)
├── tests/
│   ├── conftest.py                # pytest fixtures
│   ├── test_auth.py               # Auth endpoint tests
│   └── test_analysis.py           # ML pipeline tests
├── uploads/                       # Audio & profile image storage
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── pytest.ini
├── run.py
└── .env
```

---

## 🔐 Authentication

All protected endpoints require a JWT **Bearer token**:

```
Authorization: Bearer <access_token>
```

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/register` | POST | Register new user |
| `/api/v1/auth/login` | POST | Login → get tokens |
| `/api/v1/auth/refresh` | POST | Refresh access token |
| `/api/v1/auth/me` | GET | Get current user |
| `/api/v1/auth/logout` | POST | Logout |
| `/api/v1/auth/change-password` | POST | Change password |

---

## 🎤 Voice Analysis API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/voice/upload` | POST | Upload audio → auto AI analysis |
| `/api/v1/voice/` | GET | List recordings |
| `/api/v1/voice/{id}` | GET | Get recording |
| `/api/v1/voice/{id}` | DELETE | Delete recording |
| `/api/v1/voice/{id}/download` | GET | Download audio file |

---

## 🤖 AI Analysis

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/analysis/` | GET | List analyses |
| `/api/v1/analysis/trends` | GET | Get risk trend over time |
| `/api/v1/analysis/{id}` | GET | Get analysis result |
| `/api/v1/analysis/recording/{id}` | GET | Get analysis by recording |
| `/api/v1/analysis/{id}/reanalyze` | POST | Re-run AI analysis |

### Risk Levels
| Level | Probability | Action |
|-------|-------------|--------|
| `low` | < 30% | Monitor every 3-6 months |
| `moderate` | 30-55% | Consult neurologist |
| `high` | 55-75% | Urgent neurologist visit |
| `very_high` | > 75% | Immediate evaluation |

---

## 📊 Features Analyzed (MDVP Biomarkers)

| Feature | Description |
|---------|-------------|
| MDVP:Fo(Hz) | Average vocal fundamental frequency |
| MDVP:Jitter(%) | Frequency variation (cycle-to-cycle) |
| MDVP:Shimmer | Amplitude variation |
| NHR | Noise-to-Harmonics Ratio |
| HNR | Harmonics-to-Noise Ratio |
| RPDE | Recurrence Period Density Entropy |
| DFA | Detrended Fluctuation Analysis |
| PPE | Pitch Period Entropy |
| D2 | Correlation Dimension |
| MFCCs | Mel-Frequency Cepstral Coefficients (13) |

---

## 👤 User Roles

| Role | Access |
|------|--------|
| `patient` | Own data only |
| `doctor` | Patient data (read) |
| `caregiver` | Assigned patient |
| `admin` | Full system access |

---

## 🐳 Docker Deployment

```bash
# Development
docker-compose up

# Production (with Nginx)
docker-compose --profile production up -d
```

---

## 🧪 Running Tests

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx aiosqlite

# Run tests
pytest tests/ -v
```

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | (required) | JWT signing key |
| `DATABASE_URL` | SQLite | Database connection string |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | 30 | Token expiry |
| `MAX_AUDIO_FILE_SIZE_MB` | 50 | Upload size limit |
| `MODEL_PATH` | app/ml/models/parkinson_model.pkl | ML model path |

---

## 📚 API Documentation

- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc
- **OpenAPI JSON**: http://localhost:8000/api/openapi.json

---

## 🔬 ML Model

The system uses a **Random Forest classifier** trained on MDVP biomarkers from the [UCI Parkinson's Dataset](https://archive.ics.uci.edu/ml/datasets/parkinsons).

**Without a trained model**, the system uses a **rule-based heuristic** based on clinical thresholds from published literature.

Train your own model:
```bash
python app/ml/train_model.py
```

---

*ParkinsonVoice — Empowering early detection through AI-powered voice analysis.*
