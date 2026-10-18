import { useEffect, useMemo, useState } from 'react';
import { characters, teams } from './data.js';
import { evaluateTeam } from './recommendations.js';
import { builds, buildSourceName } from './builds.js';
import { isSupabaseConfigured, supabase } from './lib/supabase.js';
import { enkaAvatarToCharacter, getEnkaCache, saveEnkaCache } from './enka.js';

const STORAGE_KEY = 'teyvat-compass-roster-v1';
const WEAPON_STORAGE_KEY = 'teyvat-compass-weapons-v1';
const ENKA_SHOWCASE_STORAGE_KEY = 'teyvat-compass-showcase-v1';
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

function TeamCard({ team, roster, evaluation, ownedWeapons, onToggleWeapon }) {
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
      <details className="team-builds">
        <summary>Builds recomendadas para este time <span>↓</span></summary>
        <p className="builds-context">Marque as armas que você tem. As suas aparecem primeiro; recomendações variam conforme equipe e rotação.</p>
        <div className="team-build-list">
          {team.slots.map((slot, index) => {
            const character = evaluation.lineup[index]?.character || getCharacter(slot.characterId);
            const build = builds[character?.id];
            if (!character || !build) return null;
            return <article className="character-build" key={`${team.id}-${character.id}`}>
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
            </article>;
          })}
        </div>
      </details>
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
      <button className="team-action" onClick={() => document.getElementById('character-library')?.scrollIntoView({ behavior: 'smooth' })}>
        {missingSlots.length ? 'Ver opções para completar' : 'Editar meu elenco'} <span>→</span>
      </button>
    </article>
  );
}

const getCharacter = (id) => characters.find((character) => character.id === id);
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

  return <article className="showcase-build-card">
    <div className="showcase-character-heading">
      <span style={{ '--character-color': character.color }}>{character.initials}</span>
      <div><strong>{character.name}</strong><small>Nv. {entry.level ?? '?'} · C{entry.constellation ?? 0}</small></div>
    </div>
    <div className="showcase-current-stats">
      {stats.map(([label, value, percentage]) => <div key={label}><span>{label}</span><strong>{formatCombatStat(Number(value) || 0, percentage)}</strong></div>)}
    </div>
    <div className="showcase-compare">
      <section className="showcase-equipment">
        <h4>Equipado no Showcase</h4>
        {weapon ? <div className="showcase-weapon">
          {weapon.icon && <img src={iconUrl(weapon.icon)} alt="Ícone da arma equipada" loading="lazy" />}
          <div><strong>{weapon.name || 'Arma equipada'}</strong><span>Nv. {weapon.level ?? '?'} · R{weapon.refinement ?? '?'}</span>
            {weapon.stats?.map((stat, index) => <small key={`${stat.propId}-${index}`}>{gearStatName(stat)} {gearStatValue(stat)}</small>)}
          </div>
        </div> : <p className="showcase-no-data">Arma não informada no Showcase.</p>}
        <div className="showcase-artifacts">
          {entry.artifacts?.map((artifact) => <div className="showcase-artifact" key={artifact.id} title={`${artifactSlotNames[artifact.slot] || 'Artefato'} · Nv. ${artifact.level ?? '?'}`}>
            {artifact.icon && <img src={iconUrl(artifact.icon)} alt={`Ícone: ${artifactSlotNames[artifact.slot] || 'artefato'}`} loading="lazy" />}
            <div><strong>{artifactSlotNames[artifact.slot] || 'Artefato'} +{Math.max(0, (artifact.level ?? 1) - 1)}</strong>
              {(artifact.setName || artifact.name) && <span>{artifact.setName || artifact.name}</span>}
              {artifact.mainStat && <span>{gearStatName(artifact.mainStat)} {gearStatValue(artifact.mainStat)}</span>}
              {artifact.substats?.map((stat, index) => <small key={`${stat.propId}-${index}`}>{gearStatName(stat)} {gearStatValue(stat)}</small>)}
            </div>
          </div>)}
          {!entry.artifacts?.length && <p className="showcase-no-data">Artefatos não informados no Showcase.</p>}
        </div>
      </section>
      <section className="showcase-recommendation">
        <h4>Recomendação Teyvat Compass</h4>
        {recommendation ? <>
          <strong>{recommendation.weapons.join(' · ')}</strong>
          <span>{recommendation.artifacts.join(' · ')}</span>
          <small><b>Atributos principais:</b> {recommendation.mainStats}</small>
          <small><b>Priorize:</b> {recommendation.substats}</small>
          <a href={recommendation.source} target="_blank" rel="noreferrer">Consultar guia KQM ↗</a>
        </> : <p className="showcase-no-data">Ainda não há recomendação cadastrada para este personagem.</p>}
      </section>
    </div>
  </article>;
}

export default function App() {
  const [roster, setRoster] = useState(() => supabase ? [] : readRoster());
  const [ownedWeapons, setOwnedWeapons] = useState(() => supabase ? [] : readOwnedWeapons());
  const [enkaShowcase, setEnkaShowcase] = useState(() => supabase ? null : readEnkaShowcase());
  const [session, setSession] = useState(null);
  const [loadedProfileUserId, setLoadedProfileUserId] = useState(null);
  const [profileStatus, setProfileStatus] = useState('local');
  const [profileFeedback, setProfileFeedback] = useState('');
  const [query, setQuery] = useState('');
  const [elementFilter, setElementFilter] = useState('Todos');
  const [ownedOnly, setOwnedOnly] = useState(false);
  const [activeNav, setActiveNav] = useState('Meu plano');
  const [enkaUid, setEnkaUid] = useState('');
  const [enkaBusy, setEnkaBusy] = useState(false);
  const [enkaMessage, setEnkaMessage] = useState('');
  const [enkaError, setEnkaError] = useState('');

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
      setProfileStatus('local');
      setProfileFeedback('');
      const hasSignedInLocalProfile = supabase && localStorage.getItem(LOCAL_PROFILE_OWNER_KEY);
      if (hasSignedInLocalProfile) {
        setRoster([]);
        setOwnedWeapons([]);
        setEnkaShowcase(null);
      } else {
        setRoster(readRoster());
        setOwnedWeapons(readOwnedWeapons());
        setEnkaShowcase(readEnkaShowcase());
      }
      return undefined;
    }
    let active = true;
    const userId = session.user.id;
    setLoadedProfileUserId(null);
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
        setProfileFeedback('Confira a configuração da tabela e das políticas RLS no Supabase.');
        return;
      }

      const localOwnerId = localStorage.getItem(LOCAL_PROFILE_OWNER_KEY);
      const canImportLocal = !localOwnerId || localOwnerId === userId;
      const nextRoster = Array.isArray(data?.roster) ? data.roster : canImportLocal ? readRoster() : [];
      const nextWeapons = Array.isArray(data?.owned_weapons) ? data.owned_weapons : canImportLocal ? readOwnedWeapons() : [];
      const nextShowcase = data?.enka_showcase?.avatars ? data.enka_showcase : canImportLocal ? readEnkaShowcase() : null;
      setRoster(nextRoster);
      setOwnedWeapons(nextWeapons);
      setEnkaShowcase(nextShowcase);

      if (!data) {
        setProfileStatus('migrating');
        const { error: migrationError } = await supabase.from('player_profiles').upsert({
          user_id: userId,
          roster: nextRoster,
          owned_weapons: nextWeapons,
          enka_showcase: nextShowcase || {},
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
        localStorage.setItem(LOCAL_PROFILE_OWNER_KEY, userId);
      } catch {
        // A cloud save should still work if browser storage is unavailable.
      }
      const { error } = await supabase.from('player_profiles').upsert({
        user_id: userId,
        roster,
        owned_weapons: ownedWeapons,
        enka_showcase: enkaShowcase || {},
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      if (error) {
        setProfileStatus('error');
        setProfileFeedback('Não foi possível sincronizar agora. Seus dados continuam guardados neste navegador.');
      } else {
        setProfileStatus('synced');
        setProfileFeedback('');
      }
    }, 400);
    return () => window.clearTimeout(timer);
  }, [roster, ownedWeapons, enkaShowcase, session?.user?.id, loadedProfileUserId]);

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
    const matchesOwnership = !ownedOnly || roster.includes(character.id);
    return matchesQuery && matchesElement && matchesOwnership;
  }), [query, elementFilter, ownedOnly, roster]);

  const rankedTeams = useMemo(() => teams
    .map((team) => ({ team, evaluation: evaluateTeam(team, roster) }))
    .sort((a, b) => {
      if (!roster.length) return a.team.priority - b.team.priority;
      return b.evaluation.coveredCount - a.evaluation.coveredCount
        || b.evaluation.coreCount - a.evaluation.coreCount
        || a.team.priority - b.team.priority;
    }), [roster]);

  const navItems = [
    { label: 'Meu plano', icon: '⌂', target: 'top' },
    { label: 'Personagens', icon: '✧', target: 'character-library' },
    { label: 'Mapa', icon: '⌖', target: 'map-preview', soon: true },
  ];

  const goTo = (item) => {
    setActiveNav(item.label);
    if (item.soon) return;
    document.getElementById(item.target)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="app-shell" id="top">
      <aside className="sidebar">
        <a className="brand" href="#top" onClick={() => setActiveNav('Meu plano')}><CompassMark /><span><strong>TEYVAT</strong><small>COMPASS</small></span></a>
        <div className="sidebar-label">SUA JORNADA</div>
        <nav className="main-nav" aria-label="Navegação principal">
          {navItems.map((item) => <button key={item.label} className={activeNav === item.label ? 'active' : ''} onClick={() => goTo(item)}><span className="nav-icon">{item.icon}</span>{item.label}{item.soon && <span className="soon-tag">EM BREVE</span>}</button>)}
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

        <section className="welcome-section">
          <div className="welcome-copy">
            <div className="eyebrow"><span /> SEU GUIA DE AVENTURA</div>
            <h1>Encontre seu<br /><em>próximo time.</em></h1>
            <p>Monte uma equipe com quem já caminha ao seu lado.<br className="desktop-break" /> A gente encontra o resto do caminho.</p>
            <button className="primary-button" onClick={() => document.getElementById('character-library')?.scrollIntoView({ behavior: 'smooth' })}>Escolher meus personagens <span>↓</span></button>
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
          <div className="roster-notice"><div className="notice-icon">✧</div><div><strong>{roster.length ? `${roster.length} personagens no seu elenco` : 'Primeiro, marque quem você já tem'}</strong><span>{roster.length ? 'Os times estão ordenados pelos que você consegue montar; substitutos e posições em falta ficam indicados.' : 'Marque seus personagens para ordenar os times por compatibilidade e ver quem pode substituir quem.'}</span></div><button onClick={() => document.getElementById('character-library')?.scrollIntoView({ behavior: 'smooth' })}>{roster.length ? 'Editar elenco' : 'Selecionar elenco'} <span>→</span></button></div>
          <div className="team-grid">{rankedTeams.map(({ team, evaluation }) => <TeamCard key={team.id} team={team} roster={roster} evaluation={evaluation} ownedWeapons={ownedWeapons} onToggleWeapon={toggleWeapon} />)}</div>
          <div className="data-note"><span>ⓘ</span> Builds são uma curadoria inicial baseada nos guias KQM; confirme requisitos de Recarga e ajuste à sua equipe. Algumas trocas alteram a rotação ou o desempenho.</div>
        </section>

        <section className="library-section" id="character-library">
          <div className="library-heading">
            <div><div className="section-kicker">SEU ELENCO <span>✧</span></div><h2>Quem já está com você?</h2><p>Toque em um personagem para marcar ou desmarcar.</p></div>
            <div className="roster-counter"><strong>{String(roster.length).padStart(2, '0')}</strong><span>DE {characters.length} NO<br />CATÁLOGO INICIAL</span></div>
          </div>
          <form className="showcase-import" onSubmit={importShowcase}>
            <div className="showcase-import-copy"><strong>Importar do Showcase público</strong><span>Adiciona ao elenco os personagens que aparecem no seu perfil do jogo.</span></div>
            <label><span>UID do Genshin</span><input inputMode="numeric" autoComplete="off" value={enkaUid} onChange={(event) => setEnkaUid(event.target.value)} placeholder="Ex.: 800000000" maxLength={10} /></label>
            <button type="submit" disabled={enkaBusy || !session?.user || !supabase || loadedProfileUserId !== session?.user?.id}>{enkaBusy ? 'Consultando…' : 'Importar Showcase'}</button>
            {!session?.user && <small className="showcase-hint">Entre na sua conta para habilitar a importação.</small>}
            {session?.user && loadedProfileUserId !== session.user.id && <small className="showcase-hint">Carregando seu perfil…</small>}
            {enkaMessage && <p className="showcase-feedback" role="status">{enkaMessage}</p>}
            {enkaError && <p className="showcase-feedback showcase-feedback--error" role="alert">{enkaError}</p>}
          </form>
          {enkaShowcase?.avatars?.length > 0 && <section className="showcase-imported">
            <div className="showcase-imported-heading"><div><div className="section-kicker">PERFIL ENKA <span>✧</span></div><h3>Builds do Showcase{enkaShowcase.nickname ? ` · ${enkaShowcase.nickname}` : ''}</h3><p>Dados importados em {new Date(enkaShowcase.importedAt).toLocaleString('pt-BR')} · Mundo {enkaShowcase.worldLevel ?? '—'}</p></div><span>{enkaShowcase.avatars.length} PERSONAGENS</span></div>
            <div className="showcase-build-grid">{enkaShowcase.avatars.map((entry) => <ShowcaseBuildCard key={entry.characterId} entry={entry} />)}</div>
            <p className="showcase-disclaimer">A comparação mostra seus atributos equipados e as recomendações cadastradas. Ela ainda não calcula uma nota ou pontuação para cada build.</p>
          </section>}
          <div className="library-controls">
            <label className="search-box"><span>⌕</span><input aria-label="Buscar personagem" placeholder="Buscar personagem..." value={query} onChange={(event) => setQuery(event.target.value)} /><kbd>⌘ K</kbd></label>
            <div className="element-filters" aria-label="Filtrar por elemento">{['Todos', 'Pyro', 'Hydro', 'Anemo', 'Electro', 'Cryo', 'Geo', 'Dendro'].map((element) => <button key={element} className={elementFilter === element ? 'selected' : ''} onClick={() => setElementFilter(element)}>{element}</button>)}</div>
            <button className={`owned-filter${ownedOnly ? ' selected' : ''}`} onClick={() => setOwnedOnly(!ownedOnly)}><span>{ownedOnly ? '✓' : '○'}</span> Tenho</button>
          </div>
          {filteredCharacters.length ? <div className="character-grid">{filteredCharacters.map((character) => <button key={character.id} className={`character-card${roster.includes(character.id) ? ' character-card--owned' : ''}`} onClick={() => toggleCharacter(character.id)}>
            <div className="character-portrait" style={{ '--character-color': character.color }}><div className="portrait-halo" /><span className="portrait-initials">{character.initials}</span><span className="portrait-element">{character.element === 'Electro' ? 'ϟ' : character.element === 'Pyro' ? '♨' : character.element === 'Hydro' ? '◌' : character.element === 'Cryo' ? '❄' : character.element === 'Anemo' ? '〰' : '◇'}</span>{roster.includes(character.id) && <span className="owned-check">✓</span>}</div>
            <div className="character-details"><div className="character-name-row"><strong>{character.name}</strong><span>{'★'.repeat(character.rarity)}</span></div><div className="character-subline"><span>{character.element}</span><i />{character.role}</div></div>
            <div className={`ownership-state${roster.includes(character.id) ? ' ownership-state--owned' : ''}`}>{roster.includes(character.id) ? 'NO SEU ELENCO' : '+ ADICIONAR'}</div>
          </button>)}</div> : <div className="empty-state"><span>⌕</span><strong>Nenhum viajante encontrado</strong><p>Tente outro nome, elemento ou filtro.</p></div>}
          <div className="library-footnote"><span>◉</span> Seleção salva automaticamente apenas neste navegador. <button onClick={() => { setRoster([]); localStorage.removeItem(STORAGE_KEY); }}>Limpar seleção</button></div>
        </section>

        <section className="map-preview" id="map-preview">
          <div className="map-mini-art"><div className="map-grid-lines" /><span className="map-pin">⌖</span><i className="map-route" /></div>
          <div className="map-preview-copy"><span className="section-kicker">SEU PRÓXIMO CAPÍTULO <span>✧</span></span><h2>Explore no seu ritmo.</h2><p>Um mapa com seus pontos de interesse e o progresso da sua jornada está no horizonte.</p></div>
          <span className="coming-soon">EM BREVE</span>
        </section>
        <footer className="page-footer"><span>TEYVAT COMPASS <i>✦</i> UMA FERRAMENTA FEITA POR FÃS</span><span>Não afiliado à HoYoverse. Genshin Impact é propriedade da HoYoverse.</span></footer>
      </main>
    </div>
  );
}
