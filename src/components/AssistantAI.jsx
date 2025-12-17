import React, { useState } from 'react';
import './AssistantAI.css';

const DEFAULT_MESSAGES = [
  { from: 'ai', text: 'Salom! Men sizga yordam bera olaman. Savolingizni yozing yoki qanday yordam kerakligini so‘rang.' }
];

export default function AssistantAI() {
  const [messages, setMessages] = useState(DEFAULT_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input };
    setMessages(msgs => [...msgs, userMsg]);
    setInput('');
    setLoading(true);
    // Simulate AI response (replace with real API call if needed)
    setTimeout(() => {
      setMessages(msgs => [...msgs, { from: 'ai', text: 'AI javobi: ' + userMsg.text }]);
      setLoading(false);
    }, 1200);
  };

  // Minimized by default, open only on click
  return (
    <div
      className={`assistant-ai${open ? ' open' : ' minimized'}`}
    >
      <div className="assistant-header" onClick={() => setOpen(o => !o)} style={{cursor:'pointer'}}>
        <span className="robot-avatar">
          {/* SVG robot icon */}
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" y="10" width="20" height="14" rx="7" fill="#6366f1"/>
            <rect x="10" y="16" width="4" height="4" rx="2" fill="#fff"/>
            <rect x="18" y="16" width="4" height="4" rx="2" fill="#fff"/>
            <rect x="14" y="24" width="4" height="2" rx="1" fill="#fff"/>
            <rect x="14.5" y="6" width="3" height="6" rx="1.5" fill="#6366f1"/>
            <circle cx="6" cy="14" r="2" fill="#6366f1"/>
            <circle cx="26" cy="14" r="2" fill="#6366f1"/>
          </svg>
        </span>
        <span style={{marginLeft: 8}}>AI Yordamchi</span>
      </div>
      {open && (
        <>
          <div className="assistant-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`assistant-msg ${msg.from}`}>{msg.text}</div>
            ))}
            {loading && <div className="assistant-msg ai">Yuklanmoqda...</div>}
          </div>
          <form className="assistant-input-row" onSubmit={sendMessage}>
            <input
              type="text"
              placeholder="Savolingizni yozing..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>Yuborish</button>
          </form>
        </>
      )}
    </div>
  );
}
