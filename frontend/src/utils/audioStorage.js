const DATABASE_NAME = 'parkinsonvoice-demo-audio'
const STORE_NAME = 'voice-sessions'
const DATABASE_VERSION = 1
const LOCAL_ACCOUNT_ID = 'local-demo'

function getAudioKey(accountId, sessionId) {
  return `${accountId || LOCAL_ACCOUNT_ID}:${sessionId}`
}

function openAudioDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'key' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function saveSessionAudio(accountId, sessionId, blob) {
  if (!sessionId || !blob) return
  const database = await openAudioDatabase()
  await new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite')
    transaction.objectStore(STORE_NAME).put({ key: getAudioKey(accountId, sessionId), blob })
    transaction.oncomplete = resolve
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
  })
  database.close()
}

export async function loadSessionAudio(accountId, sessionId) {
  if (!sessionId) return null
  const database = await openAudioDatabase()
  const blob = await new Promise((resolve, reject) => {
    const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(getAudioKey(accountId, sessionId))
    request.onsuccess = () => resolve(request.result?.blob || null)
    request.onerror = () => reject(request.error)
  })
  database.close()
  return blob
}

export async function deleteSessionAudio(accountId, sessionId) {
  if (!sessionId) return
  const database = await openAudioDatabase()
  await new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite')
    transaction.objectStore(STORE_NAME).delete(getAudioKey(accountId, sessionId))
    transaction.oncomplete = resolve
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
  })
  database.close()
}