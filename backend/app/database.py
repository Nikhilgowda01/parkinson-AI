import sqlite3

DB_NAME = "parkinson_voice.db"

def get_connection():
    return sqlite3.connect(DB_NAME)


def create_table():
    conn = get_connection()
    cursor = conn.cursor()

    # Patients table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        age INTEGER,
        gender TEXT,
        phone TEXT,
        email TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Predictions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER,
        filename TEXT,
        prediction TEXT,
        healthy_probability REAL,
        parkinson_probability REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(patient_id) REFERENCES patients(id)
    )
    """)

    conn.commit()
    conn.close()


def save_patient(
    name,
    age,
    gender,
    phone,
    email
):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO patients (
        name,
        age,
        gender,
        phone,
        email
    )
    VALUES (?, ?, ?, ?, ?)
    """, (
        name,
        age,
        gender,
        phone,
        email
    ))

    patient_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return patient_id


def save_prediction(
    patient_id,
    filename,
    prediction,
    healthy_probability,
    parkinson_probability
):
    print("Saving prediction to database...")

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO predictions (
        patient_id,
        filename,
        prediction,
        healthy_probability,
        parkinson_probability
    )
    VALUES (?, ?, ?, ?, ?)
    """, (
        patient_id,
        filename,
        prediction,
        healthy_probability,
        parkinson_probability
    ))

    conn.commit()
    print("Saved successfully")

    conn.close()