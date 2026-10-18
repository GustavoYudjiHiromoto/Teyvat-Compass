import { characters } from './data.js';

// O Showcase pode identificar Aether (10000005) ou Lumine (10000007) como Viajante.
export const enkaAvatarToCharacter = Object.fromEntries([
  ...characters.map(({ avatarId, id }) => [avatarId, id]),
  [10000007, 'traveler'],
]);

export function getEnkaCache(uid) {
  try {
    const value = JSON.parse(localStorage.getItem(`teyvat-compass-enka-${uid}`));
    return value?.expiresAt > Date.now() ? value.profile : null;
  } catch {
    return null;
  }
}

export function saveEnkaCache(uid, profile, ttlSeconds) {
  try {
    const ttl = Math.max(60, Number(ttlSeconds) || 0);
    localStorage.setItem(`teyvat-compass-enka-${uid}`, JSON.stringify({
      profile,
      expiresAt: Date.now() + ttl * 1000,
    }));
  } catch {
    // A falha no cache local não impede importar os dados recebidos.
  }
}
