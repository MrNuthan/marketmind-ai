import { useState, useCallback } from 'react';
import { getOrCreateSessionId, resetSessionId } from '../utils/session';

export function useSession() {
  const [sessionId, setSessionId] = useState<string>(() => getOrCreateSessionId());

  const renewSession = useCallback(() => {
    const newId = resetSessionId();
    setSessionId(newId);
    return newId;
  }, []);

  return {
    sessionId,
    renewSession,
  };
}
