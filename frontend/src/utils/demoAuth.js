const ACCOUNTS_KEY = 'parkinsonvoice-demo-accounts'
const SESSION_KEY = 'parkinsonvoice-demo-session'
const WORKSPACE_KEY_PREFIX = 'parkinsonvoice-demo-workspace:'
const PASSWORD_ITERATIONS = 210000

function readAccounts() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) || []
  } catch {
    return []
  }
}

function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function derivePasswordHash(password, salt) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits({
    name: 'PBKDF2',
    salt,
    iterations: PASSWORD_ITERATIONS,
    hash: 'SHA-256'
  }, keyMaterial, 256)
  return bytesToHex(new Uint8Array(bits))
}

export async function createDemoAccount({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase()
  const accounts = readAccounts()
  if (accounts.some((account) => account.email === normalizedEmail)) {
    throw new Error('An account with this email already exists in this browser.')
  }

  const salt = crypto.getRandomValues(new Uint8Array(16))
  const account = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    salt: bytesToHex(salt),
    passwordHash: await derivePasswordHash(password, salt)
  }
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, account]))
  return { id: account.id, name: account.name, email: account.email }
}

export async function authenticateDemoAccount({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase()
  const account = readAccounts().find((entry) => entry.email === normalizedEmail)
  if (!account) throw new Error('Email or password is incorrect.')

  const salt = Uint8Array.from(account.salt.match(/.{2}/g), (byte) => parseInt(byte, 16))
  const passwordHash = await derivePasswordHash(password, salt)
  if (passwordHash !== account.passwordHash) throw new Error('Email or password is incorrect.')
  return { id: account.id, name: account.name, email: account.email }
}

export function getDemoSession() {
  try {
    const session = JSON.parse(sessionStorage.getItem(SESSION_KEY))
    const account = readAccounts().find((entry) => entry.id === session?.id)
    return account ? { id: account.id, name: account.name, email: account.email } : null
  } catch {
    return null
  }
}

export function setDemoSession(account) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(account))
}

export function clearDemoSession() {
  sessionStorage.removeItem(SESSION_KEY)
}

// TEMPORARY verification hook — remove before delivery.
import { DEV_PATIENTS, DEV_SESSIONS } from '../data/devVerificationSeed'

export function loadDemoWorkspace(accountId) {
  if (!accountId) return { patients: [], activePatientId: '', sessions: [], currentSessionId: '' }
  try {
    const stored = localStorage.getItem(`${WORKSPACE_KEY_PREFIX}${accountId}`)
    const cached = stored ? JSON.parse(stored) : null
    const cachedSessionCount = Array.isArray(cached?.sessions) ? cached.sessions.length : 0
    if (!cached || cachedSessionCount === 0) {
      return {
        patients: DEV_PATIENTS,
        activePatientId: DEV_PATIENTS[0].id,
        sessions: DEV_SESSIONS,
        currentSessionId: DEV_SESSIONS[0].id
      }
    }
    const workspace = cached
    return {
      patients: Array.isArray(workspace?.patients) ? workspace.patients : [],
      activePatientId: workspace?.activePatientId || '',
      sessions: Array.isArray(workspace?.sessions) ? workspace.sessions : [],
      currentSessionId: workspace?.currentSessionId || ''
    }
  } catch {
    return { patients: [], activePatientId: '', sessions: [], currentSessionId: '' }
  }
}

export function saveDemoWorkspace(accountId, workspace) {
  if (!accountId) return
  const serializableWorkspace = {
    ...workspace,
    sessions: workspace.sessions.map((session) => ({
      ...session,
      hasAudio: Boolean(session.hasAudio || session.audioUrl),
      audioUrl: ''
    }))
  }
  localStorage.setItem(`${WORKSPACE_KEY_PREFIX}${accountId}`, JSON.stringify(serializableWorkspace))
}
