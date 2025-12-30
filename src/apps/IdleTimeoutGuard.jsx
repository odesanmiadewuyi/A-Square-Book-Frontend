import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { notification } from 'antd';

import { logout as logoutAction } from '@/redux/auth/actions';
import { selectAuth } from '@/redux/auth/selectors';

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];

const captureFormState = () => {
  try {
    const activeForm = document.activeElement?.closest('form') || document.querySelector('form');
    if (!activeForm) return null;
    const fields = [];
    const addField = (el, value) => {
      const key = el.name || el.id;
      if (!key) return;
      fields.push({ key, value, type: el.type });
    };
    const inputs = activeForm.querySelectorAll('input, select, textarea');
    inputs.forEach((el) => {
      if (el.type === 'checkbox') {
        addField(el, !!el.checked);
      } else if (el.type === 'radio') {
        if (el.checked) addField(el, el.value);
      } else {
        addField(el, el.value);
      }
    });
    return fields.length ? { fields } : null;
  } catch (_) {
    return null;
  }
};

// Logs the user out after a period of inactivity (defaults to 5 minutes).
export default function IdleTimeoutGuard({ timeoutMs = 5 * 60 * 1000, children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useSelector(selectAuth);
  const timerRef = useRef(null);
  const intervalRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const logoutTriggeredRef = useRef(false);

  useEffect(() => {
    if (!isLoggedIn) return;

    const triggerLogout = () => {
      if (logoutTriggeredRef.current) return;
      logoutTriggeredRef.current = true;
      try {
        const data = {
          path: location?.pathname || '/',
          search: location?.search || '',
          scroll: { x: window.scrollX || 0, y: window.scrollY || 0 },
          form: captureFormState(),
          ts: Date.now(),
        };
        window.localStorage.setItem('postLoginRedirect', JSON.stringify(data));
      } catch (_) {}

      notification.warning({
        message: 'Session timed out',
        description: 'You were signed out after 5 minutes of inactivity.',
        duration: 5,
      });
      try {
        window.localStorage.removeItem('postLoginRedirect');
        window.localStorage.removeItem('auth');
        window.localStorage.removeItem('settings');
        window.localStorage.removeItem('isLogout');
      } catch (_) {}
      dispatch(logoutAction()).finally(() => {
        // Hard reload to clear any lingering overlays or stale UI state
        window.location.href = '/login';
        setTimeout(() => {
          try {
            window.location.reload();
          } catch (_) {}
        }, 50);
      });
    };

    const resetTimer = () => {
      lastActivityRef.current = Date.now();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(triggerLogout, timeoutMs);
    };

    const checkIdle = () => {
      if (logoutTriggeredRef.current) return;
      const idleFor = Date.now() - lastActivityRef.current;
      if (idleFor >= timeoutMs) {
        triggerLogout();
      }
    };

    const handleActivity = () => {
      if (document.hidden) return;
      resetTimer();
    };

    const handleVisibility = () => {
      if (document.hidden) {
        checkIdle();
        return;
      }
      resetTimer();
    };

    resetTimer();
    const pollMs = Math.max(15000, Math.min(60000, Math.floor(timeoutMs / 4)));
    intervalRef.current = setInterval(checkIdle, pollMs);
    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, handleActivity, { passive: true }));
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, handleActivity));
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [dispatch, isLoggedIn, navigate, timeoutMs, location]);

  return children;
}
