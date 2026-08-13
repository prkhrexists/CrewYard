import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { useCat } from '../context/CatContext';
import { mockSignals } from '../data/mockSignals';
import { formatRelativeTime } from '../utils/time';

const CATEGORIES = [
  { id: 'all', label: 'ALL' },
  { id: 'ai', label: 'AI' },
  { id: 'open-source', label: 'OPEN SOURCE' },
  { id: 'web', label: 'WEB' },
  { id: 'releases', label: 'RELEASES' },
  { id: 'startups', label: 'STARTUPS' },
  { id: 'india', label: 'INDIA' }
];

export default function Signals() {
  const navigate = useNavigate();
  const { setContext, react } = useCat();
  const [activeCategory, setActiveCategory] = useState('all');

  React.useEffect(() => {
    setContext({ page: 'signals' });
  }, [setContext]);

  // Filter signals based on category
  const filteredSignals = useMemo(() => {
    if (activeCategory === 'all') return mockSignals;
    return mockSignals.filter(s => s.category === activeCategory || s.tags.map(t => t.toLowerCase()).includes(activeCategory));
  }, [activeCategory]);

  const featuredSignal = filteredSignals.find(s => s.featured) || filteredSignals[0];
  const projects = filteredSignals.filter(s => s.type === 'project' && s.id !== featuredSignal?.id).slice(0, 4);
  const articles = filteredSignals.filter(s => s.type === 'article' && s.id !== featuredSignal?.id).slice(0, 4);
  const releases = filteredSignals.filter(s => s.type === 'release' && s.id !== featuredSignal?.id).slice(0, 5);
  const events = filteredSignals.filter(s => s.type === 'event' && s.id !== featuredSignal?.id).slice(0, 5);

  const handleSignalClick = (id) => {
    react('signal-opened');
    navigate(`/signals/${id}`);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--bg)]">

      {/* MAIN CONTENT COLUMN */}
      <div className="flex-1 p-6 lg:p-8 lg:pr-10 border-r border-cy-ink" style={{ borderRightWidth: '1.5px', borderRightColor: 'var(--text)' }}>

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-black text-4xl text-[var(--text)] uppercase tracking-tight mb-2">SIGNALS</h1>
          <p className="font-mono text-xs tracking-wider text-[var(--text)] uppercase opacity-70">Things worth knowing if you're building.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`font-mono text-[10px] tracking-[0.1em] font-bold border-2 border-[var(--text)] px-3 py-1.5 uppercase transition-colors ${activeCategory === cat.id
                  ? 'bg-[var(--text)] text-[var(--bg)]'
                  : 'hover:bg-[var(--surface-2)] text-[var(--text)]'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {filteredSignals.length === 0 ? (
          <div className="border border-dashed border-[var(--text)] opacity-70 p-12 flex flex-col items-center justify-center text-center">
            <span className="font-mono text-sm text-[var(--text)] uppercase tracking-wider font-bold mb-2">NOTHING SIGNALLED YET.</span>
            <span className="font-mono text-xs text-cy-muted uppercase">Try another topic.</span>
          </div>
        ) : (
          <div className="flex flex-col gap-10">

            {/* Featured Signal */}
            {featuredSignal && (
              <div
                onClick={() => handleSignalClick(featuredSignal.id)}
                className="group border-2 border-[var(--text)] bg-[var(--surface-2)] shadow-[6px_6px_0px_0px_var(--shadow)] p-6 md:p-8 cursor-pointer hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_0px_var(--shadow)] transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[10px] font-bold tracking-[0.1em] text-[var(--bg)] bg-[var(--text)] px-2 py-1 uppercase">
                    {featuredSignal.type}
                  </span>
                  <span className="font-mono text-[10px] text-[var(--text)] uppercase tracking-wider opacity-70">
                    {formatRelativeTime(featuredSignal.publishedAt)}
                  </span>
                </div>

                <h2 className="font-display font-bold text-3xl md:text-4xl text-[var(--text)] leading-tight mb-4 group-hover:text-[var(--accent)] transition-colors">
                  {featuredSignal.title}
                </h2>

                <p className="font-sans text-base md:text-lg text-[var(--text)] leading-relaxed mb-6 opacity-90 max-w-3xl">
                  {featuredSignal.summary}
                </p>

                {featuredSignal.whyItMatters && (
                  <div className="border-l-4 border-[var(--accent)] pl-4 mb-6">
                    <span className="block font-mono text-[10px] font-bold tracking-[0.1em] text-[var(--accent)] uppercase mb-1">WHY IT MATTERS</span>
                    <p className="font-sans text-sm text-[var(--text)] leading-relaxed">{featuredSignal.whyItMatters}</p>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-6 border-t border-[var(--text)]">
                  <div className="flex flex-wrap gap-2">
                    {featuredSignal.tags.map(tag => (
                      <span key={tag} className="font-mono text-[9px] tracking-[0.06em] text-[var(--text)] border border-[var(--text)] px-1.5 py-0.5 opacity-80 uppercase">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="font-mono text-[10px] font-bold tracking-[0.1em] text-[var(--text)] border-b-2 border-transparent group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] uppercase transition-colors flex items-center gap-1">
                    READ FULL <ArrowRight size={12} />
                  </div>
                </div>
              </div>
            )}

            {/* PROJECTS & READ 2-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* Projects Column */}
              <div>
                <div className="flex items-center justify-between mb-4 border-b-2 border-[var(--text)] pb-2">
                  <h3 className="font-mono text-sm font-bold tracking-[0.1em] uppercase text-[var(--text)]">PROJECTS</h3>
                  <span className="font-mono text-[9px] tracking-wider uppercase text-[var(--accent)] cursor-pointer hover:underline">VIEW ALL →</span>
                </div>
                <div className="flex flex-col gap-4">
                  {projects.map(project => (
                    <div
                      key={project.id}
                      onClick={() => handleSignalClick(project.id)}
                      className="group border border-[var(--text)] p-5 cursor-pointer hover:bg-[var(--surface-2)] hover:shadow-[4px_4px_0px_0px_var(--shadow)] hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all"
                    >
                      <span className="font-mono text-[9px] tracking-wider uppercase text-[var(--text)] opacity-70 mb-2 block">PROJECT</span>
                      <h4 className="font-display font-bold text-xl text-[var(--text)] leading-tight mb-2 group-hover:text-[var(--accent)] transition-colors">{project.title}</h4>
                      <p className="font-sans text-sm text-[var(--text)] opacity-80 line-clamp-2 mb-3">{project.summary}</p>

                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2 font-mono text-[9px] text-[var(--text)]">
                          <span className="font-bold">{project.source}</span>
                          <span className="opacity-50">·</span>
                          <span className="text-[var(--accent)] font-bold">{project.metrics}</span>
                          <span className="opacity-50">·</span>
                          <span className="opacity-70">Built by {project.author}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {project.tags.map(tag => (
                          <span key={tag} className="font-mono text-[8px] tracking-[0.06em] text-[var(--text)] border border-[var(--text)] px-1 py-0.5 opacity-60 uppercase">{tag}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                  {projects.length === 0 && <p className="font-mono text-[10px] text-cy-muted uppercase py-4">No projects found.</p>}
                </div>
              </div>

              {/* Read Column */}
              <div>
                <div className="flex items-center justify-between mb-4 border-b-2 border-[var(--text)] pb-2">
                  <h3 className="font-mono text-sm font-bold tracking-[0.1em] uppercase text-[var(--text)]">READ</h3>
                  <span className="font-mono text-[9px] tracking-wider uppercase text-[var(--accent)] cursor-pointer hover:underline">VIEW ALL →</span>
                </div>
                <div className="flex flex-col gap-0 border-y border-[var(--text)] divide-y divide-[var(--text)]">
                  {articles.map(article => (
                    <div
                      key={article.id}
                      onClick={() => handleSignalClick(article.id)}
                      className="group py-4 cursor-pointer hover:px-2 transition-all"
                    >
                      <h4 className="font-display font-bold text-lg text-[var(--text)] leading-tight mb-2 group-hover:text-[var(--accent)] transition-colors">{article.title}</h4>
                      <div className="flex items-center gap-3 font-mono text-[9px] tracking-wider uppercase text-[var(--text)] opacity-70">
                        <span>{article.source}</span>
                        <span>·</span>
                        <span>{article.metrics}</span>
                      </div>
                    </div>
                  ))}
                  {articles.length === 0 && <p className="font-mono text-[10px] text-cy-muted uppercase py-4">No articles found.</p>}
                </div>
              </div>

            </div>

            {/* RELEASES & HAPPENING 2-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">

              {/* Releases Column */}
              <div>
                <div className="flex items-center justify-between mb-4 border-b-2 border-[var(--text)] pb-2">
                  <h3 className="font-mono text-sm font-bold tracking-[0.1em] uppercase text-[var(--text)]">RELEASES</h3>
                </div>
                <div className="flex flex-col divide-y divide-dashed divide-[var(--text)] border-b border-dashed border-[var(--text)]">
                  {releases.map(release => (
                    <div
                      key={release.id}
                      onClick={() => handleSignalClick(release.id)}
                      className="group py-3 flex items-center justify-between cursor-pointer hover:bg-[var(--surface-2)] px-2 -mx-2 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[11px] font-bold text-[var(--text)] group-hover:text-[var(--accent)]">{release.title}</span>
                        {release.tags[0] && (
                          <span className={`font-mono text-[8px] tracking-wider px-1.5 py-0.5 text-white ${release.tags[0] === 'NEW' ? 'bg-[var(--accent)]' : 'bg-[var(--text)]'}`}>
                            {release.tags[0]}
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[9px] tracking-wider text-[var(--text)] opacity-60 uppercase">{formatRelativeTime(release.publishedAt)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Happening Column */}
              <div>
                <div className="flex items-center justify-between mb-4 border-b-2 border-[var(--text)] pb-2">
                  <h3 className="font-mono text-sm font-bold tracking-[0.1em] uppercase text-[var(--text)]">HAPPENING</h3>
                </div>
                <div className="flex flex-col divide-y divide-dashed divide-[var(--text)] border-b border-dashed border-[var(--text)]">
                  {events.map(event => (
                    <div
                      key={event.id}
                      onClick={() => handleSignalClick(event.id)}
                      className="group py-3 flex items-center justify-between cursor-pointer hover:bg-[var(--surface-2)] px-2 -mx-2 transition-colors"
                    >
                      <span className="font-mono text-[11px] font-bold text-[var(--text)] group-hover:text-[var(--accent)] truncate pr-4">{event.title}</span>
                      <span className="font-mono text-[9px] tracking-wider text-[var(--accent)] font-bold uppercase whitespace-nowrap">{event.tags[0]}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* RIGHT SIGNAL PANEL (Intelligence Desk) */}
      <div className="w-full lg:w-72 p-6 lg:p-8 bg-[var(--surface-2)] border-t lg:border-t-0 border-[var(--text)]" style={{ borderLeftWidth: '0' }}>

        {/* SECTION 1: CREWYARD SIGNAL */}
        <div className="mb-10">
          <h3 className="font-mono text-[10px] tracking-[0.15em] font-bold uppercase text-[var(--text)] mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--cat-green)] animate-pulse"></span>
            CrewYard Signal
          </h3>
          <div className="border border-[var(--text)] p-4 bg-[var(--bg)] cursor-pointer hover:shadow-[3px_3px_0px_0px_var(--shadow)] transition-all">
            <p className="font-sans text-sm text-[var(--text)] leading-snug mb-3">
              <span className="font-bold">42 builders</span> are currently discussing <span className="font-bold text-[var(--accent)]">AI Agents</span> across 8 groups.
            </p>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-[var(--text)] border border-[var(--bg)]"></div>
                <div className="w-6 h-6 rounded-full bg-gray-500 border border-[var(--bg)]"></div>
                <div className="w-6 h-6 rounded-full bg-gray-400 border border-[var(--bg)]"></div>
              </div>
              <span className="font-mono text-[9px] text-[var(--text)] font-bold tracking-wider opacity-70">+39</span>
            </div>
          </div>
        </div>

        {/* SECTION 2: MOST TALKED ABOUT */}
        <div className="mb-10">
          <h3 className="font-mono text-[10px] tracking-[0.15em] font-bold uppercase text-[var(--text)] mb-4">
            Most Talked About
          </h3>
          <ul className="flex flex-col gap-3">
            {[
              { id: '01', topic: 'AI Agents', interactions: 184 },
              { id: '02', topic: 'Next.js', interactions: 121 },
              { id: '03', topic: 'ROS2', interactions: 87 },
              { id: '04', topic: 'Computer Vision', interactions: 72 },
              { id: '05', topic: 'GSoC', interactions: 61 }
            ].map(item => (
              <li key={item.id} className="flex items-center justify-between group cursor-pointer" onClick={() => setActiveCategory(item.topic.toLowerCase())}>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] font-bold text-[var(--text)] opacity-50">{item.id}</span>
                  <span className="font-mono text-xs font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">{item.topic}</span>
                </div>
                <span className="font-mono text-[9px] text-[var(--text)] opacity-60 tracking-wider uppercase">{item.interactions} int</span>
              </li>
            ))}
          </ul>
        </div>

        {/* SECTION 3: PERSONALIZED FOR YOU */}
        <div>
          <h3 className="font-mono text-[10px] tracking-[0.15em] font-bold uppercase text-[var(--text)] mb-4">
            Personalized For You
          </h3>
          <ul className="flex flex-col gap-3">
            {[
              "3 unanswered questions you can solve",
              "2 teammates looking for Python developers",
              "New ROS2 group started yesterday",
              "4 new builders from your college joined",
              "1 active crew needs your attention"
            ].map((msg, i) => (
              <li key={i} className="font-sans text-xs text-[var(--text)] leading-relaxed flex items-start gap-2 group cursor-pointer hover:bg-[var(--bg)] p-2 -mx-2 border border-transparent hover:border-[var(--text)] transition-all">
                <MessageCircle size={12} className="mt-0.5 text-[var(--accent)] shrink-0" />
                <span className="group-hover:text-[var(--accent)] transition-colors">{msg}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}
