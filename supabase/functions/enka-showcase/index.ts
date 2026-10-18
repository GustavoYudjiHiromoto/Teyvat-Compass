import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
let localizationCache: { expiresAt: number; values: Record<string, string> } | null = null;

async function getPortugueseLocalization() {
  if (localizationCache && localizationCache.expiresAt > Date.now()) return localizationCache.values;
  try {
    const response = await fetch('https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/gi/locs.json', {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return {};
    const data = await response.json();
    const values = data.pt && typeof data.pt === 'object' ? data.pt : {};
    localizationCache = { expiresAt: Date.now() + 60 * 60 * 1000, values };
    return values;
  } catch {
    return {};
  }
}

serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return respond({ error: 'Use POST.' }, 405);

  let uid: string;
  try {
    const body = await request.json();
    uid = String(body?.uid ?? '').trim();
  } catch {
    return respond({ error: 'Corpo da requisição inválido.' }, 400);
  }
  if (!/^\d{9,10}$/.test(uid)) return respond({ error: 'Informe um UID de 9 ou 10 dígitos.' }, 400);

  try {
    const response = await fetch(`https://enka.network/api/uid/${uid}/`, {
      headers: { 'User-Agent': 'TeyvatCompass/0.1' },
    });
    if (!response.ok) {
      const messages: Record<number, string> = {
        400: 'O UID informado não tem um formato válido.',
        404: 'UID não encontrado. Confira o número e a região da conta.',
        424: 'A Enka está atualizando os dados após uma manutenção do jogo. Tente mais tarde.',
        429: 'A Enka limitou as consultas por enquanto. Aguarde antes de tentar novamente.',
      };
      return respond({ error: messages[response.status] ?? 'A Enka não conseguiu consultar este perfil.' }, response.status === 429 ? 429 : 502);
    }

    const data = await response.json();
    if (!Array.isArray(data.avatarInfoList)) {
      return respond({ error: 'O perfil não tem personagens visíveis no Showcase. Ative a exibição no jogo e tente novamente.' }, 422);
    }
    const localization = await getPortugueseLocalization();
    const localized = (hash: unknown) => hash == null ? null : localization[String(hash)] ?? null;

    const shownLevels = new Map<number, number>();
    for (const avatar of data.playerInfo?.showAvatarInfoList ?? []) {
      const avatarId = Number(avatar.avatarId);
      const level = Number(avatar.level);
      if (Number.isFinite(avatarId) && Number.isFinite(level)) shownLevels.set(avatarId, level);
    }
    const stat = (value: Record<string, unknown> | undefined) => {
      const propId = value?.mainPropId ?? value?.appendPropID ?? value?.appendPropId;
      const statValue = Number(value?.propValue ?? value?.statValue);
      return propId && Number.isFinite(statValue)
        ? { propId: String(propId), label: localized(propId), value: statValue }
        : null;
    };
    const avatars = data.avatarInfoList.map((avatar: Record<string, any>) => {
      const avatarId = Number(avatar.avatarId ?? avatar.avatarID);
      const equipment = Array.isArray(avatar.equipList) ? avatar.equipList : [];
      const weaponEntry = equipment.find((item: Record<string, any>) => item.itemType === 'ITEM_WEAPON' || item.weapon);
      const weapon = weaponEntry ? {
        id: weaponEntry.itemId,
        name: localized(weaponEntry.flat?.nameTextHashMap),
        icon: weaponEntry.flat?.icon,
        rarity: weaponEntry.flat?.rankLevel,
        level: weaponEntry.weapon?.level,
        refinement: Number(Object.values(weaponEntry.weapon?.affixMap ?? {})[0] ?? 0) + 1,
        stats: Array.isArray(weaponEntry.flat?.weaponStats)
          ? weaponEntry.flat.weaponStats.map(stat).filter(Boolean)
          : [],
      } : null;
      const artifacts = equipment
        .filter((item: Record<string, any>) => item.itemType === 'ITEM_RELIQUARY' || item.reliquary)
        .map((item: Record<string, any>) => ({
          id: item.itemId,
          name: localized(item.flat?.nameTextHashMap),
          setName: localized(item.flat?.setNameTextHashMap),
          icon: item.flat?.icon,
          rarity: item.flat?.rankLevel,
          slot: item.flat?.equipType,
          level: item.reliquary?.level,
          setHash: item.flat?.setNameTextHashMap,
          mainStat: stat(item.flat?.reliquaryMainstat),
          substats: Array.isArray(item.flat?.reliquarySubstats)
            ? item.flat.reliquarySubstats.map(stat).filter(Boolean)
            : [],
        }));
      const fightProps = avatar.fightPropMap ?? {};
      return {
        avatarId,
        level: shownLevels.get(avatarId) ?? null,
        constellation: Array.isArray(avatar.talentIdList) ? avatar.talentIdList.length : 0,
        stats: {
          critRate: Number(fightProps['20']) || 0,
          critDamage: Number(fightProps['22']) || 0,
          recharge: Number(fightProps['23']) || 0,
          elementalMastery: Number(fightProps['28']) || 0,
        },
        weapon,
        artifacts,
      };
    });

    return respond({
      ttl: data.ttl,
      nickname: data.playerInfo?.nickname ?? null,
      level: data.playerInfo?.level ?? null,
      worldLevel: data.playerInfo?.worldLevel ?? null,
      avatars: avatars.filter((avatar: { avatarId: number }) => Number.isFinite(avatar.avatarId)),
    });
  } catch {
    return respond({ error: 'Não foi possível conectar à Enka. Verifique sua conexão e tente mais tarde.' }, 502);
  }
});

function respond(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
