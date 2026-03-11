import { createRoot } from 'react-dom/client';

import RootApp from './RootApp';

const CHUNK_RECOVERY_KEY = 'asquarebook_chunk_recovery_once';

const recoverFromStaleChunk = () => {
  if (typeof window === 'undefined') return;
  let alreadyRetried = false;
  try {
    alreadyRetried = sessionStorage.getItem(CHUNK_RECOVERY_KEY) === '1';
  } catch (_) {
    alreadyRetried = false;
  }

  // Prevent infinite reload loops if a real deploy/runtime issue persists.
  if (alreadyRetried) return;

  try {
    sessionStorage.setItem(CHUNK_RECOVERY_KEY, '1');
  } catch (_) {
    // Best effort; continue with reload.
  }

  try {
    const url = new URL(window.location.href);
    url.searchParams.set('v', Date.now().toString());
    window.location.replace(url.toString());
  } catch (_) {
    window.location.reload();
  }
};

if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    recoverFromStaleChunk();
  });

  // Some browsers surface stale chunk failures as generic module-load errors.
  window.addEventListener('error', (event) => {
    const message = (event?.message || '').toString();
    if (
      /Failed to fetch dynamically imported module/i.test(message) ||
      /Failed to load module script/i.test(message)
    ) {
      recoverFromStaleChunk();
    }
  });
}

const root = createRoot(document.getElementById('root'));
root.render(<RootApp />);

// App booted successfully; allow a future one-time recovery after next deploy.
if (typeof window !== 'undefined') {
  try {
    sessionStorage.removeItem(CHUNK_RECOVERY_KEY);
  } catch (_) {
    // ignore
  }
}
