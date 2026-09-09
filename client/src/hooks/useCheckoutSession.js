import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCheckoutSession,
  clearCheckoutSession,
  formatTimerSeconds
} from '../utils/checkoutSession';

export const useCheckoutTimer = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(getCheckoutSession());
  const [timeLeft, setTimeLeft] = useState(600);

  useEffect(() => {
    if (!session?.expiresAt) return undefined;

    const updateTimer = () => {
      const remainingMs = session.expiresAt - Date.now();
      const remainingSecs = Math.max(0, Math.floor(remainingMs / 1000));
      setTimeLeft(remainingSecs);

      if (remainingSecs <= 0) {
        clearCheckoutSession();
        alert('Session Expired: Your 10-minute registration window has ended.');
        navigate('/races');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [session, navigate]);

  return {
    session,
    timeLeft,
    formattedTime: formatTimerSeconds(timeLeft),
    clearSession: () => {
      clearCheckoutSession();
      setSession(null);
    }
  };
};

export default useCheckoutTimer;
