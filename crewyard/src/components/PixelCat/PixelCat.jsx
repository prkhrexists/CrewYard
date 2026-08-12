import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useCat } from '../../context/CatContext';
import CatAssistant from './CatAssistant';
import { IDLE_SPRITE, BLINK_SPRITE, WAG_SPRITE, LOOKING_LEFT_SPRITE, PICKED_UP_SPRITE, DROPPED_SPRITE, PALETTE } from './catSprites';

const CatSVG = ({ sprite }) => {
  return (
    <svg 
      width="56" 
      height="84" 
      viewBox="0 0 28 42" 
      xmlns="http://www.w3.org/2000/svg" 
      className="drop-shadow-[2px_2px_0_var(--accent)]"
      style={{ imageRendering: 'pixelated' }}
    >
      {sprite.map((row, y) => (
        row.split('').map((char, x) => {
          if (char === ' ') return null;
          return <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={PALETTE[char]} />
        })
      ))}
    </svg>
  );
};

export default function PixelCat() {
  const { contextData, activeReaction } = useCat();
  const [showChat, setShowChat] = useState(false);
  
  // Cat State
  const [catState, setCatState] = useState('IDLE');
  const [sprite, setSprite] = useState(IDLE_SPRITE);
  const [xPos, setXPos] = useState(0);
  const [facingLeft, setFacingLeft] = useState(true);
  
  const idleTimer = useRef(null);
  const actionTimer = useRef(null);
  const lastMouseTime = useRef(Date.now());
  const mousePos = useRef({ x: 0, y: 0 });

  const BUBBLE_TEXTS = ["Meow?", "Purr...", "*yawns*", "Building?", "Need a hand?", "Ship it!", "Squish that cat.", "LGTM!", "I'm hungry.", "Pawsome."];
  const [bubbleText, setBubbleText] = useState(BUBBLE_TEXTS[0]);

  // Dragging State
  const [position, setPosition] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 100 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  // Initial mount positioning
  useEffect(() => {
    setPosition({ x: window.innerWidth - 100, y: window.innerHeight - 150 });
  }, []);

  // Handle reactions injected by pages
  useEffect(() => {
    if (!activeReaction) return;
    
    // Clear ambient timeouts
    clearTimeout(idleTimer.current);
    clearTimeout(actionTimer.current);

    if (activeReaction === 'group-joined' || activeReaction === 'success') {
      setCatState('EXCITED');
      setSprite(WAG_SPRITE);
    } else if (activeReaction === 'signal-opened' || activeReaction === 'post-opened') {
      setCatState('CURIOUS');
      setSprite(LOOKING_LEFT_SPRITE);
    } else if (activeReaction === 'search-started') {
      setCatState('LOOKING');
      setSprite(LOOKING_LEFT_SPRITE);
    }

    actionTimer.current = setTimeout(() => {
        setCatState('IDLE');
        setSprite(IDLE_SPRITE);
        setBubbleText(BUBBLE_TEXTS[Math.floor(Math.random() * BUBBLE_TEXTS.length)]);
      }, 2000);

  }, [activeReaction]);

  // Ambient Behavior Machine
  useEffect(() => {
    if (catState !== 'IDLE' || showChat) return;

    const timer = setTimeout(() => {
      // Check for sleep (no mouse movement for 45s)
      const timeSinceMouse = Date.now() - lastMouseTime.current;
      if (timeSinceMouse > 45000) {
        setCatState('SLEEPING');
        setSprite(IDLE_SPRITE);
        return;
      }

      const rand = Math.random();
      
      if (rand < 0.30) {
        setCatState('BLINK');
        setSprite(BLINK_SPRITE);
        actionTimer.current = setTimeout(() => {
          setSprite(IDLE_SPRITE);
          setCatState('IDLE');
          setBubbleText(BUBBLE_TEXTS[Math.floor(Math.random() * BUBBLE_TEXTS.length)]);
        }, 200);
      } else if (rand < 0.50) {
        setCatState('WAG');
        setSprite(WAG_SPRITE);
        actionTimer.current = setTimeout(() => {
          setSprite(IDLE_SPRITE);
          setCatState('IDLE');
          setBubbleText(BUBBLE_TEXTS[Math.floor(Math.random() * BUBBLE_TEXTS.length)]);
        }, 800);
      } else if (rand < 0.70) {
        setCatState('WALKING');
        setSprite(IDLE_SPRITE);
        
        // Use functional state update to avoid depending on xPos
        setXPos(prevX => {
          const newTarget = Math.floor(Math.random() * 150);
          setFacingLeft(newTarget > prevX);
          return newTarget;
        });
        
        actionTimer.current = setTimeout(() => {
          setCatState('IDLE');
          setBubbleText(BUBBLE_TEXTS[Math.floor(Math.random() * BUBBLE_TEXTS.length)]);
        }, 1500);
      } else {
        setCatState('CURIOUS');
        setSprite(LOOKING_LEFT_SPRITE);
        actionTimer.current = setTimeout(() => {
          setSprite(IDLE_SPRITE);
          setCatState('IDLE');
          setBubbleText(BUBBLE_TEXTS[Math.floor(Math.random() * BUBBLE_TEXTS.length)]);
        }, 1500);
      }
    }, Math.random() * 8000 + 2000); // Between 2 and 10 seconds

    return () => clearTimeout(timer);
  }, [catState, showChat]);

  // Mouse Tracking
  useEffect(() => {
    let throttleTimeout = null;

    const handleMouseMove = (e) => {
      if (throttleTimeout) return;
      
      throttleTimeout = setTimeout(() => {
        mousePos.current = { x: e.clientX, y: e.clientY };
        lastMouseTime.current = Date.now();
        
        // Wake up if sleeping
        if (catState === 'SLEEPING') {
          setCatState('IDLE');
          setSprite(BLINK_SPRITE);
          setTimeout(() => setSprite(IDLE_SPRITE), 300);
        }

        throttleTimeout = null;
      }, 100);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [catState]);

  // Drag Handlers
  const handlePointerDown = (e) => {
    e.preventDefault();
    hasMoved.current = false;
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    
    const handlePointerMove = (ev) => {
      hasMoved.current = true;
      setIsDragging(true);
      setCatState('PICKED_UP');
      setSprite(PICKED_UP_SPRITE);
      
      let newX = ev.clientX - dragOffset.current.x;
      let newY = ev.clientY - dragOffset.current.y;
      
      // Basic bounds
      newX = Math.max(0, Math.min(window.innerWidth - 60, newX));
      newY = Math.max(0, Math.min(window.innerHeight - 90, newY));
      
      setPosition({ x: newX, y: newY });
    };
    
    const handlePointerUp = () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      
      if (hasMoved.current) {
        setIsDragging(false);
        setCatState('DROPPED');
        setSprite(DROPPED_SPRITE);
        
        clearTimeout(actionTimer.current);
        actionTimer.current = setTimeout(() => {
          setCatState('IDLE');
          setSprite(IDLE_SPRITE);
          setBubbleText(BUBBLE_TEXTS[Math.floor(Math.random() * BUBBLE_TEXTS.length)]);
        }, 600);
      }
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
  };

  const handleClick = (e) => {
    if (hasMoved.current) {
      e.stopPropagation();
      return;
    }
    setShowChat(!showChat);
    setCatState('IDLE');
    setSprite(IDLE_SPRITE);
    setBubbleText(BUBBLE_TEXTS[Math.floor(Math.random() * BUBBLE_TEXTS.length)]);
  };

  return (
    <>
      <div 
        onMouseDown={handlePointerDown}
        onClick={handleClick}
        className={`fixed z-50 select-none transition-all ease-in-out ${isDragging ? 'cursor-grabbing duration-0' : 'cursor-pointer duration-500 hover:-translate-y-2'} ${catState === 'WALKING' && !isDragging ? 'animate-bounce-short' : ''}`}
        title="CrewYard Assistant"
        style={{ 
          left: 0,
          top: 0,
          transform: `translate(${position.x - xPos}px, ${position.y}px)`,
        }}
      >
        <div 
          className="relative transition-transform duration-300"
          style={{ transform: facingLeft ? 'scaleX(1)' : 'scaleX(-1)' }}
        >
          <CatSVG sprite={sprite} />
          
          {/* Status bubbles (flip back so text isn't backward) */}
          <div style={{ transform: facingLeft ? 'scaleX(1)' : 'scaleX(-1)' }}>
            {catState === 'SLEEPING' && !showChat && (
              <div className="absolute -top-2 right-2 font-mono text-[10px] bg-cy-bg border-2 border-cy-ink px-1.5 py-0.5 shadow-[2px_2px_0_0_var(--text)] animate-pulse">
                Zzz
              </div>
            )}
            {catState === 'IDLE' && !showChat && (
              <div className="absolute -top-2 right-2 font-mono text-[10px] bg-cy-bg border-2 border-cy-ink px-1.5 py-0.5 shadow-[2px_2px_0_0_var(--text)] opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                {bubbleText}
              </div>
            )}
            {(catState === 'CURIOUS' || catState === 'EXCITED') && !showChat && (
              <div className="absolute -top-2 right-2 font-mono text-[12px] text-cy-orange font-bold animate-bounce">
                !
              </div>
            )}
          </div>
        </div>
      </div>

      {showChat && <CatAssistant onClose={() => setShowChat(false)} catPosition={{ x: position.x - xPos, y: position.y }} />}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes bounce-short {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce-short {
          animation: bounce-short 0.3s ease-in-out infinite;
        }
      `}} />
    </>
  );
}
