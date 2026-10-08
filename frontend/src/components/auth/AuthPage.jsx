import { useState } from 'react'
import { Activity, ArrowRight, AudioLines, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { useVoiceApp } from '../../context/VoiceAppContext'

export default function AuthPage() {
  const { signIn, signUp } = useVoiceApp()
  const [mode, setMode] = useState('signin')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const isSignUp = mode === 'signup'

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (isSignUp) await signUp(form)
      else await signIn(form)
    } catch (authError) {
      setError(authError.message || 'Could not sign in. Check the details and try again.')
    } finally {
      setBusy(false)
    }
  }

  const changeMode = (nextMode) => {
    setMode(nextMode)
    setError('')
  }

  return (
    <main className="auth-page">
      <section className="auth-intro">
        <a className="auth-brand" href="#home" aria-label="ParkinsonVoice home">
          <span className="auth-brand-icon"><AudioLines size={22} /></span>
          <span>PARKINSON<span>VOICE</span></span>
        </a>
        <div className="auth-intro-copy">
          <p className="auth-kicker"><Activity size={15} /> VOICE MONITORING WORKSPACE</p>
          <h1>Keep every voice session in context.</h1>
          <p>Organize patient profiles, capture voice samples, and review session measurements synchronized in real time with Firebase Cloud Firestore.</p>
        </div>
        <div className="auth-disclaimer">
          <b>Firebase Cloud Database</b>
          <p>Connected to Firestore database (<code>parkinson-s-96f47</code>). Patient records and voice acoustic assessments synchronize live to the cloud.</p>
        </div>
      </section>

      <section className="auth-panel-wrap">
        <div className="auth-panel">
          <div className="auth-heading">
            <p className="auth-kicker">YOUR WORKSPACE</p>
            <h2>{isSignUp ? 'Create your account' : 'Welcome back'}</h2>
            <p>{isSignUp ? 'Register to start your cloud-synced clinical workspace.' : 'Sign in to your Firebase-connected workspace.'}</p>
          </div>

          <div className="auth-mode-switch" role="tablist" aria-label="Account access">
            <button type="button" role="tab" aria-selected={!isSignUp} className={!isSignUp ? 'active' : ''} onClick={() => changeMode('signin')}>Sign in</button>
            <button type="button" role="tab" aria-selected={isSignUp} className={isSignUp ? 'active' : ''} onClick={() => changeMode('signup')}>Sign up</button>
          </div>

          <form className="auth-form" onSubmit={submit}>
            {isSignUp && (
              <label className="auth-field">
                <span>Full name</span>
                <span className="auth-input-wrap"><UserRound size={17} /><input autoComplete="name" required minLength="2" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Your name" /></span>
              </label>
            )}
            <label className="auth-field">
              <span>Email</span>
              <span className="auth-input-wrap"><Mail size={17} /><input autoComplete="email" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" /></span>
            </label>
            <label className="auth-field">
              <span>Password</span>
              <span className="auth-input-wrap"><LockKeyhole size={17} /><input autoComplete={isSignUp ? 'new-password' : 'current-password'} type="password" required minLength={isSignUp ? 8 : undefined} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder={isSignUp ? 'At least 8 characters' : 'Enter your password'} /></span>
            </label>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="auth-submit" type="submit" disabled={busy}>
              {busy ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
              {!busy && <ArrowRight size={17} />}
            </button>
          </form>
          <p className="auth-security-note">Connected to Firebase Firestore (<code>parkinson-s-96f47</code>). Real-time database sync is active with multi-user isolation.</p>
        </div>
      </section>

      <style>{`
        .auth-page { min-height: 100vh; display: grid; grid-template-columns: minmax(0, 1fr) minmax(420px, .8fr); background: #080c13; color: #f5f8fb; position: relative; overflow: hidden; }
        .auth-page::before { content: ''; position: absolute; inset: 0; pointer-events: none; opacity: .25; background-image: linear-gradient(rgba(137,190,188,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(137,190,188,.08) 1px, transparent 1px); background-size: 44px 44px; mask-image: linear-gradient(90deg, #000, transparent 74%); }
        .auth-intro { min-height: 100vh; position: relative; z-index: 1; display: flex; flex-direction: column; justify-content: space-between; padding: clamp(28px, 6vw, 76px); border-right: 1px solid rgba(255,255,255,.1); background: radial-gradient(ellipse at 12% 82%, rgba(21,135,133,.22), transparent 48%), #0a1017; }
        .auth-brand { display: inline-flex; align-items: center; gap: 12px; color: #fff; text-decoration: none; width: fit-content; font-size: .92rem; font-weight: 900; letter-spacing: .04em; }
        .auth-brand > span:last-child > span { color: #5ed2c3; }
        .auth-brand-icon { display: grid; place-items: center; width: 42px; height: 42px; border: 1px solid rgba(94,210,195,.55); border-radius: 10px; color: #5ed2c3; background: rgba(94,210,195,.1); }
        .auth-intro-copy { max-width: 620px; padding: 50px 0; animation: auth-enter .5s ease both; }
        .auth-kicker { color: #69d8c5; font-size: .72rem; font-weight: 800; letter-spacing: .12em; display: flex; align-items: center; gap: 8px; }
        .auth-intro-copy h1 { max-width: 570px; margin: 22px 0 16px; font-size: clamp(2.5rem, 5vw, 4.5rem); line-height: 1.04; color: #fff; }
        .auth-intro-copy > p:last-child { max-width: 490px; font-size: 1.02rem; line-height: 1.7; color: #a8b7c2; }
        .auth-disclaimer { max-width: 490px; border-left: 2px solid #e0a947; padding: 4px 0 4px 14px; color: #e8bd70; font-size: .82rem; }
        .auth-disclaimer p { color: #aab5bb; line-height: 1.55; margin-top: 5px; }
        .auth-panel-wrap { position: relative; z-index: 1; display: grid; place-items: center; padding: 34px; }
        .auth-panel { width: min(100%, 440px); animation: auth-enter .55s .08s ease both; }
        .auth-heading h2 { margin: 12px 0 6px; font-size: 1.8rem; color: #fff; }
        .auth-heading > p:last-child { color: #9caab5; font-size: .9rem; }
        .auth-mode-switch { display: grid; grid-template-columns: 1fr 1fr; margin: 26px 0 22px; border-bottom: 1px solid rgba(255,255,255,.14); }
        .auth-mode-switch button { padding: 12px; border: 0; border-bottom: 2px solid transparent; background: none; color: #98a8b4; font: inherit; font-size: .88rem; font-weight: 700; cursor: pointer; }
        .auth-mode-switch button.active { color: #70dfcd; border-color: #70dfcd; }
        .auth-form { display: flex; flex-direction: column; gap: 16px; }
        .auth-field { display: flex; flex-direction: column; gap: 7px; color: #d4dce2; font-size: .82rem; font-weight: 650; }
        .auth-input-wrap { display: flex; align-items: center; gap: 10px; height: 48px; padding: 0 13px; border: 1px solid rgba(255,255,255,.15); border-radius: 7px; background: rgba(255,255,255,.035); color: #7f939f; }
        .auth-input-wrap:focus-within { border-color: #68d5c4; box-shadow: 0 0 0 3px rgba(104,213,196,.1); }
        .auth-input-wrap input { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; color: #fff; font: inherit; }
        .auth-input-wrap input::placeholder { color: #657680; }
        .auth-submit { min-height: 48px; margin-top: 7px; border: 0; border-radius: 7px; display: flex; align-items: center; justify-content: center; gap: 10px; background: #69d8c5; color: #08211e; font: inherit; font-size: .88rem; font-weight: 850; cursor: pointer; }
        .auth-submit:disabled { opacity: .6; cursor: wait; }
        .auth-error { padding: 10px 12px; border-left: 2px solid #e77878; background: rgba(231,120,120,.08); color: #ffb1a8; font-size: .82rem; }
        .auth-security-note { margin-top: 18px; color: #87959e; font-size: .73rem; line-height: 1.55; }
        @keyframes auth-enter { from { opacity: 0; transform: translateY(9px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 820px) { .auth-page { grid-template-columns: 1fr; } .auth-intro { min-height: auto; padding: 25px 24px 20px; border-right: 0; border-bottom: 1px solid rgba(255,255,255,.1); } .auth-intro-copy { padding: 35px 0 20px; } .auth-intro-copy h1 { font-size: 2.3rem; } .auth-intro-copy > p:last-child { font-size: .9rem; } .auth-disclaimer { margin-top: 14px; } .auth-panel-wrap { padding: 34px 24px 54px; } }
      `}</style>
    </main>
  )
}