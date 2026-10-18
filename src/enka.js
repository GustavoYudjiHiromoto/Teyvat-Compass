// IDs retornados pelo Showcase público da Enka.Network para os personagens do catálogo local.
export const enkaAvatarToCharacter = {
  10000005: 'traveler', 10000007: 'traveler', 10000023: 'xiangling', 10000025: 'xingqiu',
  10000032: 'bennett', 10000033: 'sucrose', 10000031: 'fischl',
  10000024: 'beidou', 10000014: 'kaeya', 10000006: 'barbara',
  10000015: 'noelle', 10000016: 'lisa', 10000021: 'amber',
  10000073: 'collei', 10000072: 'kuki', 10000045: 'rosaria',
  10000084: 'lynette', 10000077: 'yaoyao', 10000041: 'diona',
};

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
