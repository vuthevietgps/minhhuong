const sessionStorageKey = "mhe_session";

type StoredSession = {
  accessToken?: string;
};

export function readStoredSession<T extends StoredSession>() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(sessionStorageKey);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as T;
  } catch {
    window.localStorage.removeItem(sessionStorageKey);
    return null;
  }
}

export function storeSession(session: unknown) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(sessionStorageKey, JSON.stringify(session));
}

export function clearStoredSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(sessionStorageKey);
}

export function getStoredAccessToken() {
  return readStoredSession<StoredSession>()?.accessToken ?? null;
}
