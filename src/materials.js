const CACHE_PREFIX = 'teyvat-compass-ascension-v2-';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;
const API_URL = 'https://genshin-db-api.vercel.app/api/v5/characters';
const WEAPONS_API_URL = 'https://genshin-db-api.vercel.app/api/v5/weapons';
const WEAPON_LIST_CACHE_KEY = 'teyvat-compass-weapon-list-v1';
const ASCENSION_LEVELS = [20, 40, 50, 60, 70, 80];

const collectAscensionCosts = (costs) => Object.entries(costs)
  .filter(([key]) => /^ascend[1-6]$/.test(key))
  .flatMap(([key, items]) => {
    const unlockLevel = ASCENSION_LEVELS[Number(key.slice('ascend'.length)) - 1];
    return Array.isArray(items) ? items.map((item) => ({ ...item, unlockLevel })) : [];
  });

const readCache = (avatarId) => {
  try {
    const cached = JSON.parse(localStorage.getItem(`${CACHE_PREFIX}${avatarId}`));
    if (cached?.savedAt && Date.now() - cached.savedAt < CACHE_TTL && Array.isArray(cached.costs)) return cached.costs;
  } catch {
    // Cache inválido: buscar novamente na fonte pública.
  }
  return null;
};

async function requestJson(url) {
  const response = await fetch(url);
  if (response.status === 429) throw new Error('A fonte de dados está limitando consultas. Aguarde um pouco e tente novamente.');
  if (!response.ok) throw new Error('Não foi possível consultar os materiais agora. Tente novamente mais tarde.');
  const body = await response.text();
  if (!body.trim()) throw new Error('A fonte de dados não retornou resultados. Tente novamente mais tarde.');
  try {
    return JSON.parse(body);
  } catch {
    throw new Error('A fonte de materiais retornou uma resposta inválida. Tente novamente mais tarde.');
  }
}

export async function fetchWeaponNames() {
  try {
    const cached = JSON.parse(localStorage.getItem(WEAPON_LIST_CACHE_KEY));
    if (cached?.savedAt && Date.now() - cached.savedAt < CACHE_TTL && Array.isArray(cached.names)) return cached.names;
  } catch {
    // Cache inválido: consultar a lista pública novamente.
  }

  const url = new URL(WEAPONS_API_URL);
  url.searchParams.set('query', 'names');
  url.searchParams.set('matchCategories', 'true');
  url.searchParams.set('resultLanguage', 'portuguese');
  const results = await requestJson(url);
  if (!Array.isArray(results) || !results.length || results.some((name) => typeof name !== 'string')) {
    throw new Error('A fonte de dados retornou uma lista de armas inválida. Tente novamente mais tarde.');
  }
  const names = results.sort((left, right) => left.localeCompare(right, 'pt-BR'));
  try {
    localStorage.setItem(WEAPON_LIST_CACHE_KEY, JSON.stringify({ names, savedAt: Date.now() }));
  } catch {
    // A lista continua disponível durante esta sessão se o cache estiver bloqueado.
  }
  return names;
}

export async function fetchWeaponAscensionCosts(weaponName) {
  const cacheKey = `teyvat-compass-weapon-ascension-v1-${weaponName}`;
  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey));
    if (cached?.savedAt && Date.now() - cached.savedAt < CACHE_TTL && Array.isArray(cached.costs)) return cached.costs;
  } catch {
    // Cache inválido: consultar a arma novamente.
  }

  const url = new URL(WEAPONS_API_URL);
  url.searchParams.set('query', weaponName);
  url.searchParams.set('resultLanguage', 'portuguese');
  const result = await requestJson(url);
  const weapon = (Array.isArray(result) ? result : [result]).find((entry) => entry?.name === weaponName);
  if (!Array.isArray(weapon?.costs?.ascend1)) throw new Error(`Não encontramos custos de ascensão para ${weaponName}.`);
  const costs = collectAscensionCosts(weapon.costs);
  try {
    localStorage.setItem(cacheKey, JSON.stringify({ costs, savedAt: Date.now() }));
  } catch {
    // O cálculo funciona mesmo sem cache persistente.
  }
  return costs;
}

export async function fetchCharacterAscensionCosts(character) {
  const cached = readCache(character.avatarId);
  if (cached) return cached;

  const url = new URL(API_URL);
  // A API usa os nomes próprios dos protagonistas; nosso catálogo os agrupa
  // como "Viajante" para não duplicar o personagem por elemento.
  const queryName = Number(character.avatarId) === 10000007
    ? 'Lumine'
    : Number(character.avatarId) === 10000005 && character.name === 'Viajante'
      ? 'Aether'
      : character.name;
  url.searchParams.set('query', queryName);
  url.searchParams.set('resultLanguage', 'portuguese');
  const response = await fetch(url);
  if (response.status === 429) throw new Error('A fonte de dados está limitando consultas. Aguarde um pouco e tente novamente.');
  if (!response.ok) throw new Error('Não foi possível consultar os materiais agora. Tente novamente mais tarde.');

  const body = await response.text();
  if (!body.trim()) {
    throw new Error(`A fonte de dados não retornou materiais para ${character.name}. Tente novamente mais tarde.`);
  }
  let result;
  try {
    result = JSON.parse(body);
  } catch {
    throw new Error('A fonte de materiais retornou uma resposta inválida. Tente novamente mais tarde.');
  }
  const records = Array.isArray(result) ? result : result ? [result] : [];
  const characterData = records.find((entry) => Number(entry.id) === Number(character.avatarId));
  if (!Array.isArray(characterData?.costs?.ascend1)) {
    throw new Error(`Não encontramos custos de ascensão em português para ${character.name}.`);
  }

  const costs = collectAscensionCosts(characterData.costs);

  try {
    localStorage.setItem(`${CACHE_PREFIX}${character.avatarId}`, JSON.stringify({ costs, savedAt: Date.now() }));
  } catch {
    // O cálculo funciona mesmo se o navegador bloquear o cache.
  }
  return costs;
}

export function calculateAscensionMaterials(costs, currentLevel, targetLevel) {
  const totals = new Map();
  for (const item of costs) {
    if (item.unlockLevel < currentLevel || item.unlockLevel >= targetLevel) continue;
    const current = totals.get(item.id) || {
      id: item.id,
      name: item.name,
      count: 0,
      imageUrl: `https://res.cloudinary.com/genshin/image/upload/sprites/UI_ItemIcon_${item.id}.png`,
    };
    current.count += item.count;
    totals.set(item.id, current);
  }
  return [...totals.values()].sort((left, right) => Number(left.id === 202) - Number(right.id === 202) || left.name.localeCompare(right.name, 'pt-BR'));
}
