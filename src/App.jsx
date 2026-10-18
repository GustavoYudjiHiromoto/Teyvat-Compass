import { useEffect, useMemo, useState } from 'react';
import { characters, teams } from './data.js';
import { evaluateTeam } from './recommendations.js';
import { builds, buildSourceName } from './builds.js';
import { isSupabaseConfigured, supabase } from './lib/supabase.js';
import { enkaAvatarToCharacter, getEnkaCache, saveEnkaCache } from './enka.js';

const STORAGE_KEY = 'teyvat-compass-roster-v1';
const WEAPON_STORAGE_KEY = 'teyvat-compass-weapons-v1';
const ENKA_SHOWCASE_STORAGE_KEY = 'teyvat-compass-showcase-v1';
const GOALS_STORAGE_KEY = 'teyvat-compass-goals-v1';
const LOCAL_PROFILE_OWNER_KEY = 'teyvat-compass-profile-owner-v1';
const readRoster = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};
const readOwnedWeapons = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(WEAPON_STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};
const readEnkaShowcase = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(ENKA_SHOWCASE_STORAGE_KEY));
    return saved && Array.isArray(saved.avatars) ? saved : null;
  } catch {
    return null;
  }
};
const readGoals = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(GOALS_STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};
const pageFromHash = (hash) => {
  if (hash === '#characters' || hash === '#character-library') return 'Personagens';
  if (hash === '#builds') return 'Builds';
  return 'Meu plano';
};

function CompassMark({ small = false }) {
  return <span className={`compass-mark${small ? ' compass-mark--small' : ''}`} aria-hidden="true"><i>✦</i></span>;
}

function CharacterToken({ character, compact = false }) {
  if (!character) {
    return <div className={`character-token character-token--missing${compact ? ' character-token--compact' : ''}`} aria-label="Posição vaga"><span className="token-initials">?</span></div>;
  }

  return (
    <div
      className={`character-token${compact ? ' character-token--compact' : ''}`}
      style={{ '--character-color': character.color }}
      title={`${character.name} · ${character.element}`}
      aria-label={character.name}
    >
      <span className="token-initials">{character.initials}</span>
      <span className="token-element">{character.element === 'Electro' ? 'ϟ' : character.element === 'Pyro' ? '♨' : character.element === 'Hydro' ? '◌' : character.element === 'Cryo' ? '❄' : character.element === 'Anemo' ? '〰' : '◇'}</span>
    </div>
  );
}

function AccountMenu({ session, profileStatus, profileFeedback }) {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const result = mode === 'signup'
        ? await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: { emailRedirectTo: window.location.origin },
          })
        : await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (result.error) throw result.error;
      if (mode === 'signup' && !result.data.session) {
        setMessage('Conta criada. Confira seu e-mail para confirmar e depois entre.');
      } else {
        setMessage(mode === 'signup' ? 'Conta criada.' : 'Login realizado.');
      }
      setPassword('');
    } catch (authError) {
      setError(authError.message || 'Não foi possível concluir a autenticação.');
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    setBusy(true);
    setError('');
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      setMessage('Você saiu da conta.');
    } catch (authError) {
      setError(authError.message || 'Não foi possível sair da conta.');
    } finally {
      setBusy(false);
    }
  };

  const statusText = {
    local: 'Os dados ficam neste navegador.',
    loading: 'Carregando seus dados da nuvem…',
    migrating: 'Salvando seu elenco e armas na conta…',
    saving: 'Sincronizando alteração…',
    synced: 'Dados sincronizados com sua conta.',
    error: 'Não foi possível sincronizar os dados.',
  }[profileStatus] || 'Sincronização pendente.';

  return (
    <details className="account-menu">
      <summary className="local-profile"><span className="profile-glyph">✦</span><span>{session?.user?.email || 'Modo local'}</span><span className="profile-chevron">⌄</span></summary>
      <div className="account-panel">
        {session?.user ? <>
          <strong>Conta conectada</strong>
          <p className={profileStatus === 'error' ? 'account-error' : 'account-status'}>{profileFeedback || statusText}</p>
          <button className="account-submit account-signout" onClick={signOut} disabled={busy || profileStatus === 'saving' || profileStatus === 'migrating'}>{profileStatus === 'saving' || profileStatus === 'migrating' ? 'Sincronizando…' : 'Sair da conta'}</button>
        </> : <>
          <strong>Salvar em vários dispositivos</strong>
          {!isSupabaseConfigured ? <>
            <p>O login precisa de um projeto Supabase configurado para guardar seus dados com segurança.</p>
            <a className="account-setup-link" href="https://supabase.com/dashboard/projects" target="_blank" rel="noreferrer">Abrir Supabase ↗</a>
          </> : <>
            <div className="account-tabs"><button type="button" className={mode === 'signin' ? 'selected' : ''} onClick={() => { setMode('signin'); setMessage(''); setError(''); }}>Entrar</button><button type="button" className={mode === 'signup' ? 'selected' : ''} onClick={() => { setMode('signup'); setMessage(''); setError(''); }}>Criar conta</button></div>
            <form className="account-form" onSubmit={submit}>
              <label>E-mail<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
              <label>Senha<input type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={mode === 'signup' ? 8 : undefined} value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
              <button className="account-submit" type="submit" disabled={busy}>{busy ? 'Aguarde…' : mode === 'signup' ? 'Criar conta' : 'Entrar'}</button>
            </form>
          </>}
        </>}
        {message && <p className="account-status" role="status">{message}</p>}
        {error && <p className="account-error" role="alert">{error}</p>}
      </div>
    </details>
  );
}

function TeamCard({ team, roster, evaluation, onEditRoster, onOpenBuilds }) {
  const complete = evaluation.coveredCount === team.slots.length;
  const missingSlots = team.slots.filter((slot, index) => !evaluation.lineup[index]);
  const assignedIds = new Set(evaluation.lineup.filter(Boolean).map((selection) => selection.characterId));
  const statusLabel = !roster.length
    ? team.difficulty
    : complete && evaluation.alternativeCount === 0
      ? 'Time completo'
      : complete
        ? `Completo · ${evaluation.alternativeCount} substituto${evaluation.alternativeCount > 1 ? 's' : ''}`
        : `${evaluation.coveredCount}/${team.slots.length} posições`;

  return (
    <article className={`team-card${complete && roster.length ? ' team-card--match' : ''}`}>
      <div className="team-card-top">
        <div className="team-mark"><CompassMark small /></div>
        <span className={`match-pill${complete && roster.length ? ' match-pill--good' : ''}`}>{statusLabel}</span>
      </div>
      <div className="team-title-row"><h3>{team.title}</h3><span className="team-arrow">↗</span></div>
      <p className="team-subtitle">{team.subtitle}</p>
      <div className="team-tags">{team.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
      <div className="team-lineup">
        {team.slots.map((slot, index) => {
          const selection = evaluation.lineup[index];
          const character = selection?.character;
          return (
            <div className="lineup-slot" key={`${team.id}-${index}`}>
              <CharacterToken character={character} compact />
              <span className="slot-name">{character?.name || getCharacter(slot.characterId)?.name}</span>
              <span className="slot-role">{slot.role}</span>
              {selection?.kind === 'alternative' && <span className="slot-note">substitui {getCharacter(slot.characterId)?.name}</span>}
              {!selection && roster.length > 0 && <span className="slot-note slot-note--missing">posição em falta</span>}
              {index < team.slots.length - 1 && <span className="lineup-plus">+</span>}
            </div>
          );
        })}
      </div>
      <button className="team-build-action" type="button" onClick={onOpenBuilds}>Ver recomendações de build <span>→</span></button>
      <div className="team-explanation">
        <span className="explanation-icon">✧</span>
        <div>
          <strong>Por que funciona</strong><p>{team.explanation}</p>
          {evaluation.lineup.some((selection) => selection?.kind === 'alternative') && <ul className="swap-reasons">
            {evaluation.lineup.filter((selection) => selection?.kind === 'alternative').map((selection) => <li key={`${team.id}-${selection.characterId}`}><b>{selection.character.name}</b> no lugar de <b>{getCharacter(selection.slot.characterId)?.name}</b>: {selection.reason}.</li>)}
          </ul>}
          {missingSlots.length > 0 && roster.length > 0 && <p className="missing-options">Para completar: {missingSlots.map((slot) => {
            const options = slot.alternatives
              .filter((option) => !assignedIds.has(option.characterId))
              .map((option) => getCharacter(option.characterId)?.name)
              .filter(Boolean);
            return `${getCharacter(slot.characterId)?.name}${options.length ? ` (ou ${options.join(', ')})` : ''}`;
          }).join('; ')}.</p>}
        </div>
      </div>
      {roster.length > 0 && <div className="match-summary">{evaluation.coreCount} personagem{evaluation.coreCount === 1 ? '' : 's'} principal{evaluation.coreCount === 1 ? '' : 'is'} · {evaluation.alternativeCount} substituto{evaluation.alternativeCount === 1 ? '' : 's'} · {evaluation.missingCount} vaga{evaluation.missingCount === 1 ? '' : 's'}</div>}
      <button className="team-action" onClick={onEditRoster}>
        {missingSlots.length ? 'Ver opções para completar' : 'Editar meu elenco'} <span>→</span>
      </button>
    </article>
  );
}

const getCharacter = (id) => characters.find((character) => character.id === id);

function CharacterBuildCard({ character, build, ownedWeapons, onToggleWeapon, onAddToPlan, hasBuildGoal }) {
  return <article className="character-build">
    <div className="character-build-heading"><span style={{ '--character-color': character.color }}>{character.initials}</span><div><strong>{character.name}</strong><small>{build.style}</small></div></div>
    <div className="build-weapon-detail">
      <b>Armas recomendadas</b>
      <div className="weapon-options">
        {build.weapons
          .map((weapon, rank) => ({ weapon, rank, owned: ownedWeapons.includes(weapon) }))
          .sort((a, b) => Number(b.owned) - Number(a.owned) || a.rank - b.rank)
          .map(({ weapon, owned }) => <button key={weapon} className={`weapon-option${owned ? ' weapon-option--owned' : ''}`} aria-pressed={owned} onClick={() => onToggleWeapon(weapon)}>
            <span>{owned ? '✓ Tenho' : '+ Marcar'}</span>{weapon}
          </button>)}
      </div>
    </div>
    <div className="build-detail"><b>Artefatos</b><span>{build.artifacts.join(' · ')}</span></div>
    <div className="build-detail"><b>Atributos principais</b><span>{build.mainStats}</span></div>
    <div className="build-detail"><b>Subatributos</b><span>{build.substats}</span></div>
    <p className="build-note">{build.note}</p>
    <a className="build-source" href={build.source} target="_blank" rel="noreferrer">Fonte: {buildSourceName} ↗</a>
    <button className="build-plan-action" type="button" onClick={onAddToPlan} disabled={hasBuildGoal}>{hasBuildGoal ? '✓ Meta já está no Meu plano' : '＋ Acompanhar esta build no Meu plano'}</button>
  </article>;
}
const statLabels = {
  FIGHT_PROP_HP: 'Vida', FIGHT_PROP_ATTACK: 'ATQ', FIGHT_PROP_DEFENSE: 'DEF',
  FIGHT_PROP_HP_PERCENT: 'Vida%', FIGHT_PROP_ATTACK_PERCENT: 'ATQ%', FIGHT_PROP_DEFENSE_PERCENT: 'DEF%',
  FIGHT_PROP_CRITICAL: 'Taxa CRIT', FIGHT_PROP_CRITICAL_HURT: 'Dano CRIT',
  FIGHT_PROP_CHARGE_EFFICIENCY: 'Recarga de Energia', FIGHT_PROP_ELEMENT_MASTERY: 'Proficiência Elemental',
  FIGHT_PROP_HEAL_ADD: 'Bônus de Cura', FIGHT_PROP_PHYSICAL_ADD_HURT: 'Dano Físico',
  FIGHT_PROP_FIRE_ADD_HURT: 'Dano Pyro', FIGHT_PROP_ELEC_ADD_HURT: 'Dano Electro',
  FIGHT_PROP_WATER_ADD_HURT: 'Dano Hydro', FIGHT_PROP_WIND_ADD_HURT: 'Dano Anemo',
  FIGHT_PROP_ICE_ADD_HURT: 'Dano Cryo', FIGHT_PROP_ROCK_ADD_HURT: 'Dano Geo',
  FIGHT_PROP_GRASS_ADD_HURT: 'Dano Dendro',
};
const percentageProps = new Set([
  'FIGHT_PROP_HP_PERCENT', 'FIGHT_PROP_ATTACK_PERCENT', 'FIGHT_PROP_DEFENSE_PERCENT',
  'FIGHT_PROP_CRITICAL', 'FIGHT_PROP_CRITICAL_HURT', 'FIGHT_PROP_CHARGE_EFFICIENCY',
  'FIGHT_PROP_HEAL_ADD', 'FIGHT_PROP_PHYSICAL_ADD_HURT', 'FIGHT_PROP_FIRE_ADD_HURT',
  'FIGHT_PROP_ELEC_ADD_HURT', 'FIGHT_PROP_WATER_ADD_HURT', 'FIGHT_PROP_WIND_ADD_HURT',
  'FIGHT_PROP_ICE_ADD_HURT', 'FIGHT_PROP_ROCK_ADD_HURT', 'FIGHT_PROP_GRASS_ADD_HURT',
]);
const gearStatName = (stat) => stat?.label || statLabels[stat?.propId] || 'Atributo';
const gearStatValue = (stat) => {
  const value = percentageProps.has(stat.propId) && Math.abs(stat.value) < 1
    ? stat.value * 100
    : stat.value;
  return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value)}${percentageProps.has(stat.propId) ? '%' : ''}`;
};
const artifactSlotNames = {
  EQUIP_BRACER: 'Flor', EQUIP_NECKLACE: 'Pluma', EQUIP_SHOES: 'Areia',
  EQUIP_RING: 'Cálice', EQUIP_DRESS: 'Tiara',
};
const normalizeBuildLabel = (value) => {
  const normalized = String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]/g, '');
  return normalized === 'taxa' ? 'taxacrit' : normalized;
};
const buildMainStatLabels = {
  FIGHT_PROP_HP: 'Vida', FIGHT_PROP_ATTACK: 'ATQ', FIGHT_PROP_DEFENSE: 'DEF',
  FIGHT_PROP_HP_PERCENT: 'Vida%', FIGHT_PROP_ATTACK_PERCENT: 'ATQ%', FIGHT_PROP_DEFENSE_PERCENT: 'DEF%',
  FIGHT_PROP_CRITICAL: 'Taxa CRIT', FIGHT_PROP_CRITICAL_HURT: 'Dano CRIT',
  FIGHT_PROP_CHARGE_EFFICIENCY: 'Recarga', FIGHT_PROP_ELEMENT_MASTERY: 'Proficiência Elemental',
  FIGHT_PROP_HEAL_ADD: 'Bônus de Cura', FIGHT_PROP_PHYSICAL_ADD_HURT: 'Bônus de Dano Físico',
  FIGHT_PROP_FIRE_ADD_HURT: 'Bônus de Dano Pyro', FIGHT_PROP_ELEC_ADD_HURT: 'Bônus de Dano Electro',
  FIGHT_PROP_WATER_ADD_HURT: 'Bônus de Dano Hydro', FIGHT_PROP_WIND_ADD_HURT: 'Bônus de Dano Anemo',
  FIGHT_PROP_ICE_ADD_HURT: 'Bônus de Dano Cryo', FIGHT_PROP_ROCK_ADD_HURT: 'Bônus de Dano Geo',
  FIGHT_PROP_GRASS_ADD_HURT: 'Bônus de Dano Dendro',
};
const buildMainSlots = { EQUIP_SHOES: 0, EQUIP_RING: 1, EQUIP_DRESS: 2 };

function compareBuild(entry, recommendation) {
  const priorities = [];
  const weaponName = entry.weapon?.name;
  const weaponMatches = Boolean(weaponName && recommendation.weapons.some((name) => normalizeBuildLabel(name) === normalizeBuildLabel(weaponName)));
  if (!weaponName) priorities.push('Arma não encontrada no Showcase; confira o equipamento no jogo.');
  else if (!weaponMatches) priorities.push(`Compare a arma atual (${weaponName}) com as opções recomendadas.`);

  const artifacts = entry.artifacts || [];
  const setCounts = new Map();
  artifacts.forEach((artifact) => {
    if (artifact.setName) setCounts.set(artifact.setName, (setCounts.get(artifact.setName) || 0) + 1);
  });
  const namedSetRecommendations = recommendation.artifacts.map((line) => {
    const candidate = line.split('(')[0].split(/\s+\+\s+/)[0].replace(/^\s*\d+\s*peças?\s+de\s+/i, '').trim();
    if (!candidate || /^(atq|vida|def|recarga|dano|proficiência|crit|taxa|bônus)/i.test(candidate)) return null;
    const required = /2\s*(?:\+\s*2\s*)?peças/i.test(line) ? 2 : /4\s*peças/i.test(line) ? 4 : 2;
    return { setName: candidate, required };
  }).filter(Boolean);
  const setComparisons = namedSetRecommendations.map(({ setName, required }) => {
    const match = [...setCounts].find(([equippedName]) => normalizeBuildLabel(equippedName).includes(normalizeBuildLabel(setName)) || normalizeBuildLabel(setName).includes(normalizeBuildLabel(equippedName)));
    const equippedName = match?.[0] || setName;
    const count = match?.[1] || 0;
    return { setName, equippedName, count, required, met: count >= required };
  });
  const hasNamedSetRecommendations = namedSetRecommendations.length > 0;
  if (hasNamedSetRecommendations && !setComparisons.some(({ met }) => met)) {
    priorities.push('Confira os conjuntos: nenhum conjunto reconhecido completa a recomendação do guia.');
  }

  const mainStatGroups = recommendation.mainStats.split('/').map((group) => group.trim());
  const mainStatChecks = Object.entries(buildMainSlots).map(([slot, index]) => {
    const artifact = artifacts.find((item) => item.slot === slot);
    const actual = artifact?.mainStat;
    const actualLabel = buildMainStatLabels[actual?.propId] || actual?.label;
    const expected = (mainStatGroups[index] || '').split(/\s+ou\s+|,\s*/i).map((value) => value.trim()).filter(Boolean);
    const matches = Boolean(actualLabel && expected.some((value) => normalizeBuildLabel(value) === normalizeBuildLabel(actualLabel)));
    if (actualLabel && expected.length && !matches) priorities.push(`Confira a ${artifactSlotNames[slot].toLocaleLowerCase('pt-BR')}: está com ${actualLabel}; o guia sugere ${expected.join(' ou ')}.`);
    return { slot, actualLabel, expected, matches };
  });

  const equippedSubstats = artifacts.flatMap((artifact) => artifact.substats || []);
  const substatTargets = [
    { label: 'CRIT', matches: (stat) => ['FIGHT_PROP_CRITICAL', 'FIGHT_PROP_CRITICAL_HURT'].includes(stat.propId) },
    { label: 'Recarga', matches: (stat) => stat.propId === 'FIGHT_PROP_CHARGE_EFFICIENCY' },
    { label: 'ATQ%', matches: (stat) => stat.propId === 'FIGHT_PROP_ATTACK_PERCENT' },
    { label: 'Proficiência Elemental', matches: (stat) => stat.propId === 'FIGHT_PROP_ELEMENT_MASTERY' },
    { label: 'Vida%', matches: (stat) => stat.propId === 'FIGHT_PROP_HP_PERCENT' },
    { label: 'DEF%', matches: (stat) => stat.propId === 'FIGHT_PROP_DEFENSE_PERCENT' },
  ].filter(({ label }) => normalizeBuildLabel(recommendation.substats).includes(normalizeBuildLabel(label)))
    .map((target) => ({ ...target, found: equippedSubstats.some(target.matches) }));
  substatTargets.filter(({ found, label }) => !found).forEach(({ label }) => priorities.push(`Nenhuma peça mostra subatributo de ${label}; o guia o prioriza.`));

  return { priorities, weaponMatches, setCounts: [...setCounts], setComparisons, hasNamedSetRecommendations, mainStatChecks, substatTargets };
}

function ShowcaseBuildCard({ entry }) {
  const character = getCharacter(entry.characterId);
  const recommendation = builds[entry.characterId];
  if (!character) return null;
  const stats = [
    ['Taxa CRIT', entry.stats?.critRate, true],
    ['Dano CRIT', entry.stats?.critDamage, true],
    ['Recarga', entry.stats?.recharge, true],
    ['Proficiência', entry.stats?.elementalMastery, false],
  ];
  const formatCombatStat = (value, percentage) => {
    const scaledValue = percentage && Math.abs(value) <= 2 ? value * 100 : value;
    return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(scaledValue)}${percentage ? '%' : ''}`;
  };
  const iconUrl = (icon) => icon ? `https://enka.network/ui/${encodeURIComponent(icon)}.png` : '';
  const weapon = entry.weapon;
  const comparison = recommendation ? compareBuild(entry, recommendation) : null;

  return <article className="showcase-build-card">
    <header className="showcase-card-header">
      {character.iconUrl && <img src={character.iconUrl} alt="" loading="lazy" />}
      <div className="showcase-character-heading"><div><strong>{character.name}</strong><small>Nível {entry.level ?? '?'} · C{entry.constellation ?? 0}{recommendation ? ` · ${recommendation.style}` : ''}</small></div></div>
      {recommendation && <span className={`showcase-card-status${comparison.weaponMatches && comparison.priorities.length === 0 ? ' showcase-card-status--good' : ''}`}>{comparison.priorities.length ? `${comparison.priorities.length} prioridades` : 'Build conferida'}</span>}
    </header>
    <div className="showcase-current-stats">
      {stats.map(([label, value, percentage]) => <div key={label}><span>{label}</span><strong>{formatCombatStat(Number(value) || 0, percentage)}</strong></div>)}
    </div>
    <section className="showcase-gear-section">
      <h4>Equipamentos atuais</h4>
      {weapon ? <div className={`showcase-weapon${comparison?.weaponMatches ? ' showcase-weapon--match' : ''}`}>
        {weapon.icon && <img src={iconUrl(weapon.icon)} alt="Ícone da arma equipada" loading="lazy" />}
        <div><strong>{weapon.name || 'Arma equipada'}</strong><span>Nível {weapon.level ?? '?'} · Refinamento {weapon.refinement ?? '?'}</span>
          {weapon.stats?.map((stat, index) => <small key={`${stat.propId}-${index}`}>{gearStatName(stat)} {gearStatValue(stat)}</small>)}
        </div>
      </div> : <p className="showcase-no-data">Arma não informada no Showcase.</p>}
      <div className="showcase-artifacts">
        {entry.artifacts?.map((artifact) => {
          const setComparison = comparison?.setComparisons.find((item) => item.equippedName === artifact.setName);
          return <div className={`showcase-artifact${setComparison?.met ? ' showcase-artifact--match' : ''}`} key={artifact.id} title={`${artifactSlotNames[artifact.slot] || 'Artefato'} · Nv. ${artifact.level ?? '?'}`}>
            {artifact.icon && <img src={iconUrl(artifact.icon)} alt="" loading="lazy" />}
            <div><strong>{artifactSlotNames[artifact.slot] || 'Artefato'} +{Math.max(0, (artifact.level ?? 1) - 1)}</strong>
              {(artifact.setName || artifact.name) && <span>{artifact.setName || artifact.name}</span>}
              {artifact.mainStat && <span className="artifact-main-stat">{gearStatName(artifact.mainStat)} {gearStatValue(artifact.mainStat)}</span>}
              {artifact.substats?.map((stat, index) => <small key={`${stat.propId}-${index}`}>{gearStatName(stat)} {gearStatValue(stat)}</small>)}
            </div>
          </div>;
        })}
        {!entry.artifacts?.length && <p className="showcase-no-data">Artefatos não informados no Showcase.</p>}
      </div>
    </section>
    <section className="showcase-recommendation">
      <h4>Build recomendada</h4>
      {recommendation ? <>
        <div className="build-match-status"><span className={comparison.weaponMatches ? 'is-match' : 'needs-review'}>{comparison.weaponMatches ? '✓ Arma dentro das opções recomendadas' : '↗ Confira a arma equipada'}</span><span>{comparison.priorities.length ? `${comparison.priorities.length} pontos para revisar` : 'Sem divergências nos dados comparáveis'}</span></div>
        <div className="recommendation-row"><b>Armas</b><span>{recommendation.weapons.join(' · ')}</span></div>
        <div className="recommendation-row"><b>Artefatos</b><span>{recommendation.artifacts.join(' · ')}</span></div>
        {comparison.setCounts.length > 0 && <div className="recommendation-row"><b>Conjuntos equipados</b><span>{comparison.setCounts.map(([name, count]) => `${name} (${count})`).join(' · ')}</span></div>}
        {comparison.hasNamedSetRecommendations && <div className="recommendation-row"><b>Comparação de conjuntos</b><span className={comparison.setComparisons.some(({ met }) => met) ? 'build-check--good' : 'build-check--review'}>{comparison.setComparisons.map(({ setName, count, required, met }) => `${setName}: ${count}/${required} ${met ? '✓' : 'para revisar'}`).join(' · ')}</span></div>}
        {!comparison.hasNamedSetRecommendations && <p className="showcase-compare-note">Este guia usa opções de conjuntos sem nome específico; não há comparação automática de sets.</p>}
        <div className="recommendation-row"><b>Atributos principais</b><span>{recommendation.mainStats}</span></div>
        <div className="main-stat-checks">{comparison.mainStatChecks.map(({ slot, actualLabel, expected, matches }) => <span key={slot} className={actualLabel && matches ? 'build-check--good' : actualLabel ? 'build-check--review' : ''}><b>{artifactSlotNames[slot]}:</b> {actualLabel || 'não informado'}{expected.length ? ` · recomendado: ${expected.join(' ou ')}` : ''}</span>)}</div>
        <div className="recommendation-row"><b>Subatributos prioritários</b><span>{recommendation.substats}</span></div>
        {comparison.substatTargets.length > 0 && <div className="substat-checks">{comparison.substatTargets.map(({ label, found }) => <span key={label} className={found ? 'build-check--good' : 'build-check--review'}>{found ? '✓' : '↗'} {label}</span>)}</div>}
        {comparison.priorities.length > 0 && <div className="build-priorities"><b>O que revisar primeiro</b><ul>{comparison.priorities.map((priority) => <li key={priority}>{priority}</li>)}</ul></div>}
        <a href={recommendation.source} target="_blank" rel="noreferrer">Abrir guia detalhado KQM ↗</a>
      </> : <p className="showcase-no-data">Ainda não há recomendação cadastrada para este personagem.</p>}
    </section>
  </article>;
}

export default function App() {
  const [roster, setRoster] = useState(() => supabase ? [] : readRoster());
  const [ownedWeapons, setOwnedWeapons] = useState(() => supabase ? [] : readOwnedWeapons());
  const [enkaShowcase, setEnkaShowcase] = useState(() => supabase ? null : readEnkaShowcase());
  const [goals, setGoals] = useState(() => supabase ? [] : readGoals());
  const [selectedShowcaseCharacterId, setSelectedShowcaseCharacterId] = useState(null);
  const [session, setSession] = useState(null);
  const [loadedProfileUserId, setLoadedProfileUserId] = useState(null);
  const [cloudGoalsAvailable, setCloudGoalsAvailable] = useState(true);
  const [localProfileReady, setLocalProfileReady] = useState(!supabase);
  const [profileStatus, setProfileStatus] = useState('local');
  const [profileFeedback, setProfileFeedback] = useState('');
  const [query, setQuery] = useState('');
  const [elementFilter, setElementFilter] = useState('Todos');
  const [weaponFilter, setWeaponFilter] = useState('Todas');
  const [rarityFilter, setRarityFilter] = useState('Todas');
  const [sortOrder, setSortOrder] = useState('region-release');
  const [pageSize, setPageSize] = useState(48);
  const [characterPage, setCharacterPage] = useState(1);
  const [ownedOnly, setOwnedOnly] = useState(false);
  const [activeNav, setActiveNav] = useState(() => pageFromHash(window.location.hash));
  const [enkaUid, setEnkaUid] = useState('');
  const [enkaBusy, setEnkaBusy] = useState(false);
  const [enkaMessage, setEnkaMessage] = useState('');
  const [enkaError, setEnkaError] = useState('');

  useEffect(() => {
    const syncPageFromHash = () => setActiveNav(pageFromHash(window.location.hash));
    window.addEventListener('popstate', syncPageFromHash);
    return () => window.removeEventListener('popstate', syncPageFromHash);
  }, []);

  useEffect(() => {
    if (!supabase) return undefined;
    let active = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        setProfileStatus('error');
        setProfileFeedback('Não foi possível verificar sua sessão. Recarregue a página.');
      }
      setSession(data?.session || null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) setSession(nextSession);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase || !session?.user?.id) {
      setLoadedProfileUserId(null);
      setLocalProfileReady(true);
      setProfileStatus('local');
      setProfileFeedback('');
      const hasSignedInLocalProfile = supabase && localStorage.getItem(LOCAL_PROFILE_OWNER_KEY);
      if (hasSignedInLocalProfile) {
        setRoster([]);
        setOwnedWeapons([]);
        setEnkaShowcase(null);
        setGoals([]);
      } else {
        setRoster(readRoster());
        setOwnedWeapons(readOwnedWeapons());
        setEnkaShowcase(readEnkaShowcase());
        setGoals(readGoals());
      }
      return undefined;
    }
    let active = true;
    const userId = session.user.id;
    setLocalProfileReady(false);
    setLoadedProfileUserId(null);
    setCloudGoalsAvailable(false);
    setProfileStatus('loading');
    setProfileFeedback('');

    const loadProfile = async () => {
      const { data, error } = await supabase
        .from('player_profiles')
        .select('roster, owned_weapons, enka_showcase')
        .eq('user_id', userId)
        .maybeSingle();
      if (!active) return;
      if (error) {
        setProfileStatus('error');
        setProfileFeedback('Não foi possível carregar o perfil da nuvem. Seus dados salvos anteriormente não foram apagados; confira a conexão e as políticas RLS.');
        if (localStorage.getItem(LOCAL_PROFILE_OWNER_KEY) === userId) {
          setRoster(readRoster());
          setOwnedWeapons(readOwnedWeapons());
          setEnkaShowcase(readEnkaShowcase());
          setGoals(readGoals());
        }
        return;
      }

      const { data: goalsData, error: goalsError } = await supabase
        .from('player_profiles')
        .select('goals')
        .eq('user_id', userId)
        .maybeSingle();
      if (!active) return;
      const supportsCloudGoals = !goalsError;
      setCloudGoalsAvailable(supportsCloudGoals);

      const localOwnerId = localStorage.getItem(LOCAL_PROFILE_OWNER_KEY);
      const canImportLocal = !localOwnerId || localOwnerId === userId;
      const nextRoster = Array.isArray(data?.roster) ? data.roster : canImportLocal ? readRoster() : [];
      const nextWeapons = Array.isArray(data?.owned_weapons) ? data.owned_weapons : canImportLocal ? readOwnedWeapons() : [];
      const nextShowcase = data?.enka_showcase?.avatars ? data.enka_showcase : canImportLocal ? readEnkaShowcase() : null;
      const nextGoals = Array.isArray(goalsData?.goals) ? goalsData.goals : canImportLocal ? readGoals() : [];
      setRoster(nextRoster);
      setOwnedWeapons(nextWeapons);
      setEnkaShowcase(nextShowcase);
      setGoals(nextGoals);

      if (!data) {
        setProfileStatus('migrating');
        const { error: migrationError } = await supabase.from('player_profiles').upsert({
          user_id: userId,
          roster: nextRoster,
          owned_weapons: nextWeapons,
          enka_showcase: nextShowcase || {},
          ...(supportsCloudGoals ? { goals: nextGoals } : {}),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
        if (!active) return;
        if (migrationError) {
          setProfileStatus('error');
          setProfileFeedback('Não foi possível copiar seus dados locais para a conta. Confira a tabela e as políticas RLS.');
          return;
        }
      }
      setLoadedProfileUserId(userId);
      setProfileStatus('synced');
      setProfileFeedback(supportsCloudGoals ? '' : 'Perfil carregado. Para sincronizar objetivos na nuvem, execute o schema.sql atualizado no Supabase. Seus objetivos continuam salvos neste navegador.');
    };

    loadProfile().catch(() => {
      if (!active) return;
      setProfileStatus('error');
      setProfileFeedback('Falha de conexão ao carregar sua conta. Seus dados locais continuam salvos.');
    });
    return () => { active = false; };
  }, [session?.user?.id]);

  useEffect(() => {
    if (!supabase || !session?.user?.id || loadedProfileUserId !== session.user.id) return undefined;
    const userId = session.user.id;
    setProfileStatus('saving');
    const timer = window.setTimeout(async () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(roster));
        localStorage.setItem(WEAPON_STORAGE_KEY, JSON.stringify(ownedWeapons));
        if (enkaShowcase) localStorage.setItem(ENKA_SHOWCASE_STORAGE_KEY, JSON.stringify(enkaShowcase));
        else localStorage.removeItem(ENKA_SHOWCASE_STORAGE_KEY);
        localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
        localStorage.setItem(LOCAL_PROFILE_OWNER_KEY, userId);
      } catch {
        // A cloud save should still work if browser storage is unavailable.
      }
      const profileUpdate = {
        user_id: userId,
        roster,
        owned_weapons: ownedWeapons,
        enka_showcase: enkaShowcase || {},
        updated_at: new Date().toISOString(),
      };
      if (cloudGoalsAvailable) profileUpdate.goals = goals;
      const { error } = await supabase.from('player_profiles').upsert(profileUpdate, { onConflict: 'user_id' });
      if (error) {
        setProfileStatus('error');
        setProfileFeedback('Não foi possível sincronizar agora. Seus dados continuam guardados neste navegador.');
      } else {
        setProfileStatus('synced');
        setProfileFeedback(cloudGoalsAvailable ? '' : 'Elenco sincronizado. Os objetivos ficam neste navegador até executar o schema.sql atualizado no Supabase.');
      }
    }, 400);
    return () => window.clearTimeout(timer);
  }, [roster, ownedWeapons, enkaShowcase, goals, cloudGoalsAvailable, session?.user?.id, loadedProfileUserId]);

  useEffect(() => {
    if (!localProfileReady || (supabase && session?.user?.id)) return;
    try {
      localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
    } catch {
      // A interface continua funcionando nesta sessão se o navegador bloquear armazenamento.
    }
  }, [goals, session?.user?.id, localProfileReady]);

  const toggleCharacter = (id) => {
    setRoster((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      if (!session) {
        localStorage.removeItem(LOCAL_PROFILE_OWNER_KEY);
        localStorage.setItem(WEAPON_STORAGE_KEY, JSON.stringify(ownedWeapons));
      }
      return next;
    });
  };

  const toggleWeapon = (weapon) => {
    setOwnedWeapons((current) => {
      const next = current.includes(weapon) ? current.filter((item) => item !== weapon) : [...current, weapon];
      localStorage.setItem(WEAPON_STORAGE_KEY, JSON.stringify(next));
      if (!session) {
        localStorage.removeItem(LOCAL_PROFILE_OWNER_KEY);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(roster));
      }
      return next;
    });
  };

  const addGoal = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = String(formData.get('title') || '').trim();
    const target = Math.max(1, Number(formData.get('target')) || 1);
    const progress = Math.min(target, Math.max(0, Number(formData.get('progress')) || 0));
    if (!title) return;
    setGoals((current) => [{
      id: crypto.randomUUID(),
      title,
      category: String(formData.get('category') || 'other'),
      characterId: String(formData.get('characterId') || ''),
      progress,
      target,
      createdAt: new Date().toISOString(),
    }, ...current]);
    event.currentTarget.reset();
  };

  const changeGoalProgress = (goalId, amount) => {
    setGoals((current) => current.map((goal) => goal.id === goalId
      ? { ...goal, progress: Math.min(goal.target, Math.max(0, goal.progress + amount)) }
      : goal));
  };

  const addBuildGoal = (character, build) => {
    const existing = goals.some((goal) => goal.category === 'build' && goal.characterId === character.id && goal.progress < goal.target);
    if (!existing) {
      const weapon = build.weapons.find((name) => ownedWeapons.includes(name)) || build.weapons[0];
      setGoals((current) => [{
        id: crypto.randomUUID(),
        title: `Completar build recomendada de ${character.name}`,
        category: 'build',
        characterId: character.id,
        progress: 0,
        target: 3,
        checklist: [
          { id: 'weapon', label: `Obter e equipar ${weapon}`, done: false },
          { id: 'artifacts', label: `Conseguir ${build.artifacts[0]}`, done: false },
          { id: 'main-stats', label: `Ajustar atributos: ${build.mainStats}`, done: false },
        ],
        createdAt: new Date().toISOString(),
      }, ...current]);
    }
    goTo(navItems[0]);
    window.setTimeout(() => document.getElementById('my-goals')?.scrollIntoView({ behavior: 'smooth' }), 0);
  };

  const toggleGoalTask = (goalId, taskId) => {
    setGoals((current) => current.map((goal) => {
      if (goal.id !== goalId || !Array.isArray(goal.checklist)) return goal;
      const checklist = goal.checklist.map((task) => task.id === taskId ? { ...task, done: !task.done } : task);
      const progress = checklist.filter((task) => task.done).length;
      return { ...goal, checklist, progress, target: checklist.length };
    }));
  };

  const importShowcase = async (event) => {
    event.preventDefault();
    setEnkaMessage('');
    setEnkaError('');
    const uid = enkaUid.trim();
    if (!/^\d{9,10}$/.test(uid)) {
      setEnkaError('Digite um UID de 9 ou 10 números.');
      return;
    }
    if (!supabase || !session?.user) {
      setEnkaError('Entre na sua conta do Teyvat Compass para importar o Showcase.');
      return;
    }
    if (loadedProfileUserId !== session.user.id) {
      setEnkaError('Aguarde o carregamento do seu perfil e tente novamente.');
      return;
    }

    setEnkaBusy(true);
    try {
      let profile = getEnkaCache(uid);
      if (!Array.isArray(profile?.avatars)) profile = null;
      if (!profile) {
        const { data, error } = await supabase.functions.invoke('enka-showcase', { body: { uid } });
        if (error) throw new Error(data?.error || 'Não foi possível consultar o Showcase.');
        if (data?.error) throw new Error(data.error);
        profile = data;
        saveEnkaCache(uid, profile, data.ttl);
      }

      const supportedAvatars = profile.avatars
        .map((avatar) => ({ ...avatar, characterId: enkaAvatarToCharacter[avatar.avatarId] }))
        .filter((avatar) => avatar.characterId);
      const importedIds = [...new Set(supportedAvatars.map((avatar) => avatar.characterId))];
      const unknownCount = profile.avatars.length - supportedAvatars.length;
      if (!importedIds.length) {
        throw new Error('Os personagens do Showcase ainda não estão no catálogo do Teyvat Compass.');
      }
      const newCount = importedIds.filter((id) => !roster.includes(id)).length;
      const importedShowcase = {
        uid,
        nickname: profile.nickname,
        worldLevel: profile.worldLevel,
        importedAt: new Date().toISOString(),
        avatars: supportedAvatars,
      };
      setRoster((current) => [...new Set([...current, ...importedIds])]);
      setEnkaShowcase(importedShowcase);
      try {
        localStorage.setItem(ENKA_SHOWCASE_STORAGE_KEY, JSON.stringify(importedShowcase));
        localStorage.setItem(LOCAL_PROFILE_OWNER_KEY, session.user.id);
      } catch {
        // A sincronização com a conta continua mesmo se o cache local estiver indisponível.
      }
      const player = profile.nickname ? ` de ${profile.nickname}` : '';
      setEnkaMessage(`${newCount ? `${newCount} personagem${newCount === 1 ? '' : 'ns'} importado${newCount === 1 ? '' : 's'}` : 'Seu elenco já inclui os personagens do Showcase'}${player}; builds atualizadas.${unknownCount ? ` ${unknownCount} personagem${unknownCount === 1 ? '' : 'ns'} ainda não existe${unknownCount === 1 ? '' : 'm'} no catálogo.` : ''}`);
    } catch (error) {
      setEnkaError(error.message || 'A importação falhou. Tente novamente mais tarde.');
    } finally {
      setEnkaBusy(false);
    }
  };

  const filteredCharacters = useMemo(() => characters.filter((character) => {
    const matchesQuery = character.name.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'));
    const matchesElement = elementFilter === 'Todos' || character.element === elementFilter;
    const matchesWeapon = weaponFilter === 'Todas' || character.weapon === weaponFilter;
    const matchesRarity = rarityFilter === 'Todas' || character.rarity === Number(rarityFilter);
    const matchesOwnership = !ownedOnly || roster.includes(character.id);
    return matchesQuery && matchesElement && matchesWeapon && matchesRarity && matchesOwnership;
  }).sort((left, right) => {
    const leftOwned = roster.includes(left.id);
    const rightOwned = roster.includes(right.id);
    if (leftOwned !== rightOwned) return leftOwned ? -1 : 1;
    if (sortOrder === 'region-release') {
      const regionOrder = ['Mondstadt', 'Liyue', 'Inazuma', 'Sumeru', 'Fontaine', 'Natlan', 'Nod-Krai', 'Snezhnaya', 'Outras regiões'];
      return regionOrder.indexOf(left.region) - regionOrder.indexOf(right.region)
        || (left.release ?? Number.MAX_SAFE_INTEGER) - (right.release ?? Number.MAX_SAFE_INTEGER)
        || left.name.localeCompare(right.name, 'pt-BR');
    }
    if (sortOrder === 'release') return (left.release ?? Number.MAX_SAFE_INTEGER) - (right.release ?? Number.MAX_SAFE_INTEGER) || left.name.localeCompare(right.name, 'pt-BR');
    if (sortOrder === 'rarity') return right.rarity - left.rarity || left.name.localeCompare(right.name, 'pt-BR');
    return left.name.localeCompare(right.name, 'pt-BR');
  }), [query, elementFilter, weaponFilter, rarityFilter, sortOrder, ownedOnly, roster]);

  const characterPageCount = Math.max(1, Math.ceil(filteredCharacters.length / pageSize));
  const visibleCharacters = filteredCharacters.slice((characterPage - 1) * pageSize, characterPage * pageSize);

  useEffect(() => {
    setCharacterPage(1);
  }, [query, elementFilter, weaponFilter, rarityFilter, sortOrder, ownedOnly, pageSize]);

  const rankedTeams = useMemo(() => teams
    .map((team) => ({ team, evaluation: evaluateTeam(team, roster) }))
    .sort((a, b) => {
      if (!roster.length) return a.team.priority - b.team.priority;
      return b.evaluation.coveredCount - a.evaluation.coveredCount
        || b.evaluation.coreCount - a.evaluation.coreCount
        || a.team.priority - b.team.priority;
    }), [roster]);

  const ownedBuilds = roster
    .map(getCharacter)
    .filter((character) => character && builds[character.id])
    .sort((left, right) => left.release - right.release || left.name.localeCompare(right.name, 'pt-BR'));
  const ownedCharactersWithoutBuilds = roster
    .map(getCharacter)
    .filter((character) => character && !builds[character.id]);
  const showcaseEntries = enkaShowcase?.avatars || [];
  const selectedShowcaseEntry = showcaseEntries.find((entry) => entry.characterId === selectedShowcaseCharacterId) || showcaseEntries[0];

  const navItems = [
    { label: 'Meu plano', icon: '⌂', target: 'home' },
    { label: 'Personagens', icon: '✧', target: 'characters' },
    { label: 'Builds', icon: '⚒', target: 'builds' },
    { label: 'Mapa', icon: '⌖', target: 'map-preview', soon: true },
  ];

  const goTo = (item) => {
    if (item.soon) return;
    setActiveNav(item.label);
    if (window.location.hash !== `#${item.target}`) window.history.pushState(null, '', `#${item.target}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-shell" id="home">
      <aside className="sidebar">
        <a className="brand" href="#home" onClick={() => goTo(navItems[0])}><CompassMark /><span><strong>TEYVAT</strong><small>COMPASS</small></span></a>
        <div className="sidebar-label">SUA JORNADA</div>
        <nav className="main-nav" aria-label="Navegação principal">
          {navItems.map((item) => <button key={item.label} type="button" disabled={item.soon} aria-current={activeNav === item.label ? 'page' : undefined} className={activeNav === item.label ? 'active' : ''} onClick={() => goTo(item)}><span className="nav-icon">{item.icon}</span>{item.label}{item.soon && <span className="soon-tag">EM BREVE</span>}</button>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-orbit" aria-hidden="true"><span>✦</span><i /><b /></div>
          <p>Seu próximo destino começa com um bom plano.</p>
          <span>FEITO PARA VIAJANTES</span>
        </div>
        <div className="sidebar-footer"><span className="status-dot" /> Seus dados ficam neste dispositivo</div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb"><span>TEYVAT</span><b>/</b><strong>{activeNav.toUpperCase()}</strong></div>
          <AccountMenu session={session} profileStatus={profileStatus} profileFeedback={profileFeedback} />
        </header>

        {activeNav === 'Meu plano' && <><section className="welcome-section">
          <div className="welcome-copy">
            <div className="eyebrow"><span /> SEU GUIA DE AVENTURA</div>
            <h1>Encontre seu<br /><em>próximo time.</em></h1>
            <p>Monte uma equipe com quem já caminha ao seu lado.<br className="desktop-break" /> A gente encontra o resto do caminho.</p>
            <button className="primary-button" onClick={() => goTo(navItems[1])}>Escolher meus personagens <span>→</span></button>
            <div className="welcome-meta"><span><i>✧</i> Sugestões para o seu elenco</span><b>·</b><span>Sem precisar conectar sua conta</span></div>
          </div>
          <div className="welcome-art" aria-hidden="true">
            <div className="art-glow" />
            <div className="art-ring art-ring--outer" /><div className="art-ring art-ring--inner" />
            <div className="art-sun"><span>✦</span></div>
            <div className="art-star art-star--one">✦</div><div className="art-star art-star--two">✧</div>
            <div className="art-label art-label--one"><i /> PONTO DE PARTIDA</div>
            <div className="art-label art-label--two"><i /> RUMO AO ABISMO</div>
            <div className="art-coordinates">28° 32' N<br />72° 41' E</div>
            <div className="art-horizon" />
          </div>
          <div className="section-index"><span>01</span><i /> SUA JORNADA COMEÇA AQUI</div>
        </section>

        <section className="recommendations-section" id="recommendations">
          <div className="section-heading">
            <div><div className="section-kicker">TRAÇANDO A ROTA <span>✧</span></div><h2>Times para explorar</h2><p>Ideias de composição com alternativas conforme o seu elenco.</p></div>
            <div className="recommendation-count"><strong>{String(teams.length).padStart(2, '0')}</strong><span>ROTAS<br />SUGERIDAS</span></div>
          </div>
          <div className="roster-notice"><div className="notice-icon">✧</div><div><strong>{roster.length ? `${roster.length} personagens no seu elenco` : 'Primeiro, marque quem você já tem'}</strong><span>{roster.length ? 'Os times estão ordenados pelos que você consegue montar; substitutos e posições em falta ficam indicados.' : 'Marque seus personagens para ordenar os times por compatibilidade e ver quem pode substituir quem.'}</span></div><button onClick={() => goTo(navItems[1])}>{roster.length ? 'Editar elenco' : 'Selecionar elenco'} <span>→</span></button></div>
          <div className="team-grid">{rankedTeams.map(({ team, evaluation }) => <TeamCard key={team.id} team={team} roster={roster} evaluation={evaluation} onEditRoster={() => goTo(navItems[1])} onOpenBuilds={() => goTo(navItems[2])} />)}</div>
          <div className="data-note"><span>ⓘ</span> Builds são uma curadoria inicial baseada nos guias KQM; confirme requisitos de Recarga e ajuste à sua equipe. Algumas trocas alteram a rotação ou o desempenho.</div>
        </section></>}

        {activeNav === 'Personagens' && <section className="library-section" id="character-library">
          <div className="library-heading">
            <div><div className="section-kicker">PERSONAGENS <span>✧</span></div><h2>Seu elenco</h2><p>Marque quem você já tem para montar times com opções que fazem sentido.</p></div>
            <div className="roster-counter"><strong>{String(roster.length).padStart(2, '0')}</strong><span>DE {characters.length} NO<br />CATÁLOGO</span></div>
          </div>
          <div className="library-controls">
            <label className="search-box"><span>⌕</span><input aria-label="Buscar personagem" placeholder="Buscar personagem..." value={query} onChange={(event) => setQuery(event.target.value)} /><kbd>⌘ K</kbd></label>
            <label className="library-select"><span>Arma</span><select aria-label="Filtrar por arma" value={weaponFilter} onChange={(event) => setWeaponFilter(event.target.value)}><option value="Todas">Todas</option>{['Espada', 'Espadão', 'Lança', 'Arco', 'Catalisador'].map((weapon) => <option key={weapon} value={weapon}>{weapon}</option>)}</select></label>
            <label className="library-select"><span>Raridade</span><select aria-label="Filtrar por raridade" value={rarityFilter} onChange={(event) => setRarityFilter(event.target.value)}><option value="Todas">Todas</option><option value="5">5 estrelas</option><option value="4">4 estrelas</option></select></label>
            <label className="library-select library-select--sort"><span>Ordem</span><select aria-label="Ordenar personagens" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}><option value="region-release">Região e lançamento</option><option value="release">Lançamento (antigos primeiro)</option><option value="name">Nome A–Z</option><option value="rarity">Raridade</option></select></label>
            <label className="library-select"><span>Por página</span><select aria-label="Personagens por página" value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))}><option value={12}>12</option><option value={24}>24</option><option value={48}>48</option></select></label>
            <button className={`owned-filter${ownedOnly ? ' selected' : ''}`} onClick={() => setOwnedOnly(!ownedOnly)}><span>{ownedOnly ? '✓' : '○'}</span> Tenho</button>
          </div>
          <div className="element-filters" aria-label="Filtrar por elemento">{['Todos', 'Pyro', 'Hydro', 'Anemo', 'Electro', 'Cryo', 'Geo', 'Dendro'].map((element) => <button key={element} className={elementFilter === element ? 'selected' : ''} onClick={() => setElementFilter(element)}>{element}</button>)}</div>
          {filteredCharacters.length > pageSize && <nav className="character-pagination" aria-label="Paginação do catálogo"><span>Mostrando {(characterPage - 1) * pageSize + 1}–{Math.min(characterPage * pageSize, filteredCharacters.length)} de {filteredCharacters.length}</span><div><button type="button" onClick={() => setCharacterPage((page) => Math.max(1, page - 1))} disabled={characterPage === 1}>← Anterior</button><span>Página {characterPage} de {characterPageCount}</span><button type="button" onClick={() => setCharacterPage((page) => Math.min(characterPageCount, page + 1))} disabled={characterPage === characterPageCount}>Próxima →</button></div></nav>}
          {filteredCharacters.length ? <div className="character-grid">{visibleCharacters.map((character) => {
            const isOwned = roster.includes(character.id);
            return <button key={character.id} aria-pressed={isOwned} className={`character-card${isOwned ? ' character-card--owned' : ''}`} onClick={() => toggleCharacter(character.id)}>
              <div className="character-portrait" style={{ '--character-color': character.color }}><div className="portrait-halo" />{character.iconUrl && <img className="portrait-image" src={character.iconUrl} alt="" loading="lazy" onError={(event) => { event.currentTarget.hidden = true; }} />}<span className="portrait-initials">{character.initials}</span><span className="portrait-element">{character.element === 'Electro' ? 'ϟ' : character.element === 'Pyro' ? '♨' : character.element === 'Hydro' ? '◌' : character.element === 'Cryo' ? '❄' : character.element === 'Anemo' ? '〰' : '◇'}</span>{isOwned && <><span className="owned-check">✓</span><span className="owned-badge">✓ NO ELENCO</span></>}</div>
              <div className="character-details"><div className="character-name-row"><strong>{character.name}</strong><span>{'★'.repeat(character.rarity)}</span></div><div className="character-subline"><span>{character.element}</span><i />{character.role}</div></div>
              <div className={`ownership-state${isOwned ? ' ownership-state--owned' : ''}`}>{isOwned ? 'NO SEU ELENCO' : '+ ADICIONAR'}</div>
            </button>;
          })}</div> : <div className="empty-state"><span>⌕</span><strong>Nenhum viajante encontrado</strong><p>Tente outro nome, elemento ou filtro.</p></div>}
          {filteredCharacters.length > pageSize && <nav className="character-pagination character-pagination--bottom" aria-label="Paginação do catálogo"><span>Mostrando {(characterPage - 1) * pageSize + 1}–{Math.min(characterPage * pageSize, filteredCharacters.length)} de {filteredCharacters.length}</span><div><button type="button" onClick={() => { setCharacterPage((page) => Math.max(1, page - 1)); document.getElementById('character-library')?.scrollIntoView({ behavior: 'smooth' }); }} disabled={characterPage === 1}>← Anterior</button><span>Página {characterPage} de {characterPageCount}</span><button type="button" onClick={() => { setCharacterPage((page) => Math.min(characterPageCount, page + 1)); document.getElementById('character-library')?.scrollIntoView({ behavior: 'smooth' }); }} disabled={characterPage === characterPageCount}>Próxima →</button></div></nav>}
          <div className="library-footnote"><span>◉</span> Seleção salva automaticamente apenas neste navegador. <button onClick={() => { setRoster([]); localStorage.removeItem(STORAGE_KEY); }}>Limpar seleção</button></div>
        </section>}

        {activeNav === 'Builds' && <section className="builds-page">
          <div className="library-heading">
            <div><div className="section-kicker">EQUIPAMENTOS <span>✧</span></div><h2>Builds do seu elenco</h2><p>Armas e artefatos recomendados para os personagens que você tem.</p></div>
            <div className="roster-counter"><strong>{String(ownedBuilds.length).padStart(2, '0')}</strong><span>GUIAS<br />DISPONÍVEIS</span></div>
          </div>

          <details className="showcase-import-disclosure">
            <summary><span><strong>Importar e comparar seu Showcase</strong><small>Use seu UID público e entre no Teyvat Compass. Não pedimos sua senha do jogo.</small></span><b aria-hidden="true">＋</b></summary>
            <form className="showcase-import" onSubmit={importShowcase}>
              <div className="showcase-import-copy"><strong>Seu Showcase precisa estar visível no jogo.</strong><span>Depois, informe o UID da sua conta abaixo.</span></div>
              <label><span>UID do Genshin</span><input inputMode="numeric" autoComplete="off" value={enkaUid} onChange={(event) => setEnkaUid(event.target.value)} placeholder="Ex.: 800000000" maxLength={10} /></label>
              <button type="submit" disabled={enkaBusy || !session?.user || !supabase || loadedProfileUserId !== session?.user?.id}>{enkaBusy ? 'Consultando…' : 'Importar Showcase'}</button>
              {!session?.user && <small className="showcase-hint">Entre na sua conta para habilitar a importação.</small>}
              {session?.user && loadedProfileUserId !== session.user.id && <small className="showcase-hint">Carregando seu perfil…</small>}
              {enkaMessage && <p className="showcase-feedback" role="status">{enkaMessage}</p>}
              {enkaError && <p className="showcase-feedback showcase-feedback--error" role="alert">{enkaError}</p>}
            </form>
          </details>

          {roster.length === 0 ? <div className="empty-state builds-empty-state"><span>✧</span><strong>Escolha seus personagens primeiro</strong><p>Assim mostramos recomendações de armas e artefatos para quem já faz parte do seu elenco.</p><button className="primary-button" onClick={() => goTo(navItems[1])}>Ir para Personagens <span>→</span></button></div> : <>
            {ownedBuilds.length > 0 ? <>
              <details className="owned-builds-disclosure">
                <summary><span><strong>Guias gerais do seu elenco</strong><small>{ownedBuilds.length} personagens · recomendações de armas, artefatos e atributos</small></span><b aria-hidden="true">＋</b></summary>
                <div className="builds-page-intro"><strong>{ownedBuilds.length} de {roster.length} personagens do elenco têm guias cadastrados.</strong><span>Abra um personagem para conferir alternativas de armas, artefatos e atributos. Marque as armas que você possui para vê-las primeiro.</span></div>
                <div className="owned-build-grid">{ownedBuilds.map((character) => <details className="owned-build-panel" key={character.id}>
                  <summary><span className="owned-build-icon" style={{ '--character-color': character.color }}>{character.initials}</span><span><strong>{character.name}</strong><small>{builds[character.id].style}</small></span><b aria-hidden="true">＋</b></summary>
                  <CharacterBuildCard character={character} build={builds[character.id]} ownedWeapons={ownedWeapons} onToggleWeapon={toggleWeapon} onAddToPlan={() => addBuildGoal(character, builds[character.id])} hasBuildGoal={goals.some((goal) => goal.category === 'build' && goal.characterId === character.id && goal.progress < goal.target)} />
                </details>)}</div>
              </details>
            </> : <div className="empty-state builds-empty-state"><span>⌖</span><strong>Estamos preparando estes guias</strong><p>Os personagens do seu elenco ainda não têm recomendações cadastradas. Selecione outros no catálogo para ver os guias disponíveis.</p><button className="primary-button" onClick={() => goTo(navItems[1])}>Ver Personagens <span>→</span></button></div>}
            {ownedCharactersWithoutBuilds.length > 0 && ownedBuilds.length > 0 && <p className="builds-coverage-note"><strong>Ainda sem guia</strong><span>{ownedCharactersWithoutBuilds.map((character) => character.name).join(', ')}. A cobertura do catálogo será ampliada aos poucos.</span></p>}
          </>}

          {enkaShowcase?.avatars?.length > 0 && <details className="showcase-imported-disclosure">
            <summary>Ver builds importadas do Showcase · {enkaShowcase.avatars.length} personagens</summary>
            <section className="showcase-imported">
              <div className="showcase-imported-heading"><div><div className="section-kicker">PERFIL ENKA <span>✧</span></div><h3>{enkaShowcase.nickname ? `Builds de ${enkaShowcase.nickname}` : 'Builds do Showcase'}</h3><p>Dados importados em {new Date(enkaShowcase.importedAt).toLocaleString('pt-BR')} · Mundo {enkaShowcase.worldLevel ?? '—'}</p></div><span>{enkaShowcase.avatars.length} PERSONAGENS</span></div>
              <div className="showcase-character-picker" role="group" aria-label="Escolha o personagem para ver a build">
                {showcaseEntries.map((entry) => {
                  const character = getCharacter(entry.characterId);
                  if (!character) return null;
                  const selected = entry.characterId === (selectedShowcaseEntry?.characterId);
                  return <button key={entry.characterId} type="button" className={`showcase-character-choice${selected ? ' showcase-character-choice--selected' : ''}`} aria-pressed={selected} onClick={() => setSelectedShowcaseCharacterId(entry.characterId)}>
                    {character.iconUrl ? <img src={character.iconUrl} alt="" loading="lazy" /> : <span>{character.initials}</span>}
                    <strong>{character.name}</strong>
                  </button>;
                })}
              </div>
              {selectedShowcaseEntry && <ShowcaseBuildCard key={selectedShowcaseEntry.characterId} entry={selectedShowcaseEntry} />}
              <p className="showcase-disclaimer">A comparação mostra seus atributos equipados e as recomendações cadastradas. Ela ainda não calcula uma nota ou pontuação para cada build.</p>
            </section>
          </details>}
        </section>}

        {activeNav === 'Meu plano' && <section className="goals-section" id="my-goals">
          <div className="section-heading goals-heading">
            <div><div className="section-kicker">SEU PRÓXIMO CAPÍTULO <span>✧</span></div><h2>Meus objetivos</h2><p>Organize o que quer melhorar e acompanhe seu progresso.</p></div>
            <div className="recommendation-count"><strong>{goals.filter((goal) => goal.progress >= goal.target).length}/{goals.length}</strong><span>OBJETIVOS<br />CONCLUÍDOS</span></div>
          </div>
          <form className="goal-form" onSubmit={addGoal}>
            <label className="goal-title-field"><span>Objetivo</span><input name="title" required maxLength={90} placeholder="Ex.: levar a Xiangling ao nível 80" /></label>
            <label><span>Tipo</span><select name="category"><option value="character">Personagem</option><option value="weapon">Arma</option><option value="artifacts">Artefatos</option><option value="exploration">Exploração</option><option value="other">Outro</option></select></label>
            <label><span>Personagem</span><select name="characterId"><option value="">Nenhum</option>{roster.map((id) => getCharacter(id)).filter(Boolean).map((character) => <option key={character.id} value={character.id}>{character.name}</option>)}</select></label>
            <label className="goal-number-field"><span>Progresso</span><input name="progress" type="number" min="0" defaultValue="0" /></label>
            <label className="goal-number-field"><span>Meta</span><input name="target" type="number" min="1" defaultValue="1" /></label>
            <button className="primary-button" type="submit">Adicionar objetivo <span>＋</span></button>
          </form>
          {goals.length ? <div className="goal-list">{goals.map((goal) => {
            const character = goal.characterId ? getCharacter(goal.characterId) : null;
            const hasChecklist = Array.isArray(goal.checklist);
            const progress = hasChecklist ? goal.checklist.filter((task) => task.done).length : goal.progress;
            const target = hasChecklist ? goal.checklist.length : goal.target;
            const complete = progress >= target;
            const percentage = target ? Math.round((progress / target) * 100) : 0;
            return <article className={`goal-card${complete ? ' goal-card--complete' : ''}`} key={goal.id}>
              <div className="goal-card-heading"><div><span className="goal-category">{{ character: 'PERSONAGEM', weapon: 'ARMA', artifacts: 'ARTEFATOS', exploration: 'EXPLORAÇÃO', build: 'BUILD', other: 'OUTRO' }[goal.category] || 'OBJETIVO'}</span><h3>{goal.title}</h3>{character && <small>{character.name}</small>}</div><button type="button" className="goal-remove" aria-label={`Remover objetivo: ${goal.title}`} onClick={() => setGoals((current) => current.filter((item) => item.id !== goal.id))}>×</button></div>
              {hasChecklist && <div className="goal-checklist">{goal.checklist.map((task) => <label className={task.done ? 'goal-task goal-task--done' : 'goal-task'} key={task.id}><input type="checkbox" checked={task.done} onChange={() => toggleGoalTask(goal.id, task.id)} /><span>{task.label}</span></label>)}</div>}
              <div className="goal-progress-track" role="progressbar" aria-label={`Progresso de ${goal.title}`} aria-valuenow={progress} aria-valuemin="0" aria-valuemax={target}><span style={{ width: `${percentage}%` }} /></div>
              <div className="goal-card-footer"><span>{complete ? 'Concluído' : `${progress} de ${target}`} · {percentage}%</span>{!hasChecklist && <div><button type="button" onClick={() => changeGoalProgress(goal.id, -1)} disabled={goal.progress === 0} aria-label="Diminuir progresso">−</button><button type="button" onClick={() => changeGoalProgress(goal.id, 1)} disabled={complete} aria-label="Aumentar progresso">＋</button></div>}</div>
            </article>;
          })}</div> : <div className="empty-state goals-empty-state"><span>✧</span><strong>Seu primeiro objetivo começa aqui</strong><p>Crie uma meta para acompanhar personagens, armas, artefatos ou exploração.</p></div>}
          <p className="goals-save-note">{session?.user && !cloudGoalsAvailable ? 'Objetivos salvos neste navegador. Execute o schema.sql atualizado para sincronizá-los na nuvem.' : session?.user && profileStatus === 'synced' ? 'Objetivos sincronizados com sua conta.' : session?.user && profileStatus === 'saving' ? 'Sincronizando objetivos…' : session?.user && profileStatus === 'error' ? 'Não foi possível sincronizar agora; os dados locais permanecem neste navegador.' : 'Objetivos salvos automaticamente neste navegador.'}</p>
        </section>}
        <footer className="page-footer"><span>TEYVAT COMPASS <i>✦</i> UMA FERRAMENTA FEITA POR FÃS</span><span>Não afiliado à HoYoverse. Genshin Impact é propriedade da HoYoverse.</span></footer>
      </main>
    </div>
  );
}
