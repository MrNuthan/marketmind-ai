const SESSION_STORAGE_KEY = 'marketmind_session_id';

/**
 * Generates a unique, persistent session ID following marketmind-[random-id]
 */
export function generateSessionId(): string {
  const randomPart = Math.random().toString(36).substring(2, 10);
  const timePart = Date.now().toString(36).slice(-4);
  return `marketmind-${randomPart}${timePart}`;
}

/**
 * Gets the current session ID from localStorage or creates a new one
 */
export function getOrCreateSessionId(): string {
  try {
    const existing = localStorage.getItem(SESSION_STORAGE_KEY);
    if (existing && existing.startsWith('marketmind-') && existing.length > 12) {
      return existing;
    }
    const newId = generateSessionId();
    localStorage.setItem(SESSION_STORAGE_KEY, newId);
    return newId;
  } catch (err) {
    console.warn('localStorage unavailable, generating in-memory sessionId', err);
    return generateSessionId();
  }
}

/**
 * Forces regeneration of the session ID
 */
export function resetSessionId(): string {
  const newId = generateSessionId();
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, newId);
  } catch (err) {
    console.warn('Unable to persist reset sessionId', err);
  }
  return newId;
}
