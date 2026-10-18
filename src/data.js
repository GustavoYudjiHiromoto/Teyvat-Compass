// Datas de lançamento vêm do snapshot da API pública Yatta: https://gi.yatta.moe/api/v2/en/avatar
import characterCatalog from './characterCatalog.json';

const curatedCharacters = [
  { id: 'traveler', name: 'Viajante', element: 'Anemo', rarity: 5, weapon: 'Espada', role: 'Suporte', color: '#d9c68b', initials: 'VJ' },
  { id: 'xiangling', name: 'Xiangling', element: 'Pyro', rarity: 4, weapon: 'Lança', role: 'Sub DPS', color: '#ed866f', initials: 'XL' },
  { id: 'xingqiu', name: 'Xingqiu', element: 'Hydro', rarity: 4, weapon: 'Espada', role: 'Sub DPS', color: '#74bbd3', initials: 'XQ' },
  { id: 'bennett', name: 'Bennett', element: 'Pyro', rarity: 4, weapon: 'Espada', role: 'Suporte', color: '#efa46f', initials: 'BN' },
  { id: 'sucrose', name: 'Sucrose', element: 'Anemo', rarity: 4, weapon: 'Catalisador', role: 'Suporte', color: '#a5c58c', initials: 'SC' },
  { id: 'fischl', name: 'Fischl', element: 'Electro', rarity: 4, weapon: 'Arco', role: 'Sub DPS', color: '#ad9bd1', initials: 'FI' },
  { id: 'beidou', name: 'Beidou', element: 'Electro', rarity: 4, weapon: 'Espadão', role: 'Sub DPS', color: '#8f7cb6', initials: 'BD' },
  { id: 'kaeya', name: 'Kaeya', element: 'Cryo', rarity: 4, weapon: 'Espada', role: 'Sub DPS', color: '#83b5d3', initials: 'KY' },
  { id: 'barbara', name: 'Barbara', element: 'Hydro', rarity: 4, weapon: 'Catalisador', role: 'Healer', color: '#e791ac', initials: 'BB' },
  { id: 'noelle', name: 'Noelle', element: 'Geo', rarity: 4, weapon: 'Espadão', role: 'Healer', color: '#d9c68b', initials: 'NO' },
  { id: 'lisa', name: 'Lisa', element: 'Electro', rarity: 4, weapon: 'Catalisador', role: 'Sub DPS', color: '#a68ac9', initials: 'LS' },
  { id: 'amber', name: 'Amber', element: 'Pyro', rarity: 4, weapon: 'Arco', role: 'DPS', color: '#ed9867', initials: 'AM' },
  { id: 'collei', name: 'Collei', element: 'Dendro', rarity: 4, weapon: 'Arco', role: 'Suporte', color: '#8bab76', initials: 'CO' },
  { id: 'kuki', name: 'Kuki Shinobu', element: 'Electro', rarity: 4, weapon: 'Espada', role: 'Healer', color: '#a89b62', initials: 'KS' },
  { id: 'rosaria', name: 'Rosaria', element: 'Cryo', rarity: 4, weapon: 'Lança', role: 'Sub DPS', color: '#b69bab', initials: 'RO' },
  { id: 'lynette', name: 'Lynette', element: 'Anemo', rarity: 4, weapon: 'Espada', role: 'Suporte', color: '#98a1bd', initials: 'LY' },
  { id: 'yaoyao', name: 'Yaoyao', element: 'Dendro', rarity: 4, weapon: 'Lança', role: 'Healer', color: '#9bbd8c', initials: 'YY' },
  { id: 'diona', name: 'Diona', element: 'Cryo', rarity: 4, weapon: 'Arco', role: 'Healer', color: '#c999ab', initials: 'DI' },
];

const curatedById = new Map(curatedCharacters.map((character) => [character.id, character]));
const characterRegions = {
  Mondstadt: ['traveler', 'jean', 'lisa', 'barbara', 'kaeya', 'diluc', 'razor', 'amber', 'venti', 'klee', 'fischl', 'bennett', 'noelle', 'sucrose', 'mona', 'albedo', 'diona', 'rosaria', 'eula', 'mika', 'durin', 'varka', 'lohen', 'nicole', 'dahlia'],
  Liyue: ['xiangling', 'beidou', 'xingqiu', 'xiao', 'ningguang', 'zhongli', 'ganyu', 'chongyun', 'qiqi', 'keqing', 'xinyan', 'hutao', 'yanfei', 'shenhe', 'yunjin', 'yelan', 'yaoyao', 'baizhu', 'gaming', 'xianyun', 'lan_yan', 'zibai', 'illuga'],
  Inazuma: ['kamisato_ayaka', 'kaedehara_kazuha', 'yoimiya', 'thoma', 'shogun_raiden', 'sayu', 'sangonomiya_kokomi', 'gorou', 'kujou_sara', 'arataki_itto', 'yae_miko', 'shikanoin_heizou', 'kirara', 'kuki_shinobu', 'kamisato_ayato', 'chiori', 'yumemizuki_mizuki'],
  Sumeru: ['collei', 'dori', 'tighnari', 'nilou', 'cyno', 'candace', 'nahida', 'layla', 'wanderer', 'faruzan', 'alhaitham', 'dehya', 'kaveh', 'sethos'],
  Fontaine: ['lynette', 'lyney', 'freminet', 'wriothesley', 'neuvillette', 'charlotte', 'furina', 'chevreuse', 'navia', 'sigewinne', 'arlecchino', 'clorinde', 'emilie', 'escoffier', 'skirk', 'prune'],
  Natlan: ['kachina', 'kinich', 'mualani', 'xilonen', 'chasca', 'ororon', 'mavuika', 'citlali', 'iansan', 'varesa', 'ifa', 'jahoda'],
  'Nod-Krai': ['ineffa', 'lauma', 'flins', 'nefer', 'columbina', 'aino', 'linnea', 'aloy'],
  Snezhnaya: ['tartaglia', 'sandrone', 'vodyanitsa', 'vesna', 'alyosha', 'odette'],
};
const normalizeRegionKey = (value) => value.toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]/g, '');
const regionByCharacterId = new Map(Object.entries(characterRegions).flatMap(([region, ids]) => ids.map((id) => [normalizeRegionKey(id), region])));
const regionOrder = Object.keys(characterRegions);
const elementColors = {
  Anemo: '#a5c58c', Cryo: '#83b5d3', Dendro: '#8bab76', Electro: '#ad9bd1',
  Geo: '#d9c68b', Hydro: '#74bbd3', Pyro: '#ed866f',
};

export const characters = characterCatalog.map((entry) => {
  const curated = curatedById.get(entry.id);
  const initials = entry.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toLocaleUpperCase('pt-BR');
  return {
    ...entry,
    ...curated,
    region: regionByCharacterId.get(normalizeRegionKey(entry.id)) || regionByCharacterId.get(normalizeRegionKey(entry.name)) || (entry.name === 'Andarilho' ? 'Sumeru' : 'Outras regiões'),
    avatarId: entry.avatarId,
    iconUrl: entry.icon
      ? `https://enka.network${entry.icon.replace('UI_AvatarIcon_Side_', 'UI_AvatarIcon_')}`
      : null,
    role: curated?.role ?? 'Sem guia',
    color: curated?.color ?? elementColors[entry.element] ?? '#a9ad95',
    initials: curated?.initials ?? initials,
  };
});

export const teams = [
  {
    id: 'national', title: 'Nacional', subtitle: 'Vaporização com dano consistente fora de campo', difficulty: 'Intermediário', priority: 1, tags: ['Vaporização', 'Abismo'],
    explanation: 'Xiangling e Xingqiu aplicam Pyro e Hydro continuamente; Bennett fortalece e cura a equipe.',
    slots: [
      { characterId: 'xiangling', role: 'Dano Pyro', alternatives: [{ characterId: 'amber', reason: 'mantém Pyro, mas causa menos dano fora de campo' }] },
      { characterId: 'xingqiu', role: 'Aplicação Hydro', alternatives: [{ characterId: 'barbara', reason: 'oferece Hydro e cura, com aplicação mais limitada' }] },
      { characterId: 'bennett', role: 'Bônus e cura', alternatives: [{ characterId: 'noelle', reason: 'oferece proteção e cura, sem o bônus de ATQ' }, { characterId: 'diona', reason: 'oferece escudo e cura, sem o bônus de ATQ' }] },
      { characterId: 'sucrose', role: 'Suporte Anemo', alternatives: [{ characterId: 'traveler', reason: 'pode agrupar inimigos e espalhar elementos' }, { characterId: 'lynette', reason: 'oferece suporte Anemo e espalha elementos' }] },
    ],
  },
  {
    id: 'taser', title: 'Taser', subtitle: 'Eletrocarregado com dano em vários alvos', difficulty: 'Intermediário', priority: 2, tags: ['Eletrocarregado', 'Multi-alvo'],
    explanation: 'Hydro e Electro ativam Eletrocarregado enquanto Fischl e Beidou causam dano fora de campo.',
    slots: [
      { characterId: 'fischl', role: 'Bateria Electro', alternatives: [{ characterId: 'lisa', reason: 'mantém Electro, mas exige mais tempo em campo' }] },
      { characterId: 'beidou', role: 'Dano em área', alternatives: [{ characterId: 'lisa', reason: 'mantém dano Electro, com menos dano em área' }] },
      { characterId: 'xingqiu', role: 'Aplicação Hydro', alternatives: [{ characterId: 'barbara', reason: 'mantém Hydro e adiciona cura' }] },
      { characterId: 'sucrose', role: 'Suporte Anemo', alternatives: [{ characterId: 'traveler', reason: 'espalha elementos e ajuda a agrupar inimigos' }, { characterId: 'lynette', reason: 'espalha elementos e oferece suporte Anemo' }] },
    ],
  },
  {
    id: 'starter', title: 'Primeiros passos', subtitle: 'Uma equipe flexível com opções acessíveis', difficulty: 'Iniciante', priority: 0, tags: ['Exploração', 'Acessível'],
    explanation: 'Kaeya e Xiangling criam reações Cryo e Pyro; um personagem de cura ajuda a equipe a explorar.',
    slots: [
      { characterId: 'kaeya', role: 'Aplicação Cryo', alternatives: [{ characterId: 'rosaria', reason: 'mantém Cryo e pode fortalecer o CRIT da equipe' }, { characterId: 'diona', reason: 'mantém Cryo e adiciona escudo e cura' }] },
      { characterId: 'xiangling', role: 'Dano Pyro', alternatives: [{ characterId: 'amber', reason: 'mantém Pyro e é uma opção inicial gratuita' }] },
      { characterId: 'barbara', role: 'Cura', alternatives: [{ characterId: 'noelle', reason: 'oferece escudo e cura durante sua habilidade suprema' }, { characterId: 'diona', reason: 'oferece escudo e cura' }, { characterId: 'yaoyao', reason: 'oferece cura e aplicação Dendro' }] },
      { characterId: 'traveler', role: 'Suporte flexível', alternatives: [{ characterId: 'lynette', reason: 'oferece suporte Anemo e mobilidade' }, { characterId: 'sucrose', reason: 'agrupa inimigos e espalha elementos' }] },
    ],
  },
  {
    id: 'hyperbloom', title: 'Hiperflorescimento', subtitle: 'Reações Dendro com alto retorno de investimento', difficulty: 'Acessível', priority: 3, tags: ['Hiperflorescimento', 'Dendro'],
    explanation: 'Collei e Xingqiu criam núcleos Dendro; Kuki os ativa com Electro e também mantém a equipe curada.',
    slots: [
      { characterId: 'collei', role: 'Aplicação Dendro', alternatives: [{ characterId: 'yaoyao', reason: 'mantém Dendro e adiciona cura' }] },
      { characterId: 'xingqiu', role: 'Aplicação Hydro', alternatives: [{ characterId: 'barbara', reason: 'mantém Hydro e oferece cura, com aplicação mais limitada' }] },
      { characterId: 'kuki', role: 'Ativação Electro e cura', alternatives: [{ characterId: 'lisa', reason: 'oferece Electro, mas ativa núcleos com menos consistência' }] },
      { characterId: 'sucrose', role: 'Suporte flexível', alternatives: [{ characterId: 'lynette', reason: 'espalha elementos e oferece suporte Anemo' }, { characterId: 'traveler', reason: 'agrupa inimigos e ajuda a espalhar elementos' }] },
    ],
  },
];

export const elementNames = { Pyro: 'Pyro', Hydro: 'Hydro', Anemo: 'Anemo', Electro: 'Electro', Cryo: 'Cryo', Geo: 'Geo', Dendro: 'Dendro' };
