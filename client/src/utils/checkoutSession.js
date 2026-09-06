const SESSION_KEY = 'paceforge_checkout_session';
const SESSION_DURATION_MS = 10 * 60 * 1000; // 10 Minutes

export const getCheckoutSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    const now = Date.now();
    if (now >= session.expiresAt) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
};

export const startCheckoutSession = (raceData, category, distance, calculatedPrice, user) => {
  const now = Date.now();
  const existing = getCheckoutSession();

  // If active session for same race exists, preserve remaining time & participant state
  if (existing && existing.race?._id === raceData?._id && existing.distance === distance) {
    return existing;
  }

  const session = {
    sessionStartedAt: now,
    expiresAt: now + SESSION_DURATION_MS,
    race: raceData,
    category: category || raceData?.category || 'Marathon',
    distance: distance || raceData?.distances?.[0] || 'Standard',
    calculatedPrice: Number(calculatedPrice || raceData?.price || 1200),
    participant: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      emergencyName: '',
      emergencyPhone: ''
    }
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
};

export const updateCheckoutParticipant = (participantData) => {
  const session = getCheckoutSession();
  if (!session) return null;
  const updated = {
    ...session,
    participant: {
      ...session.participant,
      ...participantData
    }
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  return updated;
};

export const clearCheckoutSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const formatTimerSeconds = (totalSeconds) => {
  const sec = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(sec / 60);
  const remainingSecs = sec % 60;
  return `${String(mins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
};
