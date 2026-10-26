import { useEffect, useRef } from 'react';
import { useMeta } from '../../context/MetaContext';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SRC = 'https://accounts.google.com/gsi/client';
let scriptPromise;

function loadGoogle() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = SRC; s.async = true; s.defer = true;
      s.onload = resolve;
      s.onerror = () => { scriptPromise = null; reject(new Error('Could not load Google sign-in')); };
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}

/** Google Identity Services button. Calls onCredential(idToken); the backend verifies the token. */
export default function GoogleButton({ onCredential, text = 'continue_with' }) {
  const { googleEnabled } = useMeta();
  const ref = useRef(null);
  const cb = useRef(onCredential);
  cb.current = onCredential;
  const enabled = googleEnabled && !!CLIENT_ID;

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    loadGoogle().then(() => {
      if (cancelled || !ref.current) return;
      window.google.accounts.id.initialize({ client_id: CLIENT_ID, callback: (r) => cb.current(r.credential) });
      window.google.accounts.id.renderButton(ref.current, { theme: 'outline', size: 'large', text, width: 320 });
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [enabled, text]);

  if (!enabled) return null;
  return <div ref={ref} className="flex justify-center" />;
}

export const googleAvailable = (googleEnabled) => googleEnabled && !!CLIENT_ID;
