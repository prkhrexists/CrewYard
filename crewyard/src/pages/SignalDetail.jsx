import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Bookmark } from 'lucide-react';
import { mockSignals } from '../data/mockSignals';
import { formatRelativeTime } from '../utils/time';

export default function SignalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const signal = mockSignals.find(s => s.id === id);

  if (!signal) {
    return (
      <div className="min-h-screen bg-[var(--bg)] p-8 flex flex-col items-center justify-center">
        <h1 className="font-display font-black text-4xl text-[var(--text)] uppercase tracking-tight mb-4">SIGNALS ARE QUIET.</h1>
        <p className="font-mono text-sm text-[var(--text)] uppercase opacity-70 mb-8">We couldn't refresh the latest updates.</p>
        <button onClick={() => navigate('/signals')} className="font-mono text-[10px] tracking-[0.1em] font-bold border-2 border-[var(--text)] px-4 py-2 uppercase hover:bg-[var(--text)] hover:text-[var(--bg)] transition-colors">
          TRY AGAIN
        </button>
      </div>
    );
  }

  const relatedSignals = mockSignals
    .filter(s => s.id !== id && (s.category === signal.category || s.type === signal.type))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[var(--bg)] p-6 lg:p-12 max-w-4xl mx-auto">
      
      {/* Top Nav */}
      <div className="flex items-center justify-between mb-12">
        <button onClick={() => navigate('/signals')} className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.1em] uppercase text-[var(--text)] hover:text-[var(--accent)] transition-colors">
          <ArrowLeft size={14} /> BACK TO SIGNALS
        </button>
        
        <button className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.1em] uppercase border-2 border-[var(--text)] px-3 py-1.5 hover:bg-[var(--text)] hover:text-[var(--bg)] transition-colors">
          <Bookmark size={12} /> SAVE
        </button>
      </div>

      {/* Header */}
      <header className="mb-12 border-b-2 border-[var(--text)] pb-8">
        <div className="flex items-center gap-4 mb-6">
          <span className="font-mono text-[10px] font-bold tracking-[0.1em] text-[var(--bg)] bg-[var(--text)] px-2 py-1 uppercase">
            {signal.category}
          </span>
          <span className="font-mono text-[10px] tracking-wider text-[var(--text)] opacity-70 uppercase">
            {formatRelativeTime(signal.publishedAt)}
          </span>
          <span className="font-mono text-[10px] tracking-wider text-[var(--text)] opacity-70 uppercase">
            BY {signal.author || signal.source}
          </span>
        </div>
        
        <h1 className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-[var(--text)] leading-none tracking-tight mb-6">
          {signal.title}
        </h1>
        
        <p className="font-sans text-xl md:text-2xl text-[var(--text)] leading-relaxed opacity-90 max-w-3xl">
          {signal.summary}
        </p>
      </header>

      {/* Why It Matters */}
      {signal.whyItMatters && (
        <div className="border-2 border-[var(--accent)] bg-[var(--surface-2)] p-6 md:p-8 mb-12 shadow-[6px_6px_0px_0px_var(--shadow)]">
          <h2 className="font-mono text-[11px] font-bold tracking-[0.15em] text-[var(--accent)] uppercase mb-3">WHY IT MATTERS</h2>
          <p className="font-sans text-lg text-[var(--text)] leading-relaxed">{signal.whyItMatters}</p>
        </div>
      )}

      {/* Main Content (Mocked) */}
      <article className="font-sans text-lg text-[var(--text)] leading-relaxed opacity-80 mb-12 space-y-6 max-w-3xl">
        <p>This is a detailed view of the signal. In a real implementation, this would contain the full parsed article, README, or release notes fetched from the source API or RSS feed.</p>
        <p>CrewYard's Signals feature aggregates the most important news, releases, and tools for builders, ensuring you don't miss out on critical industry shifts while building.</p>
      </article>

      {/* Tags & Source */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-6 border-y border-[var(--text)] mb-16">
        <div className="flex flex-wrap gap-2">
          {signal.tags.map(tag => (
            <span key={tag} className="font-mono text-[10px] tracking-[0.06em] text-[var(--text)] border border-[var(--text)] px-2 py-1 uppercase hover:bg-[var(--text)] hover:text-[var(--bg)] transition-colors cursor-pointer">
              {tag}
            </span>
          ))}
        </div>
        
        <a 
          href={signal.sourceUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 font-mono text-[12px] font-bold tracking-[0.1em] uppercase bg-[var(--accent)] text-white px-6 py-3 hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          OPEN ORIGINAL <ExternalLink size={14} />
        </a>
      </div>

      {/* Related Signals */}
      {relatedSignals.length > 0 && (
        <section>
          <h3 className="font-mono text-sm font-bold tracking-[0.1em] uppercase text-[var(--text)] mb-6 border-b-2 border-[var(--text)] pb-2">
            RELATED SIGNALS
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedSignals.map(rs => (
              <div 
                key={rs.id} 
                onClick={() => navigate(`/signals/${rs.id}`)}
                className="group border border-[var(--text)] p-5 cursor-pointer hover:bg-[var(--surface-2)] transition-colors"
              >
                <span className="font-mono text-[9px] tracking-wider uppercase text-[var(--text)] opacity-70 mb-2 block">{rs.type}</span>
                <h4 className="font-display font-bold text-lg text-[var(--text)] leading-tight mb-2 group-hover:text-[var(--accent)] transition-colors">{rs.title}</h4>
                <p className="font-mono text-[9px] text-[var(--text)] opacity-60 uppercase">{formatRelativeTime(rs.publishedAt)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
