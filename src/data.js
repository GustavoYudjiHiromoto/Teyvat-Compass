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
  { id: 'enka_10000046', name: 'Hu Tao', element: 'Pyro', rarity: 5, weapon: 'Lança', role: 'DPS', color: '#d98968', initials: 'HT' },
  { id: 'enka_10000052', name: 'Shogun Raiden', element: 'Electro', rarity: 5, weapon: 'Lança', role: 'DPS', color: '#9b8acb', initials: 'RA' },
  { id: 'enka_10000073', name: 'Nahida', element: 'Dendro', rarity: 5, weapon: 'Catalisador', role: 'Suporte', color: '#a8c58a', initials: 'NA' },
  { id: 'enka_10000047', name: 'Kaedehara Kazuha', element: 'Anemo', rarity: 5, weapon: 'Espada', role: 'Suporte', color: '#8bb59a', initials: 'KZ' },
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
  {
    id: 'freeze-quickswap', title: 'Congelamento rápido', subtitle: 'Composição acessível para manter inimigos congelados', difficulty: 'Acessível', priority: 4, tags: ['Congelamento', 'Quickswap', 'Acessível'],
    explanation: 'Kaeya e Rosaria fornecem dano e partículas Cryo; Barbara aplica Hydro e cura, enquanto Sucrose agrupa inimigos e reduz resistências com Sombra Verde. O time rende melhor contra inimigos que podem ser congelados.',
    sources: [
      { label: 'Kaeya · KQM', url: 'https://keqingmains.com/q/kaeya-quickguide/' },
      { label: 'Rosaria · KQM', url: 'https://keqingmains.com/q/rosaria-quickguide/' },
      { label: 'Barbara · KQM', url: 'https://keqingmains.com/q/barbara-quickguide/' },
      { label: 'Sucrose · KQM', url: 'https://keqingmains.com/q/sucrose-quickguide/' },
    ],
    slots: [
      { characterId: 'kaeya', role: 'Dano e bateria Cryo', alternatives: [{ characterId: 'rosaria', reason: 'mantém dano Cryo e também gera partículas' }] },
      { characterId: 'rosaria', role: 'Dano e suporte Cryo', alternatives: [{ characterId: 'diona', reason: 'mantém Cryo e adiciona escudo e cura' }] },
      { characterId: 'barbara', role: 'Aplicação Hydro e cura', alternatives: [{ characterId: 'xingqiu', reason: 'aplica Hydro com consistência, mas a equipe perde a cura de Barbara' }] },
      { characterId: 'sucrose', role: 'Agrupamento e redução de RES', alternatives: [{ characterId: 'traveler', reason: 'oferece suporte Anemo e pode usar Sombra Verde' }, { characterId: 'lynette', reason: 'oferece suporte Anemo e pode usar Sombra Verde' }] },
    ],
  },
  {
    id: 'lisa-aggravate', title: 'Agravamento da Lisa', subtitle: 'Equipe de quatro estrelas focada em Quicken e Aggravate', difficulty: 'Intermediário', priority: 5, tags: ['Agravamento', 'Quicken', '4 estrelas'],
    explanation: 'Collei mantém a aura Dendro; Lisa ativa Aggravate em campo, Fischl causa dano Electro fora de campo e ajuda com energia, e Sucrose oferece redução de RES e Proficiência Elemental. Yaoyao pode substituir Collei para trazer cura, com aplicação Dendro diferente.',
    sources: [
      { label: 'Lisa · KQM', url: 'https://keqingmains.com/q/lisa-quickguide/' },
      { label: 'Collei · KQM', url: 'https://keqingmains.com/q/collei-quickguide/' },
      { label: 'Sucrose · KQM', url: 'https://keqingmains.com/q/sucrose-quickguide/' },
    ],
    slots: [
      { characterId: 'lisa', role: 'DPS Electro em campo', alternatives: [] },
      { characterId: 'fischl', role: 'Dano Electro fora de campo', alternatives: [{ characterId: 'beidou', reason: 'adiciona dano Electro em área, mas oferece menos bateria à Lisa' }] },
      { characterId: 'collei', role: 'Aplicação Dendro', alternatives: [{ characterId: 'yaoyao', reason: 'mantém Dendro e adiciona cura' }] },
      { characterId: 'sucrose', role: 'Suporte Anemo e redução de RES', alternatives: [{ characterId: 'traveler', reason: 'oferece suporte Anemo e pode usar Sombra Verde' }, { characterId: 'lynette', reason: 'oferece suporte Anemo e pode usar Sombra Verde' }] },
    ],
  },
  {
    id: 'hu-tao-vape-melt', title: 'Hu Tao · Vaporização e Fusão', subtitle: 'Dano em campo com Hydro consistente e apoio Cryo', difficulty: 'Intermediário', priority: 6, tags: ['Vaporização', 'Fusão', 'Chefe'],
    explanation: 'Hu Tao aproveita a aplicação Hydro de Xingqiu para Vaporizar. Kaeya acrescenta aplicação Cryo e Diona traz escudo; a cura dela pode dificultar manter Hu Tao abaixo de 50% de Vida.',
    sources: [
      { label: 'Hu Tao · KQM', url: 'https://keqingmains.com/q/hu-tao-quickguide/' },
      { label: 'Xingqiu · KQM', url: 'https://keqingmains.com/pt-br/q/xingqiu-quickguide/' },
      { label: 'Kaeya · KQM', url: 'https://keqingmains.com/q/kaeya-quickguide/' },
      { label: 'Diona · KQM', url: 'https://keqingmains.com/q/diona-quickguide/' },
    ],
    slots: [
      { characterId: 'enka_10000046', role: 'DPS Pyro em campo', alternatives: [] },
      { characterId: 'xingqiu', role: 'Aplicação Hydro', alternatives: [{ characterId: 'barbara', reason: 'oferece Hydro e cura, mas aplica Hydro com menos frequência' }] },
      { characterId: 'kaeya', role: 'Aplicação Cryo e dano fora de campo', alternatives: [{ characterId: 'rosaria', reason: 'mantém dano e aplicação Cryo fora de campo' }] },
      { characterId: 'diona', role: 'Escudo e segurança', alternatives: [{ characterId: 'noelle', reason: 'oferece escudo, mas sua habilidade tem disponibilidade limitada' }] },
    ],
  },
  {
    id: 'raiden-national', title: 'Nacional da Raiden', subtitle: 'Explosões frequentes com Vaporização e recarga de energia', difficulty: 'Intermediário', priority: 7, tags: ['Vaporização', 'Energia', 'Abismo'],
    explanation: 'Raiden fortalece as Explosões Elementais e ajuda a equipe a recuperar energia; Xiangling e Xingqiu causam dano fora de campo, enquanto Bennett oferece bônus de ATQ e cura.',
    sources: [
      { label: 'Raiden · KQM', url: 'https://keqingmains.com/q/raiden-quickguide/' },
      { label: 'Xiangling · KQM', url: 'https://keqingmains.com/q/xiangling-quickguide/' },
      { label: 'Xingqiu · KQM', url: 'https://keqingmains.com/pt-br/q/xingqiu-quickguide/' },
      { label: 'Bennett · KQM', url: 'https://keqingmains.com/q/bennett-quickguide/' },
    ],
    slots: [
      { characterId: 'enka_10000052', role: 'DPS Electro e bateria', alternatives: [{ characterId: 'fischl', reason: 'causa dano Electro fora de campo, mas não ocupa o mesmo papel de bateria em campo' }] },
      { characterId: 'xiangling', role: 'Dano Pyro fora de campo', alternatives: [{ characterId: 'amber', reason: 'mantém Pyro, com dano fora de campo menor' }] },
      { characterId: 'xingqiu', role: 'Aplicação Hydro', alternatives: [{ characterId: 'barbara', reason: 'oferece Hydro e cura, mas com aplicação mais limitada' }] },
      { characterId: 'bennett', role: 'Bônus de ATQ e cura', alternatives: [{ characterId: 'diona', reason: 'oferece escudo e cura, sem o bônus de ATQ de Bennett' }] },
    ],
  },
  {
    id: 'nahida-hyperbloom', title: 'Hiperflorescimento da Nahida', subtitle: 'Núcleos Dendro ativados por Electro com cura integrada', difficulty: 'Acessível', priority: 8, tags: ['Hiperflorescimento', 'Dendro', 'Acessível'],
    explanation: 'Nahida aplica Dendro, Xingqiu contribui com Hydro para criar núcleos e Kuki os ativa com Electro enquanto cura. Kazuha pode agrupar inimigos, mas não substitui a função de Kuki como ativador Electro.',
    sources: [
      { label: 'Nahida · KQM', url: 'https://keqingmains.com/q/nahida-quickguide/' },
      { label: 'Kuki Shinobu · KQM', url: 'https://keqingmains.com/q/shinobu-quickguide/' },
      { label: 'Xingqiu · KQM', url: 'https://keqingmains.com/pt-br/q/xingqiu-quickguide/' },
    ],
    slots: [
      { characterId: 'enka_10000073', role: 'Aplicação Dendro', alternatives: [{ characterId: 'collei', reason: 'mantém Dendro fora de campo, com cobertura e duração diferentes' }] },
      { characterId: 'xingqiu', role: 'Aplicação Hydro', alternatives: [{ characterId: 'barbara', reason: 'oferece Hydro e cura, mas com aplicação mais limitada' }] },
      { characterId: 'kuki', role: 'Ativação Electro e cura', alternatives: [{ characterId: 'lisa', reason: 'oferece Electro, mas sua aplicação ativa núcleos com menos consistência' }] },
      { characterId: 'enka_10000047', role: 'Agrupamento e suporte', alternatives: [{ characterId: 'sucrose', reason: 'agrupa inimigos e oferece suporte Anemo' }, { characterId: 'lynette', reason: 'oferece suporte Anemo e mobilidade' }] },
    ],
  },
  {
    id: 'mizuki-stellar-swirl', title: 'Mizuki · Stellar Swirl', subtitle: 'Mizuki em campo com Odette e aplicação Cryo', difficulty: 'Intermediário', priority: 9, tags: ['Stellar Swirl', 'Cryo', 'Anemo'],
    explanation: 'Odette habilita Stellar Swirl; Diona fornece Cryo, cura e escudo; Sucrose aumenta a Proficiência Elemental. O bônus mais forte de Diona para Mizuki exige C6.',
    sources: [{ label: 'Mizuki · KQM', url: 'https://keqingmains.com/q/mizuki-quickguide/' }],
    slots: [
      { characterId: 'enka_10000109', role: 'DPS Anemo em campo', alternatives: [] },
      { characterId: 'enka_10000150', role: 'Ativação de Stellar Swirl e Cryo fora de campo', alternatives: [] },
      { characterId: 'diona', role: 'Cryo, escudo e cura', alternatives: [{ characterId: 'enka_10000035', reason: 'Qiqi oferece aplicação Cryo e bônus para Stellar Swirl, com menos proteção contra interrupção' }, { characterId: 'enka_10000112', reason: 'Escoffier aplica Cryo e reduz RES Cryo' }] },
      { characterId: 'sucrose', role: 'Bônus de Proficiência Elemental', alternatives: [{ characterId: 'enka_10000076', reason: 'Faruzan fortalece o dano Anemo; sua melhor contribuição para Mizuki depende de C6' }] },
    ],
  },
  {
    id: 'mizuki-swirl-electrocharged', title: 'Mizuki · Redemoinho Electrocarregado', subtitle: 'Alternativa sem habilitador de Stellar Swirl', difficulty: 'Intermediário', priority: 10, tags: ['Redemoinho', 'Eletrocarregado', 'Alternativa'],
    explanation: 'Fischl, Ororon e Furina aplicam elementos fora de campo para Mizuki espalhar. Sem Odette ou Viajante Cryo, a equipe causa apenas Redemoinho comum; a KQM classifica este estilo como último recurso.',
    sources: [{ label: 'Mizuki · KQM', url: 'https://keqingmains.com/q/mizuki-quickguide/' }],
    slots: [
      { characterId: 'enka_10000109', role: 'DPS Anemo em campo', alternatives: [] },
      { characterId: 'fischl', role: 'Dano Electro fora de campo', alternatives: [{ characterId: 'enka_10000058', reason: 'Yae Miko oferece dano Electro fora de campo, com mais tempo de preparação' }] },
      { characterId: 'enka_10000105', role: 'Aplicação Electro e suporte', alternatives: [{ characterId: 'enka_10000058', reason: 'Yae Miko oferece dano Electro fora de campo' }] },
      { characterId: 'enka_10000089', role: 'Aplicação Hydro e bônus de dano', alternatives: [{ characterId: 'xingqiu', reason: 'oferece aplicação Hydro e resistência a interrupção, mas exige ataques normais para ativar o Supremo' }] },
    ],
  },
  {
    id: 'ayaka-freeze', title: 'Ayaka · Congelamento acessível', subtitle: 'Congela inimigos e concentra o dano no Supremo', difficulty: 'Acessível', priority: 11, tags: ['Congelamento', 'Cryo', 'Acessível'],
    explanation: 'Hydro mantém inimigos congelados para o Supremo de Ayaka; Diona oferece bateria Cryo, escudo e cura, enquanto Sucrose agrupa e reduz RES com Sombra Verde.',
    sources: [{ label: 'Ayaka · KQM', url: 'https://keqingmains.com/q/ayaka-quickguide/' }],
    slots: [
      { characterId: 'enka_10000002', role: 'DPS Cryo em campo', alternatives: [] },
      { characterId: 'xingqiu', role: 'Aplicação Hydro', alternatives: [{ characterId: 'barbara', reason: 'mantém Hydro e cura, com aplicação menos constante' }, { characterId: 'enka_10000041', reason: 'oferece Hydro e bônus de dano, mas exige cuidado com a cura' }] },
      { characterId: 'diona', role: 'Bateria Cryo, escudo e cura', alternatives: [{ characterId: 'rosaria', reason: 'oferece dano e partículas Cryo, sem escudo ou cura' }, { characterId: 'enka_10000112', reason: 'Escoffier reduz RES Cryo/Hydro e cura, mas não oferece escudo' }] },
      { characterId: 'sucrose', role: 'Agrupamento e redução de RES', alternatives: [{ characterId: 'enka_10000022', reason: 'Venti agrupa inimigos e recupera energia contra grupos' }, { characterId: 'enka_10000047', reason: 'Kazuha oferece agrupamento e bônus de dano Cryo' }] },
    ],
  },
  {
    id: 'ganyu-melt', title: 'Ganyu · Fusão reversa', subtitle: 'Disparos carregados amplificados por Pyro', difficulty: 'Intermediário', priority: 12, tags: ['Fusão', 'Pyro', 'Dano carregado'],
    explanation: 'Xiangling mantém Pyro para Ganyu ativar Fusão nos dois impactos do disparo carregado; Bennett fortalece e cura, e Zhongli protege contra interrupção.',
    sources: [{ label: 'Ganyu · KQM', url: 'https://keqingmains.com/q/ganyu-quickguide/' }],
    slots: [
      { characterId: 'enka_10000037', role: 'DPS Cryo em campo', alternatives: [] },
      { characterId: 'xiangling', role: 'Aplicação Pyro fora de campo', alternatives: [{ characterId: 'enka_10000079', reason: 'Dehya oferece Pyro e proteção, com aplicação e dano diferentes' }] },
      { characterId: 'bennett', role: 'Bônus de ATQ e cura', alternatives: [] },
      { characterId: 'enka_10000030', role: 'Escudo e redução de RES', alternatives: [{ characterId: 'enka_10000107', reason: 'Citlali oferece escudo e bônus contra inimigos afetados por Pyro' }] },
    ],
  },
  {
    id: 'keqing-aggravate', title: 'Keqing · Agravamento', subtitle: 'Quicken com ataques Electro rápidos', difficulty: 'Intermediário', priority: 13, tags: ['Agravamento', 'Dendro', 'Electro'],
    explanation: 'Fischl é o núcleo de dano Electro fora de campo; Nahida mantém Dendro e Kazuha agrupa, espalha Electro e reduz RES. A equipe não tem cura ou escudo nesta versão.',
    sources: [{ label: 'Keqing · KQM', url: 'https://keqingmains.com/q/keqing-quickguide/' }],
    slots: [
      { characterId: 'enka_10000042', role: 'DPS Electro em campo', alternatives: [] },
      { characterId: 'fischl', role: 'Dano Electro fora de campo e bateria', alternatives: [{ characterId: 'enka_10000056', reason: 'Sara oferece bônus de ATQ; sua melhor versão para Keqing exige C6' }] },
      { characterId: 'enka_10000073', role: 'Aplicação Dendro', alternatives: [{ characterId: 'collei', reason: 'mantém Dendro com cobertura e duração menores' }, { characterId: 'yaoyao', reason: 'oferece Dendro e cura, com aplicação diferente' }] },
      { characterId: 'enka_10000047', role: 'Agrupamento e bônus Electro', alternatives: [{ characterId: 'sucrose', reason: 'oferece Proficiência Elemental e redução de RES' }, { characterId: 'enka_10000103', reason: 'Xilonen reduz RES e oferece cura, sem agrupamento' }] },
    ],
  },
  {
    id: 'nilou-bloom', title: 'Nilou · Florescimento abundante', subtitle: 'Núcleos Dendro fortalecidos por Nilou', difficulty: 'Acessível', priority: 14, tags: ['Florescimento', 'Hydro', 'Dendro', 'Acessível'],
    explanation: 'Nilou exige que a equipe use apenas Hydro e Dendro para habilitar Florescimento abundante. Barbara dirige em campo e cura o dano dos núcleos; Nahida e Collei mantêm Dendro.',
    sources: [{ label: 'Nilou · KQM', url: 'https://keqingmains.com/q/nilou-quickguide/' }],
    slots: [
      { characterId: 'enka_10000070', role: 'Bônus de Florescimento', alternatives: [] },
      { characterId: 'barbara', role: 'Hydro em campo e cura', alternatives: [{ characterId: 'enka_10000054', reason: 'Kokomi aplica Hydro em campo e cura com mais consistência' }] },
      { characterId: 'enka_10000073', role: 'Aplicação Dendro', alternatives: [{ characterId: 'collei', reason: 'aplica Dendro fora de campo e é acessível' }, { characterId: 'yaoyao', reason: 'oferece Dendro e cura adicional' }] },
      { characterId: 'collei', role: 'Aplicação Dendro fora de campo', alternatives: [{ characterId: 'enka_10000082', reason: 'Baizhu oferece Dendro e proteção, mas reduz a aplicação fora de campo' }, { characterId: 'yaoyao', reason: 'oferece Dendro e cura' }] },
    ],
  },
  {
    id: 'alhaitham-quickbloom', title: 'Alhaitham · Florescimento acelerado', subtitle: 'Propagação e Hiperflorescimento com cura', difficulty: 'Intermediário', priority: 15, tags: ['Quickbloom', 'Propagação', 'Hiperflorescimento'],
    explanation: 'Alhaitham ativa Propagação em campo; Xingqiu cria núcleos e Kuki os ativa com Electro enquanto cura. Nahida melhora a aplicação Dendro e a ressonância da equipe.',
    sources: [
      { label: 'Alhaitham · KQM', url: 'https://keqingmains.com/q/alhaitham-quickguide/' },
      { label: 'Kuki Shinobu · KQM', url: 'https://keqingmains.com/q/shinobu-quickguide/' },
    ],
    slots: [
      { characterId: 'enka_10000078', role: 'DPS Dendro em campo', alternatives: [] },
      { characterId: 'kuki', role: 'Ativação Electro e cura', alternatives: [] },
      { characterId: 'xingqiu', role: 'Aplicação Hydro e proteção', alternatives: [{ characterId: 'enka_10000060', reason: 'Yelan oferece dano e bônus, com menos resistência a interrupção' }] },
      { characterId: 'enka_10000073', role: 'Aplicação Dendro e suporte', alternatives: [{ characterId: 'enka_10000082', reason: 'Baizhu oferece cura e proteção, com menos dano Dendro fora de campo' }, { characterId: 'collei', reason: 'oferece Dendro fora de campo sem cura' }] },
    ],
  },
  {
    id: 'tighnari-spread', title: 'Tighnari · Propagação', subtitle: 'Dano Dendro em rotações curtas', difficulty: 'Intermediário', priority: 16, tags: ['Propagação', 'Dendro', 'Electro'],
    explanation: 'Tighnari entra em campo em janelas curtas para ativar Propagação; Yae e Fischl aplicam Electro e causam dano fora de campo. Zhongli protege e reduz RES.',
    sources: [{ label: 'Tighnari · KQM', url: 'https://keqingmains.com/tighnari/' }],
    slots: [
      { characterId: 'enka_10000069', role: 'DPS Dendro em rotações curtas', alternatives: [] },
      { characterId: 'enka_10000058', role: 'Dano Electro fora de campo', alternatives: [{ characterId: 'fischl', reason: 'oferece dano Electro e partículas com menos tempo de preparação' }] },
      { characterId: 'fischl', role: 'Aplicação Electro e bateria', alternatives: [{ characterId: 'enka_10000052', reason: 'Raiden oferece dano Electro fora de campo, mas sua habilidade tem menos sinergia com Propagação' }] },
      { characterId: 'enka_10000030', role: 'Escudo e redução de RES', alternatives: [{ characterId: 'enka_10000082', reason: 'Baizhu oferece cura e bônus para reações Dendro' }, { characterId: 'enka_10000073', reason: 'Nahida aumenta o dano Dendro e a ressonância' }] },
    ],
  },
  {
    id: 'cyno-quickbloom', title: 'Cyno · Florescimento acelerado', subtitle: 'Hiperflorescimento em uma janela longa de Supremo', difficulty: 'Intermediário', priority: 17, tags: ['Quickbloom', 'Hiperflorescimento', 'Dendro'],
    explanation: 'Nahida aplica Dendro e Xingqiu gera núcleos durante o Supremo prolongado de Cyno. Baizhu adiciona cura, proteção e Dendro para manter melhor a equipe em várias ondas.',
    sources: [{ label: 'Cyno · KQM', url: 'https://keqingmains.com/q/cyno-quickguide/' }],
    slots: [
      { characterId: 'enka_10000071', role: 'DPS Electro em campo', alternatives: [] },
      { characterId: 'enka_10000073', role: 'Aplicação Dendro', alternatives: [{ characterId: 'collei', reason: 'opção acessível de Dendro fora de campo, com menor duração' }] },
      { characterId: 'xingqiu', role: 'Aplicação Hydro e resistência a interrupção', alternatives: [{ characterId: 'enka_10000060', reason: 'Yelan oferece dano e bônus, com menos proteção contra interrupção' }] },
      { characterId: 'enka_10000082', role: 'Dendro, cura e proteção', alternatives: [{ characterId: 'kuki', reason: 'oferece cura e Electro, mas não estende Dendro para novas ondas' }, { characterId: 'enka_10000030', reason: 'oferece escudo e redução universal de RES' }] },
    ],
  },
  {
    id: 'neuvillette-hypercarry', title: 'Neuvillette · Hiper-Carregador', subtitle: 'Bônus de dano e proteção durante o Ataque Carregado', difficulty: 'Intermediário', priority: 18, tags: ['Hydro', 'Hiper-Carregador'],
    explanation: 'Furina fortalece o dano Hydro, Kazuha reduz RES e agrupa, e Zhongli protege Neuvillette contra interrupções. Hydro e Geo limitam a variedade de reações da passiva de Neuvillette; a equipe compensa com bônus e segurança.',
    sources: [{ label: 'Neuvillette · KQM', url: 'https://keqingmains.com/q/neuvillette-quickguide/' }],
    slots: [
      { characterId: 'enka_10000087', role: 'DPS Hydro em campo', alternatives: [] },
      { characterId: 'enka_10000089', role: 'Bônus de dano e Hydro fora de campo', alternatives: [{ characterId: 'enka_10000041', reason: 'Mona oferece bônus de dano em uma janela menor' }] },
      { characterId: 'enka_10000047', role: 'Redução de RES e agrupamento', alternatives: [{ characterId: 'sucrose', reason: 'pode carregar Sombra Verde e oferecer controle de grupo' }, { characterId: 'enka_10000103', reason: 'Xilonen reduz RES e cura, mas não agrupa inimigos' }] },
      { characterId: 'enka_10000030', role: 'Escudo e resistência a interrupção', alternatives: [{ characterId: 'enka_10000108', reason: 'Lan Yan oferece escudo Anemo e pode carregar Sombra Verde' }, { characterId: 'enka_10000082', reason: 'Baizhu oferece cura e proteção contra interrupção' }] },
    ],
  },
  {
    id: 'navia-double-geo', title: 'Navia · Geo e Pyro', subtitle: 'Cristalização, ressonância Geo e dano em rajadas', difficulty: 'Intermediário', priority: 19, tags: ['Cristalização', 'Geo', 'Pyro'],
    explanation: 'Zhongli gera ressonância Geo e reduz RES; Xiangling aplica Pyro para criar fragmentos de Cristalização, enquanto Bennett fortalece e cura Navia.',
    sources: [{ label: 'Navia · KQM', url: 'https://keqingmains.com/q/navia-quickguide/' }],
    slots: [
      { characterId: 'enka_10000091', role: 'DPS Geo em campo', alternatives: [] },
      { characterId: 'enka_10000030', role: 'Geo, escudo e redução de RES', alternatives: [{ characterId: 'enka_10000094', reason: 'Chiori oferece dano Geo fora de campo, mas não substitui o escudo de Zhongli' }, { characterId: 'enka_10000038', reason: 'Albedo oferece dano Geo fora de campo e partículas' }] },
      { characterId: 'xiangling', role: 'Dano Pyro fora de campo', alternatives: [{ characterId: 'enka_10000079', reason: 'Dehya oferece Pyro e resistência a interrupção, com menos dano' }] },
      { characterId: 'bennett', role: 'Bônus de ATQ e cura', alternatives: [{ characterId: 'enka_10000089', reason: 'Furina oferece bônus de dano, mas precisa de cura consistente para acumular Fanfare' }] },
    ],
  },
  {
    id: 'arlecchino-vaporize', title: 'Arlecchino · Vaporização', subtitle: 'Hydro fora de campo e proteção para atacar', difficulty: 'Intermediário', priority: 20, tags: ['Vaporização', 'Pyro', 'Escudo'],
    explanation: 'Xingqiu habilita Vaporização e oferece resistência a interrupção. Bennett fortalece Arlecchino, que não pode receber cura de aliados durante o combate; Zhongli fornece proteção por escudo.',
    sources: [{ label: 'Arlecchino · KQM', url: 'https://keqingmains.com/q/arlecchino-quickguide/' }],
    slots: [
      { characterId: 'enka_10000096', role: 'DPS Pyro em campo', alternatives: [] },
      { characterId: 'xingqiu', role: 'Aplicação Hydro e proteção', alternatives: [{ characterId: 'enka_10000060', reason: 'Yelan oferece dano e bônus de dano, com menos resistência a interrupção' }] },
      { characterId: 'bennett', role: 'Bônus de ATQ', alternatives: [{ characterId: 'enka_10000056', reason: 'Sara é uma alternativa de bônus de ATQ, especialmente em C6' }] },
      { characterId: 'enka_10000030', role: 'Escudo e redução de RES', alternatives: [{ characterId: 'enka_10000108', reason: 'Lan Yan oferece escudo e pode carregar Sombra Verde' }] },
    ],
  },
  {
    id: 'xiao-plunge', title: 'Xiao · Mergulhos', subtitle: 'Buffs Anemo, cura e bônus para ataques de mergulho', difficulty: 'Intermediário', priority: 21, tags: ['Anemo', 'Mergulho', 'Hiper-Carregador'],
    explanation: 'Faruzan fortalece o dano Anemo e gera energia; Xianyun aumenta o dano dos mergulhos e cura o grupo para acumular o bônus de Furina.',
    sources: [{ label: 'Xianyun · KQM', url: 'https://keqingmains.com/q/xianyun-quickguide/' }],
    slots: [
      { characterId: 'enka_10000026', role: 'DPS Anemo em campo', alternatives: [] },
      { characterId: 'enka_10000076', role: 'Bônus Anemo e bateria', alternatives: [{ characterId: 'enka_10000047', reason: 'Kazuha agrupa inimigos, mas não oferece os mesmos bônus Anemo de Faruzan' }] },
      { characterId: 'enka_10000093', role: 'Bônus para mergulho e cura', alternatives: [{ characterId: 'enka_10000003', reason: 'Jean cura e reduz RES em C4, mas não fortalece mergulhos' }] },
      { characterId: 'enka_10000089', role: 'Bônus de dano e dano Hydro', alternatives: [{ characterId: 'enka_10000030', reason: 'Zhongli oferece escudo e redução universal de RES, sem o bônus de Furina' }] },
    ],
  },
  {
    id: 'itto-mono-geo', title: 'Itto · Mono Geo', subtitle: 'Gorou fortalece a equipe Geo e Zhongli protege', difficulty: 'Intermediário', priority: 22, tags: ['Geo', 'Mono Geo', 'Escudo'],
    explanation: 'Gorou fortalece personagens Geo focados em DEF; três personagens Geo ativam seu bônus completo. Zhongli protege e reduz RES, enquanto Albedo causa dano fora de campo.',
    sources: [{ label: 'Itto · KQM', url: 'https://keqingmains.com/q/itto-quickguide/' }],
    slots: [
      { characterId: 'enka_10000057', role: 'DPS Geo em campo', alternatives: [{ characterId: 'noelle', reason: 'Noelle pode ocupar o campo, oferecer escudo e cura, com menor dano Geo fora de campo' }] },
      { characterId: 'enka_10000055', role: 'Bônus Geo e bateria', alternatives: [] },
      { characterId: 'enka_10000038', role: 'Dano Geo fora de campo', alternatives: [{ characterId: 'enka_10000094', reason: 'Chiori oferece dano Geo fora de campo; sua habilidade depende da ordem de personagens' }] },
      { characterId: 'enka_10000030', role: 'Escudo e redução de RES', alternatives: [{ characterId: 'enka_10000100', reason: 'Kachina oferece dano Geo e pode ativar bônus de pergaminho, sem escudo forte' }] },
    ],
  },
  {
    id: 'lyney-mono-pyro', title: 'Lyney · Mono Pyro', subtitle: 'Bônus Pyro e aplicação fora de campo', difficulty: 'Intermediário', priority: 23, tags: ['Pyro', 'Mono Pyro', 'Dano carregado'],
    explanation: 'Lyney ganha vantagem com aliados Pyro; Bennett fortalece e cura, Xiangling acrescenta dano fora de campo e Kazuha agrupa e reduz RES Pyro.',
    sources: [{ label: 'Lyney · KQM', url: 'https://keqingmains.com/q/lyney-quickguide/' }],
    slots: [
      { characterId: 'enka_10000084', role: 'DPS Pyro em campo', alternatives: [] },
      { characterId: 'bennett', role: 'Bônus de ATQ, cura e Pyro', alternatives: [] },
      { characterId: 'xiangling', role: 'Dano Pyro fora de campo', alternatives: [{ characterId: 'enka_10000079', reason: 'Dehya oferece proteção e Pyro fora de campo, com menos dano' }] },
      { characterId: 'enka_10000047', role: 'Agrupamento e redução de RES', alternatives: [{ characterId: 'sucrose', reason: 'oferece agrupamento e redução de RES com Sombra Verde' }, { characterId: 'enka_10000108', reason: 'Lan Yan oferece escudo e redução de RES com Sombra Verde' }] },
    ],
  },
  {
    id: 'yoimiya-vaporize', title: 'Yoimiya · Vaporização', subtitle: 'Ataques normais fortalecidos e proteção', difficulty: 'Intermediário', priority: 24, tags: ['Vaporização', 'Pyro', 'Escudo'],
    explanation: 'Yelan habilita Vaporização nos ataques normais de Yoimiya e aumenta o dano; Bennett fortalece e cura, enquanto Zhongli evita interrupções durante a sequência.',
    sources: [{ label: 'Yoimiya · KQM', url: 'https://keqingmains.com/q/yoimiya-quickguide/' }],
    slots: [
      { characterId: 'enka_10000049', role: 'DPS Pyro em campo', alternatives: [] },
      { characterId: 'enka_10000060', role: 'Aplicação Hydro e bônus de dano', alternatives: [{ characterId: 'xingqiu', reason: 'oferece aplicação Hydro mais forte e redução de dano' }] },
      { characterId: 'bennett', role: 'Bônus de ATQ e cura', alternatives: [{ characterId: 'enka_10000064', reason: 'Yun Jin fortalece ataques normais e ativa ressonância Geo com Zhongli' }] },
      { characterId: 'enka_10000030', role: 'Escudo e resistência a interrupção', alternatives: [{ characterId: 'enka_10000108', reason: 'Lan Yan oferece escudo Anemo e redução de RES com Sombra Verde' }] },
    ],
  },
  {
    id: 'mavuika-melt', title: 'Mavuika · Fusão', subtitle: 'Cryo habilita Fusão e suportes acumulam Espírito de Luta', difficulty: 'Intermediário', priority: 25, tags: ['Fusão', 'Pyro', 'Nightsoul'],
    explanation: 'Citlali habilita Fusão e ajuda a acumular Espírito de Luta. Bennett fortalece Mavuika; Xilonen reduz RES e dá bônus elemental. A variação com Sucrose troca parte do dano por Proficiência Elemental e agrupamento.',
    sources: [{ label: 'Mavuika · KQM', url: 'https://keqingmains.com/q/mavuika-quickguide/' }],
    slots: [
      { characterId: 'enka_10000106', role: 'DPS Pyro em campo', alternatives: [] },
      { characterId: 'enka_10000107', role: 'Aplicação Cryo, escudo e suporte', alternatives: [{ characterId: 'rosaria', reason: 'a opção mais acessível exige C2 para manter aplicação Cryo semelhante' }] },
      { characterId: 'enka_10000103', role: 'Redução de RES e bônus elemental', alternatives: [{ characterId: 'sucrose', reason: 'oferece Proficiência Elemental e agrupamento, mas menos redução de RES' }, { characterId: 'enka_10000047', reason: 'Kazuha agrupa e fornece bônus de dano elemental' }] },
      { characterId: 'bennett', role: 'Bônus de ATQ e Pyro', alternatives: [] },
    ],
  },
  {
    id: 'mualani-vaporize', title: 'Mualani · Vaporização', subtitle: 'Ataques Hydro amplificados por Pyro', difficulty: 'Intermediário', priority: 26, tags: ['Vaporização', 'Hydro', 'Natlan'],
    explanation: 'Xiangling mantém Pyro para Mualani vaporizar os ataques da habilidade; Kazuha espalha Hydro e Pyro, e Zhongli protege sem ocupar muito tempo em campo.',
    sources: [{ label: 'Mualani · KQM', url: 'https://keqingmains.com/q/mualani-quickguide/' }],
    slots: [
      { characterId: 'enka_10000102', role: 'DPS Hydro em campo', alternatives: [] },
      { characterId: 'xiangling', role: 'Aplicação Pyro fora de campo', alternatives: [{ characterId: 'enka_10000106', reason: 'Mavuika oferece Pyro fora de campo e bônus, mas divide o recurso Espírito de Luta' }] },
      { characterId: 'enka_10000047', role: 'Agrupamento e redução de RES', alternatives: [{ characterId: 'sucrose', reason: 'oferece Proficiência Elemental e redução de RES com Sombra Verde' }, { characterId: 'enka_10000103', reason: 'Xilonen oferece redução de RES e bônus elemental' }] },
      { characterId: 'enka_10000030', role: 'Escudo e redução de RES', alternatives: [{ characterId: 'enka_10000107', reason: 'Citlali oferece escudo e bônus Hydro, mas Cryo pode atrapalhar a aura Pyro' }] },
    ],
  },
  {
    id: 'clorinde-aggravate', title: 'Clorinde · Agravamento', subtitle: 'Fischl e Nahida reforçam as reações Electro e Dendro', difficulty: 'Intermediário', priority: 27, tags: ['Agravamento', 'Dendro', 'Electro'],
    explanation: 'Fischl aproveita os ataques rápidos de Clorinde; Nahida mantém Dendro para Agravamento e Kazuha agrupa inimigos e reduz RES Electro.',
    sources: [{ label: 'Clorinde · KQM', url: 'https://keqingmains.com/q/clorinde-quickguide/' }],
    slots: [
      { characterId: 'enka_10000098', role: 'DPS Electro em campo', alternatives: [] },
      { characterId: 'fischl', role: 'Dano Electro fora de campo', alternatives: [{ characterId: 'enka_10000058', reason: 'Yae Miko oferece dano Electro fora de campo, com mais tempo de preparação' }] },
      { characterId: 'enka_10000073', role: 'Aplicação Dendro', alternatives: [{ characterId: 'collei', reason: 'oferece Dendro fora de campo com duração menor' }, { characterId: 'enka_10000082', reason: 'Baizhu oferece cura e proteção, com menos aplicação Dendro' }] },
      { characterId: 'enka_10000047', role: 'Agrupamento e redução de RES', alternatives: [{ characterId: 'sucrose', reason: 'oferece Proficiência Elemental e redução de RES' }, { characterId: 'enka_10000103', reason: 'Xilonen oferece redução de RES e cura' }] },
    ],
  },
  {
    id: 'kinich-burning', title: 'Kinich · Queimadura', subtitle: 'Pyro fora de campo mantém Queimadura para Kinich', difficulty: 'Intermediário', priority: 28, tags: ['Queimadura', 'Dendro', 'Pyro'],
    explanation: 'Emilie aproveita Queimadura e causa dano fora de campo; Mavuika aplica Pyro sem exigir tempo em campo e Bennett fortalece e cura Kinich.',
    sources: [{ label: 'Kinich · KQM', url: 'https://keqingmains.com/q/kinich-quickguide/' }],
    slots: [
      { characterId: 'enka_10000101', role: 'DPS Dendro em campo', alternatives: [] },
      { characterId: 'enka_10000106', role: 'Pyro fora de campo e bônus', alternatives: [{ characterId: 'xiangling', reason: 'aplica Pyro continuamente, mas exige mais recarga de energia' }, { characterId: 'enka_10000079', reason: 'Dehya oferece Pyro fora de campo e resistência a interrupção' }] },
      { characterId: 'enka_10000099', role: 'Dano Dendro fora de campo', alternatives: [{ characterId: 'enka_10000082', reason: 'Baizhu oferece Dendro, cura e proteção com menor dano fora de campo' }, { characterId: 'yaoyao', reason: 'oferece Dendro e cura, com menor dano' }] },
      { characterId: 'bennett', role: 'Bônus de ATQ e cura', alternatives: [{ characterId: 'enka_10000110', reason: 'Iansan oferece bônus de dano e mobilidade, sem a cura de Bennett' }] },
    ],
  },
];

export const elementNames = { Pyro: 'Pyro', Hydro: 'Hydro', Anemo: 'Anemo', Electro: 'Electro', Cryo: 'Cryo', Geo: 'Geo', Dendro: 'Dendro' };
