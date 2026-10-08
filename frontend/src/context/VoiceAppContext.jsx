import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import {
  authenticateDemoAccount,
  clearDemoSession,
  createDemoAccount,
  getDemoSession,
  loadDemoWorkspace,
  saveDemoWorkspace,
  setDemoSession
} from '../utils/demoAuth'
import { auth, db } from '../firebase'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import {
  savePatientToFirestore,
  deletePatientFromFirestore,
  subscribeToPatients,
  saveSessionToFirestore,
  deleteSessionFromFirestore,
  subscribeToSessions,
  saveUserProfileToFirestore,
  getUserProfileFromFirestore,
  testFirestoreConnection
} from '../services/firestoreService'

const VoiceAppContext = createContext(null)

export function VoiceAppProvider({ children }) {
  const [activeTab, setActiveTab] = useState('Overview')
  const [authUser, setAuthUser] = useState(() => getDemoSession())
  const [workspace, setWorkspace] = useState(() => loadDemoWorkspace(getDemoSession()?.id))
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState(null)
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showDisclaimer, setShowDisclaimer] = useState(true)
  const [activeMetricModal, setActiveMetricModal] = useState(null)
  const [firestoreStatus, setFirestoreStatus] = useState({
    connected: false,
    checked: false,
    message: 'Initializing Firebase Firestore...'
  })

  const [userProfile, setUserProfile] = useState(() => ({
    name: authUser?.name || 'Medical Specialist',
    role: authUser?.isFirebase ? 'Firebase Cloud Account' : 'Clinical Workspace',
    avatar: authUser?.name?.split(/\s+/).map((part) => part[0]).join('').toUpperCase() || 'PV',
    plan: authUser?.isFirebase ? 'Cloud Database (Firestore)' : 'Local Demo',
    voiceBaseline: 'Standard Phonation'
  }))

  const unsubscribePatientsRef = useRef(null)
  const unsubscribeSessionsRef = useRef(null)

  // Test Firestore Connection on startup
  useEffect(() => {
    let isMounted = true
    testFirestoreConnection().then((res) => {
      if (isMounted) {
        setFirestoreStatus({
          connected: res.success,
          checked: true,
          message: res.success ? 'Connected to Firebase Firestore' : res.message
        })
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const account = {
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email.split('@')[0],
          email: fbUser.email,
          isFirebase: true
        }
        setDemoSession(account)
        setAuthUser(account)

        // Fetch cloud user profile if available
        try {
          const cloudProfile = await getUserProfileFromFirestore(fbUser.uid)
          if (cloudProfile?.name) {
            setUserProfile((prev) => ({
              ...prev,
              name: cloudProfile.name,
              avatar: cloudProfile.name.split(/\s+/).map((part) => part[0]).join('').toUpperCase(),
              plan: 'Cloud Database (Firestore)'
            }))
          } else {
            setUserProfile((prev) => ({
              ...prev,
              name: account.name,
              avatar: account.name.split(/\s+/).map((part) => part[0]).join('').toUpperCase(),
              plan: 'Cloud Database (Firestore)'
            }))
          }
        } catch {
          // Ignore profile error
        }
      }
    })

    return () => unsubscribeAuth()
  }, [])

  // Subscribe to Firestore collections (Patients & Sessions) whenever authUser is set
  useEffect(() => {
    if (!authUser?.id) {
      if (unsubscribePatientsRef.current) unsubscribePatientsRef.current()
      if (unsubscribeSessionsRef.current) unsubscribeSessionsRef.current()
      return
    }

    const currentUserId = authUser.id

    // Real-time listener for Patients from Firestore
    unsubscribePatientsRef.current = subscribeToPatients(
      currentUserId,
      (cloudPatients) => {
        if (cloudPatients && cloudPatients.length > 0) {
          setWorkspace((prev) => {
            // Keep existing active patient if still in list, else pick first
            const hasActive = cloudPatients.some((p) => p.id === prev.activePatientId)
            return {
              ...prev,
              patients: cloudPatients,
              activePatientId: hasActive ? prev.activePatientId : cloudPatients[0].id
            }
          })
        }
      },
      (error) => {
        console.warn('Real-time patients sync fallback to local cache:', error.message)
      }
    )

    // Real-time listener for Sessions from Firestore
    unsubscribeSessionsRef.current = subscribeToSessions(
      currentUserId,
      (cloudSessions) => {
        if (cloudSessions && cloudSessions.length > 0) {
          setWorkspace((prev) => {
            const hasCurrent = cloudSessions.some((s) => s.id === prev.currentSessionId)
            return {
              ...prev,
              sessions: cloudSessions,
              currentSessionId: hasCurrent ? prev.currentSessionId : cloudSessions[0]?.id || ''
            }
          })
        }
      },
      (error) => {
        console.warn('Real-time sessions sync fallback to local cache:', error.message)
      }
    )

    return () => {
      if (unsubscribePatientsRef.current) unsubscribePatientsRef.current()
      if (unsubscribeSessionsRef.current) unsubscribeSessionsRef.current()
    }
  }, [authUser?.id])

  // Save local cache backup for offline resilience
  useEffect(() => {
    try {
      if (authUser) saveDemoWorkspace(authUser.id, workspace)
    } catch (error) {
      console.warn('Workspace local cache error:', error)
    }
  }, [authUser, workspace])

  const beginDemoSession = (account) => {
    setDemoSession(account)
    setAuthUser(account)
    setWorkspace(loadDemoWorkspace(account.id))
    setUserProfile({
      name: account.name,
      role: account.isFirebase ? 'Firebase Cloud Account' : 'Clinical Specialist',
      avatar: account.name.split(/\s+/).map((part) => part[0]).join('').toUpperCase(),
      plan: account.isFirebase ? 'Cloud Database (Firestore)' : 'Local Demo',
      voiceBaseline: 'Standard Phonation'
    })
    setActiveTab('Overview')
  }

  const signIn = async (credentials) => {
    const { email, password } = credentials
    try {
      // 1. Try Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const fbUser = userCredential.user
      const account = {
        id: fbUser.uid,
        name: fbUser.displayName || email.split('@')[0],
        email: fbUser.email,
        isFirebase: true
      }
      beginDemoSession(account)
      return account
    } catch (fbError) {
      console.warn('Firebase Auth signIn message:', fbError.code || fbError.message)
      // 2. Fallback to local demo account if Firebase Auth failed (e.g. offline or console provider disabled)
      try {
        const demoAccount = await authenticateDemoAccount(credentials)
        beginDemoSession(demoAccount)
        return demoAccount
      } catch (demoError) {
        if (
          fbError.code === 'auth/invalid-credential' ||
          fbError.code === 'auth/wrong-password' ||
          fbError.code === 'auth/user-not-found'
        ) {
          throw new Error('Invalid email or password.')
        } else if (fbError.code === 'auth/too-many-requests') {
          throw new Error('Access temporarily disabled due to many failed login attempts.')
        }
        throw new Error(fbError.message || demoError.message)
      }
    }
  }

  const signUp = async (details) => {
    const { name, email, password } = details
    try {
      // 1. Try Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const fbUser = userCredential.user

      try {
        await updateProfile(fbUser, { displayName: name.trim() })
      } catch (e) {
        console.warn('Profile displayName update error:', e)
      }

      const account = {
        id: fbUser.uid,
        name: name.trim(),
        email: fbUser.email,
        isFirebase: true
      }

      // Persist profile in Firestore
      try {
        await saveUserProfileToFirestore(fbUser.uid, {
          name: name.trim(),
          email: fbUser.email,
          role: 'Clinical Specialist',
          plan: 'Cloud Database (Firestore)'
        })
      } catch (err) {
        console.warn('Could not save initial profile to Firestore:', err)
      }

      beginDemoSession(account)
      return account
    } catch (fbError) {
      console.warn('Firebase Auth signUp message:', fbError.code || fbError.message)
      if (
        fbError.code === 'auth/operation-not-allowed' ||
        fbError.code === 'auth/configuration-not-found' ||
        fbError.code === 'auth/network-request-failed'
      ) {
        // Smoothly fall back to demo account
        const demoAccount = await createDemoAccount(details)
        beginDemoSession(demoAccount)
        return demoAccount
      }
      if (fbError.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists.')
      } else if (fbError.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters.')
      } else if (fbError.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address.')
      }

      try {
        const demoAccount = await createDemoAccount(details)
        beginDemoSession(demoAccount)
        return demoAccount
      } catch {
        throw new Error(fbError.message)
      }
    }
  }

  const signOut = async () => {
    try {
      await fbSignOut(auth)
    } catch (err) {
      console.warn('Firebase signout error:', err)
    }
    clearDemoSession()
    setAuthUser(null)
    setWorkspace(loadDemoWorkspace(''))
    setUserProfile({
      name: 'Medical Specialist',
      role: 'Clinical Workspace',
      avatar: 'PV',
      plan: 'Local Demo',
      voiceBaseline: 'Standard Phonation'
    })
    setActiveTab('Overview')
  }

  const sessions = workspace.sessions
  const currentSession = sessions.find((session) => session.id === workspace.currentSessionId) || null

  const setSessions = (update) => {
    setWorkspace((prev) => ({
      ...prev,
      sessions: typeof update === 'function' ? update(prev.sessions) : update
    }))
  }

  const setCurrentSession = (session) => {
    setWorkspace((prev) => {
      const nextSession =
        typeof session === 'function'
          ? session(prev.sessions.find((entry) => entry.id === prev.currentSessionId) || null)
          : session
      return { ...prev, currentSessionId: nextSession?.id || '' }
    })
  }

  // Add Patient (Optimistic + Cloud Firestore)
  const addPatient = async (patientData) => {
    const patient = {
      ...patientData,
      id: `patient-${Date.now()}`,
      createdAt: new Date().toISOString()
    }
    setWorkspace((prev) => ({
      ...prev,
      patients: [patient, ...prev.patients],
      activePatientId: patient.id,
      currentSessionId: ''
    }))

    if (authUser?.id) {
      try {
        await savePatientToFirestore(authUser.id, patient)
      } catch (err) {
        console.warn('Firestore addPatient warning:', err.message)
      }
    }
    return patient
  }

  // Update Patient (Optimistic + Cloud Firestore)
  const updatePatient = async (patientId, patientData) => {
    setWorkspace((prev) => ({
      ...prev,
      patients: prev.patients.map((patient) =>
        patient.id === patientId ? { ...patient, ...patientData } : patient
      )
    }))

    if (authUser?.id) {
      try {
        const fullPatient = workspace.patients.find((p) => p.id === patientId) || {}
        await savePatientToFirestore(authUser.id, { ...fullPatient, ...patientData, id: patientId })
      } catch (err) {
        console.warn('Firestore updatePatient warning:', err.message)
      }
    }
  }

  // Delete Patient (Optimistic + Cloud Firestore)
  const deletePatient = async (patientId) => {
    setWorkspace((prev) => ({
      patients: prev.patients.filter((patient) => patient.id !== patientId),
      activePatientId: prev.activePatientId === patientId ? '' : prev.activePatientId,
      sessions: prev.sessions.filter((session) => session.patientId !== patientId),
      currentSessionId:
        prev.sessions.find((session) => session.id === prev.currentSessionId)?.patientId === patientId
          ? ''
          : prev.currentSessionId
    }))

    try {
      await deletePatientFromFirestore(patientId)
    } catch (err) {
      console.warn('Firestore deletePatient warning:', err.message)
    }
  }

  const setActivePatientId = (patientId) => {
    setWorkspace((prev) => {
      const patientSession = prev.sessions.find((session) => session.patientId === patientId)
      return { ...prev, activePatientId: patientId, currentSessionId: patientSession?.id || '' }
    })
  }

  // Add Session (Optimistic + Cloud Firestore)
  const addSession = async (newSessionData) => {
    const sessionObj = {
      id: `session-${Date.now()}`,
      title: newSessionData.title || `Voice Test ${workspace.sessions.length + 1}`,
      category: newSessionData.category || 'Live Mic Recording',
      date: new Date().toLocaleString(),
      duration: newSessionData.duration || '01:30',
      audioUrl: newSessionData.audioUrl || '',
      hasAudio: Boolean(newSessionData.hasAudio || newSessionData.audioUrl),
      patientId: newSessionData.patientId || workspace.activePatientId,

      // Backend Prediction Fields
      prediction: newSessionData.prediction || 'Unknown',
      primaryName: newSessionData.primaryName || '',
      healthyProbability: Number(newSessionData.healthyProbability || 0),
      parkinsonProbability: Number(newSessionData.parkinsonProbability || 0),
      confidence: newSessionData.confidence || 'Low',
      diseaseScores: Array.isArray(newSessionData.diseaseScores) ? newSessionData.diseaseScores : [],

      // Scores
      clarityScore: Number(newSessionData.clarityScore || 0),
      riskLevel: newSessionData.riskLevel || (
        newSessionData.prediction === 'Parkinson'
          ? 'Parkinson-associated pattern detected'
          : newSessionData.prediction === 'Healthy'
          ? 'No Parkinson-associated pattern detected'
          : newSessionData.prediction === 'Uncertain'
          ? 'Inconclusive'
          : 'Unavailable'
      ),
      riskScore: Number(
        newSessionData.riskScore ?? newSessionData.parkinsonProbability ?? 0
      ),

      // Analysis Data
      metrics: newSessionData.metrics || {},
      mfcc: newSessionData.mfcc || [],
      topParkinsonism: newSessionData.topParkinsonism || null,
      topOther: newSessionData.topOther || null,
      analysisSummary: newSessionData.analysisSummary || 'AI voice analysis completed.'
    }

    setWorkspace((prev) => ({
      ...prev,
      sessions: [sessionObj, ...prev.sessions],
      currentSessionId: sessionObj.id
    }))

    if (authUser?.id) {
      try {
        await saveSessionToFirestore(authUser.id, sessionObj)
      } catch (err) {
        console.warn('Firestore addSession warning:', err.message)
      }
    }

    return sessionObj
  }

  // Delete Session (Optimistic + Cloud Firestore)
  const deleteSession = async (sessionId) => {
    setWorkspace((prev) => ({
      ...prev,
      sessions: prev.sessions.filter((s) => s.id !== sessionId),
      currentSessionId: prev.currentSessionId === sessionId ? '' : prev.currentSessionId
    }))

    try {
      await deleteSessionFromFirestore(sessionId)
    } catch (err) {
      console.warn('Firestore deleteSession warning:', err.message)
    }
  }

  const value = {
    authUser,
    accountId: authUser?.id || '',
    signIn,
    signUp,
    signOut,
    activeTab,
    setActiveTab,
    sessions,
    setSessions,
    deleteSession,
    currentSession,
    setCurrentSession,
    patients: workspace.patients,
    activePatientId: workspace.activePatientId,
    addPatient,
    updatePatient,
    deletePatient,
    setActivePatientId,
    isRecording,
    setIsRecording,
    recordingTime,
    setRecordingTime,
    audioBlob,
    setAudioBlob,
    uploadedFileName,
    setUploadedFileName,
    isAnalyzing,
    setIsAnalyzing,
    showDisclaimer,
    setShowDisclaimer,
    activeMetricModal,
    setActiveMetricModal,
    userProfile,
    setUserProfile,
    addSession,
    firestoreStatus,
    setFirestoreStatus
  }

  return <VoiceAppContext.Provider value={value}>{children}</VoiceAppContext.Provider>
}

export function useVoiceApp() {
  const context = useContext(VoiceAppContext)
  if (!context) {
    throw new Error('useVoiceApp must be used within a VoiceAppProvider')
  }
  return context
}
