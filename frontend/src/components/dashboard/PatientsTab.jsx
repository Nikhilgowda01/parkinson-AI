import { useState } from 'react'
import { ClipboardPlus, Pencil, Trash2, UserRound, UsersRound } from 'lucide-react'
import { useVoiceApp } from '../../context/VoiceAppContext'
import SessionAudioButton from '../common/SessionAudioButton'
import { getParkinsonPredictionLabel } from '../../utils/predictionLabels'

const emptyPatient = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  phone: '',
  email: '',
  address: '',
  emergencyContact: '',
  emergencyPhone: '',
  diagnosis: '',
  diagnosisDate: '',
  symptomOnset: '',
  allergies: '',
  medicalHistory: '',
  medications: '',
  clinician: '',
  notes: '',
  audioConsent: false
}

export default function PatientsTab() {
  const {
    patients,
    activePatientId,
    addPatient,
    updatePatient,
    deletePatient,
    setActivePatientId,
    setCurrentSession,
    setActiveTab,
    sessions,
    accountId
  } = useVoiceApp()
  const selectedPatient = patients.find((patient) => patient.id === activePatientId)
  const [form, setForm] = useState(emptyPatient)
  const [editingId, setEditingId] = useState('')

  const changeField = (event) => {
    const { name, value, checked, type } = event.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const resetForm = () => {
    setForm(emptyPatient)
    setEditingId('')
  }

  const savePatient = (event) => {
    event.preventDefault()
    if (editingId) {
      updatePatient(editingId, form)
    } else {
      addPatient(form)
    }
    resetForm()
  }

  const editPatient = (patient) => {
    setForm({ ...emptyPatient, ...patient })
    setEditingId(patient.id)
    setActivePatientId(patient.id)
  }

  const field = (label, name, type = 'text', required = false) => (
    <label className="patient-field" key={name}>
      <span>{label}{required ? ' *' : ''}</span>
      <input name={name} type={type} value={form[name]} onChange={changeField} required={required} />
    </label>
  )

  return (
    <div className="patients-page animate-fade-in">
      <header className="patients-heading">
        <div>
          <p className="eyebrow neon-badge neon-badge-cyan">PATIENT WORKSPACE</p>
          <h1>Patient Records</h1>
          <p>Register a patient, select their record, and link new voice samples to them.</p>
        </div>
        <div className="patient-count"><UsersRound size={18} /> {patients.length} records</div>
      </header>

      <aside className="patient-privacy-note">
        This prototype saves patient details in this browser only. It has no secure server, access controls, or clinical-record safeguards. Do not enter real patient-identifiable or health information.
      </aside>

      <div className="patient-layout">
        <form className="patient-form glass-panel" onSubmit={savePatient}>
          <div className="patient-section-heading">
            <ClipboardPlus size={20} />
            <div><h2>{editingId ? 'Edit patient' : 'Register patient'}</h2><p>Fields marked * are required.</p></div>
          </div>

          <div className="patient-form-grid">
            {field('First name', 'firstName', 'text', true)}
            {field('Last name', 'lastName', 'text', true)}
            {field('Date of birth', 'dateOfBirth', 'date', true)}
            <label className="patient-field"><span>Gender</span><select name="gender" value={form.gender} onChange={changeField}><option value="">Select</option><option>Female</option><option>Male</option><option>Non-binary</option><option>Prefer not to say</option></select></label>
            {field('Phone', 'phone', 'tel')}
            {field('Email', 'email', 'email')}
            <label className="patient-field patient-field-wide"><span>Address</span><input name="address" value={form.address} onChange={changeField} /></label>
            {field('Emergency contact name', 'emergencyContact')}
            {field('Emergency contact phone', 'emergencyPhone', 'tel')}
            <label className="patient-field"><span>Diagnosis / status</span><select name="diagnosis" value={form.diagnosis} onChange={changeField}><option value="">Select</option><option>Not provided</option><option>Parkinson's disease</option><option>Under evaluation</option><option>Other</option></select></label>
            {field('Diagnosis date', 'diagnosisDate', 'date')}
            {field('Symptom onset (if known)', 'symptomOnset', 'date')}
            {field('Clinician / care team', 'clinician')}
            <label className="patient-field patient-field-wide"><span>Allergies</span><textarea name="allergies" rows="2" value={form.allergies} onChange={changeField} /></label>
            <label className="patient-field patient-field-wide"><span>Relevant medical history</span><textarea name="medicalHistory" rows="3" value={form.medicalHistory} onChange={changeField} /></label>
            <label className="patient-field patient-field-wide"><span>Medications</span><textarea name="medications" rows="2" value={form.medications} onChange={changeField} /></label>
            <label className="patient-field patient-field-wide"><span>Notes</span><textarea name="notes" rows="3" value={form.notes} onChange={changeField} /></label>
          </div>

          <label className="patient-consent"><input name="audioConsent" type="checkbox" checked={form.audioConsent} onChange={changeField} required /> Patient has consented to voice recording and audio analysis.</label>
          <div className="patient-form-actions">
            <button type="submit" className="btn-cyber-primary">{editingId ? 'Save changes' : 'Register patient'}</button>
            {editingId && <button type="button" className="btn-glass" onClick={resetForm}>Cancel</button>}
          </div>
        </form>

        <section className="patient-list glass-panel">
          <div className="patient-section-heading"><UserRound size={20} /><div><h2>Patient list</h2><p>Select a patient before recording or uploading audio.</p></div></div>
          {patients.length === 0 ? <p className="patient-empty">No patients registered yet.</p> : (
            <div className="patient-list-items">
              {patients.map((patient) => (
                <article key={patient.id} className={`patient-list-item ${activePatientId === patient.id ? 'is-selected' : ''}`}>
                  <button type="button" className="patient-select" onClick={() => setActivePatientId(patient.id)}>
                    <span className="patient-avatar">{patient.firstName[0]}{patient.lastName[0]}</span>
                    <span className="patient-name-block"><b>{patient.firstName} {patient.lastName}</b><small>{patient.diagnosis || 'Diagnosis not provided'} · {sessions.filter((session) => session.patientId === patient.id).length} sessions</small></span>
                    {activePatientId === patient.id && <span className="selected-label">ACTIVE</span>}
                  </button>
                  <div className="patient-row-actions">
                    <button type="button" title="Edit patient" onClick={() => editPatient(patient)}><Pencil size={15} /></button>
                    <button type="button" title="Delete patient" onClick={() => { if (window.confirm(`Delete ${patient.firstName} ${patient.lastName} and their linked sessions?`)) deletePatient(patient.id) }}><Trash2 size={15} /></button>
                  </div>
                </article>
              ))}
            </div>
          )}
          {selectedPatient && (
            <div className="patient-profile-details">
              <div className="patient-profile-heading"><span className="patient-avatar">{selectedPatient.firstName[0]}{selectedPatient.lastName[0]}</span><div><b>{selectedPatient.firstName} {selectedPatient.lastName}</b><small>Patient profile</small></div></div>
              <dl className="patient-detail-grid">
                <div><dt>Date of birth</dt><dd>{selectedPatient.dateOfBirth || 'Not provided'}</dd></div>
                <div><dt>Gender</dt><dd>{selectedPatient.gender || 'Not provided'}</dd></div>
                <div><dt>Phone</dt><dd>{selectedPatient.phone || 'Not provided'}</dd></div>
                <div><dt>Email</dt><dd>{selectedPatient.email || 'Not provided'}</dd></div>
                <div><dt>Address</dt><dd>{selectedPatient.address || 'Not provided'}</dd></div>
                <div><dt>Emergency contact</dt><dd>{[selectedPatient.emergencyContact, selectedPatient.emergencyPhone].filter(Boolean).join(' · ') || 'Not provided'}</dd></div>
                <div><dt>Diagnosis / status</dt><dd>{selectedPatient.diagnosis || 'Not provided'}</dd></div>
                <div><dt>Diagnosis date</dt><dd>{selectedPatient.diagnosisDate || 'Not provided'}</dd></div>
                <div><dt>Symptom onset</dt><dd>{selectedPatient.symptomOnset || 'Not provided'}</dd></div>
                <div><dt>Clinician</dt><dd>{selectedPatient.clinician || 'Not provided'}</dd></div>
                <div className="patient-detail-wide"><dt>Allergies</dt><dd>{selectedPatient.allergies || 'Not provided'}</dd></div>
                <div className="patient-detail-wide"><dt>Medical history</dt><dd>{selectedPatient.medicalHistory || 'Not provided'}</dd></div>
                <div className="patient-detail-wide"><dt>Medications</dt><dd>{selectedPatient.medications || 'Not provided'}</dd></div>
                <div className="patient-detail-wide"><dt>Notes</dt><dd>{selectedPatient.notes || 'Not provided'}</dd></div>
              </dl>

              <div className="patient-voice-history">
                <h3>Voice history and results</h3>
                {sessions.filter((session) => session.patientId === selectedPatient.id).length === 0 ? (
                  <p>No voice sessions recorded for this patient.</p>
                ) : sessions.filter((session) => session.patientId === selectedPatient.id).map((session) => (
                  <div className="patient-voice-session" key={session.id}>
                    <button
                      className="patient-session-select"
                      type="button"
                      onClick={() => { setActivePatientId(selectedPatient.id); setCurrentSession(session); setActiveTab('Overview') }}
                    >
                      <span><b>{session.title}</b><small>{session.date} · {session.category} · {session.duration}</small></span>
                      <span className="patient-session-result">
                        <b>{getParkinsonPredictionLabel(session.prediction)}</b>
                        <small>
                          Parkinson's disease model score for this voice sample:{" "}
                          {Number(
                            session.parkinsonProbability ?? session.riskScore ?? 0
                          ).toFixed(1)}%
                        </small>
                      </span>
                      <small>Clarity {session.clarityScore ?? 0}/100</small>
                      {session.metrics?.hnr != null && (
                        <small>
                          Jitter {((session.metrics.jitter || 0) * 100).toFixed(2)}% · Shimmer {((session.metrics.shimmer || 0) * 100).toFixed(2)}% · HNR {Number(session.metrics.hnr || 0).toFixed(1)} dB
                        </small>
                      )}
                    </button>
                    <SessionAudioButton session={session} accountId={accountId} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      <style>{`
        .patients-page { display: flex; flex-direction: column; gap: 20px; }
        .patients-heading { display: flex; justify-content: space-between; align-items: center; gap: 20px; }
        .patients-heading h1 { color: #fff; font-size: 1.8rem; margin: 8px 0 4px; }
        .patients-heading p:not(.eyebrow) { color: var(--text-muted); font-size: .9rem; }
        .patient-count { display: flex; align-items: center; gap: 8px; color: var(--neon-cyan); font-weight: 700; }
        .patient-privacy-note { padding: 13px 16px; border-left: 3px solid var(--neon-amber); background: rgba(255,183,3,.08); color: #f3d68b; font-size: .85rem; line-height: 1.5; }
        .patient-layout { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(300px, .85fr); align-items: start; gap: 18px; }
        .patient-form, .patient-list { padding: 22px; }
        .patient-section-heading { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; color: var(--neon-cyan); }
        .patient-section-heading h2 { color: #fff; font-size: 1.1rem; }
        .patient-section-heading p { color: var(--text-muted); font-size: .78rem; margin-top: 3px; }
        .patient-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
        .patient-field { display: flex; flex-direction: column; gap: 6px; color: var(--text-muted); font-size: .8rem; font-weight: 600; }
        .patient-field-wide { grid-column: 1 / -1; }
        .patient-field input, .patient-field select, .patient-field textarea { width: 100%; min-width: 0; border: 1px solid rgba(255,255,255,.14); border-radius: 7px; background: rgba(5,8,18,.72); color: #fff; padding: 10px 11px; font: inherit; }
        .patient-field select option { background: #101525; }
        .patient-field textarea { resize: vertical; }
        .patient-consent { display: flex; gap: 10px; align-items: flex-start; color: var(--text-muted); font-size: .82rem; margin-top: 18px; line-height: 1.45; }
        .patient-consent input { accent-color: var(--neon-cyan); margin-top: 3px; }
        .patient-form-actions { display: flex; align-items: center; gap: 10px; margin-top: 18px; }
        .patient-form-actions .btn-cyber-primary, .patient-form-actions .btn-glass { min-height: 42px; }
        .patient-empty { color: var(--text-muted); font-size: .88rem; padding: 18px 0; }
        .patient-list-items { display: flex; flex-direction: column; gap: 8px; }
        .patient-list-item { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 10px; border: 1px solid rgba(255,255,255,.1); border-radius: 8px; }
        .patient-list-item.is-selected { border-color: var(--neon-cyan); background: rgba(0,242,254,.07); }
        .patient-select { display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1; border: 0; padding: 0; background: none; color: inherit; text-align: left; cursor: pointer; }
        .patient-avatar { display: grid; place-items: center; flex: 0 0 36px; height: 36px; border-radius: 50%; background: rgba(0,242,254,.12); color: var(--neon-cyan); font-weight: 800; font-size: .75rem; }
        .patient-name-block { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
        .patient-name-block b { color: #fff; font-size: .84rem; }
        .patient-name-block small, .active-patient-summary small { color: var(--text-muted); font-size: .72rem; overflow-wrap: anywhere; }
        .selected-label { color: var(--neon-cyan); font-size: .65rem; font-weight: 800; }
        .patient-row-actions { display: flex; gap: 4px; }
        .patient-row-actions button { display: grid; place-items: center; width: 32px; height: 32px; border: 0; border-radius: 6px; color: var(--text-muted); background: transparent; cursor: pointer; }
        .patient-row-actions button:hover { color: #fff; background: rgba(255,255,255,.1); }
        .patient-profile-details { border-top: 1px solid rgba(255,255,255,.1); margin-top: 16px; padding-top: 16px; }
        .patient-profile-heading { display: flex; align-items: center; gap: 10px; color: #fff; font-size: .9rem; }
        .patient-profile-heading > div { display: flex; flex-direction: column; gap: 3px; }
        .patient-profile-heading small { color: var(--text-muted); font-size: .72rem; }
        .patient-detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 16px; }
        .patient-detail-grid > div { min-width: 0; }
        .patient-detail-grid .patient-detail-wide { grid-column: 1 / -1; }
        .patient-detail-grid dt { color: var(--text-muted); font-size: .69rem; margin-bottom: 3px; }
        .patient-detail-grid dd { color: #e5ebef; font-size: .78rem; overflow-wrap: anywhere; line-height: 1.4; }
        .patient-voice-history { border-top: 1px solid rgba(255,255,255,.1); margin-top: 18px; padding-top: 16px; }
        .patient-voice-history h3 { color: #fff; font-size: .95rem; margin-bottom: 10px; }
        .patient-voice-history > p { color: var(--text-muted); font-size: .78rem; }
        .patient-voice-session { width: 100%; display: flex; align-items: center; gap: 12px; padding: 11px; margin-top: 8px; border: 1px solid rgba(255,255,255,.1); border-radius: 7px; background: rgba(255,255,255,.025); color: var(--text-muted); text-align: left; }
        .patient-voice-session:hover { border-color: var(--neon-cyan); background: rgba(0,242,254,.06); }
        .patient-session-select { min-width: 0; flex: 1; display: flex; flex-direction: column; align-items: flex-start; gap: 5px; padding: 0; border: 0; background: transparent; color: inherit; text-align: left; cursor: pointer; }
        .patient-session-select > span:first-child { display: flex; flex-direction: column; gap: 3px; }
        .patient-voice-session b { color: #fff; font-size: .8rem; }
        .patient-voice-session small { font-size: .69rem; }
        .patient-voice-session .patient-session-result { display: flex; gap: 8px; align-items: center; }
        .patient-voice-session .patient-session-result b { color: var(--neon-cyan); }
        @media (max-width: 900px) { .patient-layout { grid-template-columns: 1fr; } }
        @media (max-width: 520px) { .patients-heading { align-items: flex-start; flex-direction: column; } .patient-form-grid { grid-template-columns: 1fr; } .patient-field-wide { grid-column: auto; } .patient-form, .patient-list { padding: 16px; } }
      `}</style>
    </div>
  )
}