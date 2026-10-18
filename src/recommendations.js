import { characters } from './data.js';

const getCharacter = (id) => characters.find((character) => character.id === id);

export function evaluateTeam(team, roster, focusCharacterId = null) {
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
    const options = [
      { characterId: slot.characterId, kind: 'main' },
      ...slot.alternatives.map((alternative) => ({ ...alternative, kind: 'alternative' })),
    ];

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
