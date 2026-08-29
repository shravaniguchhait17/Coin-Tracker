// All requests go to relative paths (e.g. "/api/me") so that, in dev, Vite's
// proxy forwards them to the Spring backend while keeping the browser on
// the same origin (localhost:5173) — this is what makes the session cookie
// work without CORS config. In production, this app is expected to be
// served from the same origin as the backend (see README for options).

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

async function request(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const headers = { ...(options.headers || {}) };

  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  // Spring Security's CookieCsrfTokenRepository (see backend-reference)
  // hands the frontend a readable XSRF-TOKEN cookie. State-changing
  // requests (POST/PUT/DELETE) must echo it back as this header or
  // Spring will reject them with 403.
  if (method !== 'GET' && method !== 'HEAD') {
    const csrf = getCookie('XSRF-TOKEN');
    if (csrf) headers['X-XSRF-TOKEN'] = csrf;
  }

  const res = await fetch(path, {
    ...options,
    headers,
    credentials: 'include' // send the session cookie
  });

  if (res.status === 401) {
    const err = new Error('Not authenticated');
    err.status = 401;
    throw err;
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = new Error(text || `Request failed: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;

  const contentType = res.headers.get('content-type') || '';
  return contentType.includes('application/json') ? res.json() : res.text();
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: (path) => request(path, { method: 'DELETE' })
};

// Full-page navigation (NOT a fetch) — OAuth2 login has to be a real
// browser redirect so Google's consent screen can render.
export function redirectToGoogleLogin() {
  window.location.href = '/oauth2/authorization/google';
}

export function redirectToLogout() {
  window.location.href = '/logout';
}
