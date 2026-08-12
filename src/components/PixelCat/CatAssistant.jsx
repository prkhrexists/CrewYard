import React, { useState, useEffect, useRef } from 'react';
import { useCat } from '../../context/CatContext';

export default function CatAssistant({ onClose, catPosition = { x: 0, y: 0 } }) {
  const { contextData } = useCat();
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const chatRef = useRef(null);

  // Generate contextual greeting
  const getGreeting = () => {
    switch (contextData.page) {
      case 'board':
        return "Looking for an answer?";
      case 'groups':
        return "Looking for a crew?";
      case 'campuspods':
        return "Ready to challenge another campus?";
      case 'signals':
        return "Want me to find something interesting?";
      case 'profile':
        return "Checking someone's build history?";
      default:
        return "Need something?";
    }
  };

  // Generate contextual options
  const getOptions = () => {
    switch (contextData.page) {
      case 'board':
        return ["FIND SOMETHING", "ASK ABOUT CREWYARD", "FIND SIMILAR POSTS"];
      case 'groups':
        return ["FIND A GROUP", "FIND A CREW", "FIND BUILDERS"];
      case 'campuspods':
        return ["SEE LEADERBOARD", "HOW IT WORKS", "CHALLENGE"];
      case 'signals':
        return ["EXPLAIN THIS", "FIND MORE LIKE THIS", "WHAT'S NEW"];
      case 'profile':
        return ["FIND SIMILAR SKILLS", "COMPARE REPUTATION"];
      default:
        return ["ASK ABOUT CREWYARD", "FIND SOMETHING", "WHAT'S NEW"];
    }
  };

  // Initialize with greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: 'bot', text: getGreeting() }]);
    }
  }, [contextData.page]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (text) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInputValue('');
    
    // Simulate thinking and reply
    setTimeout(() => {
      let reply = "I'm just a cat. I don't know everything yet!";
      const lower = text.toLowerCase();
      
      if (lower.includes("what's new") || lower.includes("whats new")) {
        reply = "We just launched Signals! It's an intelligence desk for builders.";
      } else if (lower.includes("find something")) {
        reply = "Check out the Board for asks, or CampusPods to find a crew.";
      } else if (lower.includes("how it works")) {
        reply = "You build things, post them here, and earn reputation. It's simple!";
      } else if (lower.includes("find a crew")) {
        reply = "Head over to the CampusPods section and challenge someone, or check out Groups.";
      } else if (lower.includes("leaderboard")) {
        reply = "VIT Vellore is currently #1. Try to dethrone them in CampusPods!";
      }
      
      setMessages(prev => [...prev, { role: 'bot', text: reply }]);
    }, 600);
  };

  const bottomOffset = window.innerHeight - catPosition.y + 10;
  const leftOffset = Math.max(16, Math.min(catPosition.x - 132, window.innerWidth - 320 - 16));

  return (
    <div 
      className="fixed z-[60] w-[320px] bg-cy-bg border-4 border-cy-ink shadow-[8px_8px_0_0_var(--text)] flex flex-col transition-all duration-300"
      style={{ bottom: bottomOffset, left: leftOffset }}
    >
      <div className="bg-cy-ink text-[var(--bg)] px-4 py-2.5 flex items-center justify-between font-mono text-xs font-bold uppercase tracking-widest">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 bg-cy-green rounded-full animate-pulse"></span>
          CrewCat
        </span>
        <button onClick={onClose} className="hover:text-cy-orange transition-colors">✕</button>
      </div>
      
      <div ref={chatRef} className="p-5 h-64 overflow-y-auto flex flex-col gap-4 bg-[url('/noise.png')] custom-scrollbar">
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`relative p-3 text-sm font-sans shadow-[3px_3px_0_0_var(--text)] border-2 border-cy-ink max-w-[85%] ${msg.role === 'user' ? 'self-end bg-cy-orange text-white' : 'self-start bg-white'}`}>
            {msg.text}
            <div className={`absolute -bottom-2 w-3 h-3 bg-white border-b-2 border-r-2 border-cy-ink transform rotate-45 ${msg.role === 'user' ? 'right-4 bg-cy-orange' : 'left-4 bg-white'}`}></div>
          </div>
        ))}

        {/* Options */}
        {messages.length === 1 && (
          <div className="flex flex-col gap-2 mt-2 items-end">
            {getOptions().map((opt, i) => (
              <button key={i} onClick={() => handleSend(opt)} className="font-mono text-[10px] tracking-wider font-bold border-2 border-cy-ink bg-cy-bg px-3 py-1.5 uppercase hover:bg-cy-ink hover:text-[var(--bg)] transition-colors shadow-[2px_2px_0_0_var(--text)]">
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>

      <form 
        className="p-3 border-t-4 border-cy-ink bg-white flex gap-2"
        onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }}
      >
        <input 
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask me something..."
          className="flex-1 bg-cy-bg border-2 border-cy-ink p-2.5 font-sans text-sm focus:outline-none focus:border-cy-orange transition-colors placeholder:text-cy-muted"
        />
        <button className="font-mono text-[10px] font-bold uppercase tracking-widest bg-cy-ink text-[var(--bg)] px-3 border-2 border-cy-ink hover:bg-transparent hover:text-cy-ink transition-colors">
          SEND
        </button>
      </form>
    </div>
  );
}
