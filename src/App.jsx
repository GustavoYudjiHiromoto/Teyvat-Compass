import { useMemo, useState } from 'react';
import { characters, teams } from './data.js';
import { evaluateTeam } from './recommendations.js';

const STORAGE_KEY = 'teyvat-compass-roster-v1';
const readRoster = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
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

function TeamCard({ team, roster, evaluation }) {
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

export default function App() {
  const [roster, setRoster] = useState(readRoster);
  const [query, setQuery] = useState('');
  const [elementFilter, setElementFilter] = useState('Todos');
  const [ownedOnly, setOwnedOnly] = useState(false);
  const [activeNav, setActiveNav] = useState('Meu plano');

  const toggleCharacter = (id) => {
    setRoster((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
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
          <div className="local-profile"><span className="profile-glyph">✦</span><span>Viajante</span><span className="profile-chevron">⌄</span></div>
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
          <div className="team-grid">{rankedTeams.map(({ team, evaluation }) => <TeamCard key={team.id} team={team} roster={roster} evaluation={evaluation} />)}</div>
          <div className="data-note"><span>ⓘ</span> Times e substituições são uma curadoria inicial. Algumas trocas alteram a rotação ou o desempenho da equipe.</div>
        </section>

        <section className="library-section" id="character-library">
          <div className="library-heading">
            <div><div className="section-kicker">SEU ELENCO <span>✧</span></div><h2>Quem já está com você?</h2><p>Toque em um personagem para marcar ou desmarcar.</p></div>
            <div className="roster-counter"><strong>{String(roster.length).padStart(2, '0')}</strong><span>DE {characters.length} NO<br />CATÁLOGO INICIAL</span></div>
          </div>
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
