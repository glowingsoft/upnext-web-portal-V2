let loadPromise = null;

export function loadGoogleIdentity() {
  if (window.google?.accounts?.oauth2) return Promise.resolve(window.google.accounts);

  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.oauth2) resolve(window.google.accounts);
      else reject(new Error('Google sign-in did not load.'));
    };
    script.onerror = () => {
      loadPromise = null;
      reject(new Error('Failed to load the Google sign-in script.'));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}

export async function fetchGoogleAccount(accessToken) {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error('Could not read your Google account.');

  return response.json();
}
