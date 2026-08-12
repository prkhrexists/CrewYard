import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

const CatContext = createContext(null);

export function CatProvider({ children }) {
  const [contextData, setContextData] = useState({
    page: null,
    target: null,
    data: null
  });

  const [activeReaction, setActiveReaction] = useState(null);
  
  // Expose a way to set what page/context the cat is currently in
  const setContext = useCallback((ctx) => {
    setContextData(prev => ({ ...prev, ...ctx }));
  }, []);

  // Expose a way to trigger one-off reactions (e.g. 'group-joined', 'signal-opened')
  const react = useCallback((reactionType) => {
    setActiveReaction(reactionType);
    // Clear reaction after a short time so it can trigger again
    setTimeout(() => setActiveReaction(null), 2000);
  }, []);

  return (
    <CatContext.Provider value={{ contextData, setContext, react, activeReaction }}>
      {children}
    </CatContext.Provider>
  );
}

export function useCat() {
  const ctx = useContext(CatContext);
  if (!ctx) {
    // If used outside provider, just return no-ops to avoid crashing
    return { 
      contextData: { page: null, target: null, data: null },
      setContext: () => {}, 
      react: () => {},
      activeReaction: null
    };
  }
  return ctx;
}
