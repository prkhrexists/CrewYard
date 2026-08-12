import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { useAuth } from "../context/AuthContext";

// ─────────────────────────────────────────────────────────────
//  Static mock thread data (preserved from Phase 1)
// ─────────────────────────────────────────────────────────────
const INITIAL_THREADS = [
  {
    id: "t1",
    participantName: "Priya Nair",
    participantUsername: "priya_builds",
    avatarSeed: "priya_builds",
    lastMessage: "Yeah, let me know if the Supabase realtime approach works for you!",
    lastTime: "11m ago",
    messages: [
      { id: "m1", from: "priya_builds", text: "Hey! Saw your Razorpay webhook question on the board.", time: "9:41 AM" },
      { id: "m2", from: "me", text: "Yeah, been stuck on it for two days now 😅", time: "9:42 AM" },
      { id: "m3", from: "priya_builds", text: "The issue is probably the body parsing — Next.js App Router reads the stream once. You need to call req.text() before any middleware touches it.", time: "9:44 AM" },
      { id: "m4", from: "me", text: "Oh wait, I think that's exactly it. Let me try.", time: "9:45 AM" },
      { id: "m5", from: "priya_builds", text: "Yeah, let me know if the Supabase realtime approach works for you!", time: "9:50 AM" },
    ],
  },
  {
    id: "t2",
    participantName: "Karan Mehta",
    participantUsername: "karan_hacks",
    avatarSeed: "karan_hacks",
    lastMessage: "We're doing standups at 9pm IST, works?",
    lastTime: "2h ago",
    messages: [
      { id: "m1", from: "karan_hacks", text: "Saw you're interested in the SIH agriculture team!", time: "7:15 PM" },
      { id: "m2", from: "me", text: "Yes! ML + drone imagery is right up my alley. What's the dataset size?", time: "7:18 PM" },
      { id: "m3", from: "karan_hacks", text: "Around 8k labelled images. We have AWS Educate credits too.", time: "7:20 PM" },
      { id: "m4", from: "karan_hacks", text: "We're doing standups at 9pm IST, works?", time: "7:22 PM" },
    ],
  },
  {
    id: "t3",
    participantName: "Divya Krishnan",
    participantUsername: "divya_fs",
    avatarSeed: "divya_fs",
    lastMessage: "Cloudinary free tier is more than enough for campus scale 👍",
    lastTime: "Yesterday",
    messages: [
      { id: "m1", from: "divya_fs", text: "Loved your build log for the lost & found app!", time: "Yesterday" },
      { id: "m2", from: "me", text: "Thanks! How did you handle image upload costs?", time: "Yesterday" },
      { id: "m3", from: "divya_fs", text: "Cloudinary free tier is more than enough for campus scale 👍", time: "Yesterday" },
    ],
  },
  {
    id: "t4",
    participantName: "Sneha Reddy",
    participantUsername: "sneha_404",
    avatarSeed: "sneha_404",
    lastMessage: "useRef flag is the cleanest solution tbh",
    lastTime: "3d ago",
    messages: [
      { id: "m1", from: "sneha_404", text: "For the useEffect double-fire — just use a ref flag.", time: "3d ago" },
      { id: "m2", from: "me", text: "Like `const ran = useRef(false)` at the top?", time: "3d ago" },
      { id: "m3", from: "sneha_404", text: "Exactly. Check the flag before running the POST, then set it to true.", time: "3d ago" },
      { id: "m4", from: "me", text: "Clean. Thanks!", time: "3d ago" },
      { id: "m5", from: "sneha_404", text: "useRef flag is the cleanest solution tbh", time: "3d ago" },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────
function getInitials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2)
    .map((w) => w[0].toUpperCase()).join("");
}

function Avatar({ seed, name, size = "sm" }) {
  const dim = size === "lg" ? "w-9 h-9" : "w-7 h-7";
  return (
    <div className={`${dim} rounded-full overflow-hidden border border-cy-ink
                    bg-cy-ink flex items-center justify-center shrink-0`}
         aria-hidden="true">
      <img
        src={`/avatars/avatar_09.jpg`}
        alt={name}
        className="w-full h-full object-cover"
        onError={(e) => { e.target.style.display = "none"; }}
      />
      <span className="font-mono text-[8px] font-bold text-white absolute">
        {getInitials(name)}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Thread list item
// ─────────────────────────────────────────────────────────────
function ThreadItem({ thread, isActive, onClick }) {
  return (
    <li>
      <button
        id={`thread-btn-${thread.id}`}
        onClick={onClick}
        aria-pressed={isActive}
        className="w-full text-left flex items-start gap-3 px-4 py-3
                   border-b border-cy-ink transition-colors duration-150"
        style={{
          borderBottomWidth: "1px",
          backgroundColor: isActive ? "var(--surface-2)" : "transparent",
          border: "none",
          borderBottom: "1px solid var(--text)",
        }}
      >
        <Avatar seed={thread.avatarSeed} name={thread.participantName} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-sans font-semibold text-sm text-cy-ink truncate">
              {thread.participantName}
            </span>
            <span className="font-mono text-[9px] text-cy-muted shrink-0">
              {thread.lastTime}
            </span>
          </div>
          <p className="font-sans text-xs text-cy-muted truncate mt-0.5">
            {thread.lastMessage}
          </p>
        </div>
      </button>
    </li>
  );
}

// ─────────────────────────────────────────────────────────────
//  Message bubble
// ─────────────────────────────────────────────────────────────
function MessageBubble({ msg, isMe }) {
  return (
    <li className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-xs font-sans text-sm px-4 py-2.5",
          isMe
            ? "bg-cy-ink text-[var(--bg)]"
            : "bg-cy-bg border border-cy-ink text-cy-ink",
        ].join(" ")}
        style={{ borderWidth: isMe ? 0 : "1.5px" }}
      >
        <p className="leading-relaxed">{msg.text}</p>
        <p className={`font-mono text-[9px] mt-1.5 ${isMe ? "text-white/60" : "text-cy-muted"}`}>
          {msg.time}
        </p>
      </div>
    </li>
  );
}

// ─────────────────────────────────────────────────────────────
//  Messages page
// ─────────────────────────────────────────────────────────────
export default function Messages() {
  const [threads,  setThreads]  = useState(INITIAL_THREADS);
  const [activeId, setActiveId] = useState(INITIAL_THREADS[0].id);
  const [draft,    setDraft]    = useState("");

  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeId, threads]);

  const activeThread = threads.find((t) => t.id === activeId);

  function handleSend(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const timeStr = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit", minute: "2-digit",
    });
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== activeId) return t;
        return {
          ...t,
          lastMessage: text,
          lastTime: "Just now",
          messages: [...t.messages, { id: `m${Date.now()}`, from: "me", text, time: timeStr }],
        };
      })
    );
    setDraft("");
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 3.5rem - 1px)" }}>

      <header className="pb-4 shrink-0">
        <h1 className="font-display font-black text-4xl text-cy-ink leading-tight">
          Messages
        </h1>
        <p className="font-sans text-sm text-cy-muted mt-1">
          Your direct conversations with other builders.
        </p>
      </header>

      {/* Two-pane layout */}
      <div className="flex flex-1 border border-cy-ink overflow-hidden min-h-0"
           style={{ borderWidth: "1.5px" }}>

        {/* ── Thread list ──────────────────────────────── */}
        <nav
          className="w-60 shrink-0 border-r border-cy-ink flex flex-col overflow-y-auto bg-cy-bg"
          style={{ borderRightWidth: "1.5px" }}
          aria-label="Conversations"
        >
          <p className="px-4 py-2.5 font-mono text-[9px] tracking-[0.16em] uppercase
                        text-cy-muted border-b border-cy-ink"
             style={{ borderBottomWidth: "1px" }}>
            Conversations
          </p>
          <ul role="list">
            {threads.map((thread) => (
              <ThreadItem
                key={thread.id}
                thread={thread}
                isActive={thread.id === activeId}
                onClick={() => setActiveId(thread.id)}
              />
            ))}
          </ul>
        </nav>

        {/* ── Message thread ───────────────────────────── */}
        {activeThread ? (
          <div className="flex flex-col flex-1 min-w-0 bg-cy-bg">

            {/* Thread header */}
            <header className="px-5 py-3 border-b border-cy-ink flex items-center gap-3 shrink-0"
                    style={{ borderBottomWidth: "1px" }}>
              <Avatar seed={activeThread.avatarSeed}
                      name={activeThread.participantName} size="lg" />
              <div>
                <p className="font-sans font-semibold text-sm text-cy-ink">
                  {activeThread.participantName}
                </p>
                <p className="font-mono text-[10px] text-cy-muted">
                  @{activeThread.participantUsername}
                </p>
              </div>
            </header>

            {/* Message list */}
            <section className="flex-1 overflow-y-auto px-5 py-5"
                     aria-label="Message history">
              <ul className="flex flex-col gap-3">
                {activeThread.messages.map((msg) => (
                  <MessageBubble key={msg.id} msg={msg} isMe={msg.from === "me"} />
                ))}
                <li ref={messagesEndRef} aria-hidden="true" />
              </ul>
            </section>

            {/* Compose bar */}
            <form
              onSubmit={handleSend}
              className="border-t border-cy-ink px-4 py-3 flex items-center gap-3 shrink-0 bg-cy-bg"
              style={{ borderTopWidth: "1.5px" }}
              aria-label="Send a message"
            >
              <label htmlFor="message-input" className="sr-only">
                Message {activeThread.participantName}
              </label>
              <input
                id="message-input"
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`Message ${activeThread.participantName}…`}
                className="flex-1 bg-cy-bg font-sans text-sm text-cy-ink px-4 py-2.5"
                style={{ border: "1.5px solid var(--text)", borderRadius: 0, outline: "none" }}
                onFocus={(e)  => { e.target.style.borderColor = "var(--accent)"; }}
                onBlur={(e)   => { e.target.style.borderColor = "var(--text)"; }}
              />
              <button
                id="message-send-btn"
                type="submit"
                disabled={!draft.trim()}
                className="btn-primary flex items-center gap-2
                           font-mono text-xs tracking-[0.08em] uppercase
                           disabled:opacity-40 px-4 py-2.5"
              >
                Send
                <Send size={12} strokeWidth={2.5} />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="font-mono text-xs text-cy-muted tracking-[0.06em]">
              Select a conversation to start messaging.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
