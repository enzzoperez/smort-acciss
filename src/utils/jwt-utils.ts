const ONE_HOUR_MS = 60 * 60 * 1000;

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function isTokenExpiringSoon(token: string | null | undefined): boolean {
  if (!token) return false;
  const payload = decodeJwtPayload(token);
  if (!payload?.exp || typeof payload.exp !== 'number') return false;
  return payload.exp * 1000 - Date.now() < ONE_HOUR_MS;
}

export function isTokenExpired(token: string | null | undefined): boolean {
  if (!token) return true;
  const payload = decodeJwtPayload(token);
  if (!payload?.exp || typeof payload.exp !== 'number') return true;
  return payload.exp * 1000 < Date.now();
}
