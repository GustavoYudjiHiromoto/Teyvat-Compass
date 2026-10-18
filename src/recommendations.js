import { characters } from './data.js';

const getCharacter = (id) => characters.find((character) => character.id === id);

const reactionRules = [
  { elements: ['Pyro', 'Hydro'], name: 'Vaporização' },
  { elements: ['Pyro', 'Cryo'], name: 'Fusão' },
  { elements: ['Hydro', 'Cryo'], name: 'Congelamento' },
  { elements: ['Electro', 'Hydro'], name: 'Eletrocarregado' },
  { elements: ['Electro', 'Cryo'], name: 'Supercondutor' },
  { elements: ['Electro', 'Pyro'], name: 'Sobrecarga' },
  { elements: ['Dendro', 'Electro'], name: 'Aceleração (Quicken)' },
  { elements: ['Dendro', 'Hydro'], name: 'Florescimento' },
  { elements: ['Dendro', 'Pyro'], name: 'Queimadura' },
];

export function getTeamReactionOpportunities(lineup) {
  const elements = new Set(lineup.filter(Boolean).map(({ character }) => character?.element).filter(Boolean));
  const reactions = reactionRules
    .filter(({ elements: pair }) => pair.every((element) => elements.has(element)))
    .map(({ name }) => name);

  if (elements.has('Dendro') && elements.has('Hydro') && elements.has('Electro')) reactions.push('Hiperflorescimento (Electro nos núcleos)');
  if (elements.has('Dendro') && elements.has('Hydro') && elements.has('Pyro')) reactions.push('Burgeon (Pyro nos núcleos)');
  if (elements.has('Dendro') && elements.has('Electro')) reactions.push('Agravamento / Propagação (ataques na aura Quicken)');
  if (elements.has('Anemo') && ['Pyro', 'Hydro', 'Electro', 'Cryo'].some((element) => elements.has(element))) reactions.push('Redemoinho');
  if (elements.has('Geo') && ['Pyro', 'Hydro', 'Electro', 'Cryo'].some((element) => elements.has(element))) reactions.push('Cristalização');

  return reactions;
}

export function evaluateTeam(team, roster, focusCharacterId = null, slotPreferences = {}) {
  let best = { lineup: [], coveredCount: -1, coreCount: -1, includesFocus: false };

  function chooseSlot(index, usedIds, lineup, coveredCount, coreCount) {
    if (index === team.slots.length) {
      const includesFocus = focusCharacterId
        ? lineup.some((selection) => selection?.characterId === focusCharacterId)
        : false;
      if (
        (focusCharacterId && includesFocus && !best.includesFocus)
        || (includesFocus === best.includesFocus && (
          coveredCount > best.coveredCount
          || (coveredCount === best.coveredCount && coreCount > best.coreCount)
        ))
      ) {
        best = { lineup, coveredCount, coreCount, includesFocus };
      }
      return;
    }

    const slot = team.slots[index];
    const slotOptions = [
      { characterId: slot.characterId, kind: 'main' },
      ...slot.alternatives.map((alternative) => ({ ...alternative, kind: 'alternative' })),
    ];
    const preference = slotPreferences[index];
    const selectedOption = slotOptions.find((option) => option.characterId === preference);
    const options = preference
      ? [selectedOption || { characterId: preference, kind: 'custom', reason: 'Escolha manual; compatibilidade não avaliada' }]
      : slotOptions;

    for (const option of options) {
      if (!roster.includes(option.characterId) || usedIds.has(option.characterId)) continue;
      const nextUsedIds = new Set(usedIds);
      nextUsedIds.add(option.characterId);
      chooseSlot(
        index + 1,
        nextUsedIds,
        [...lineup, { ...option, character: getCharacter(option.characterId), slot }],
        coveredCount + 1,
        coreCount + (option.kind === 'main' ? 1 : 0),
      );
    }

    chooseSlot(index + 1, usedIds, [...lineup, null], coveredCount, coreCount);
  }

  chooseSlot(0, new Set(), [], 0, 0);

  return {
    ...best,
    alternativeCount: best.coveredCount - best.coreCount,
    missingCount: team.slots.length - best.coveredCount,
  };
}
