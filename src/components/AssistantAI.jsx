import React, { useState } from 'react';
import './AssistantAI.css';
import { tasksAPI } from '../services/api';

const DEFAULT_MESSAGES = [
  { from: 'ai', text: 'Salom! Men sizga yordam bera olaman. Savolingizni yozing yoki qanday yordam kerakligini so\'rang.' }
];

const getTodayString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const timeToMinutes = (time) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const minutesToTime = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const normalizeSlots = (slots) => {
  const sorted = [...slots].sort((a, b) => a.start - b.start);
  const merged = [];
  for (const slot of sorted) {
    if (!merged.length || merged[merged.length - 1].end < slot.start) {
      merged.push({ ...slot });
    } else {
      merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, slot.end);
    }
  }
  return merged;
};

const findSlot = (slots, startMin, endMin, duration) => {
  let current = startMin;
  for (const slot of slots) {
    if (current + duration <= slot.start) {
      return current;
    }
    current = Math.max(current, slot.end);
  }
  return current + duration <= endMin ? current : null;
};

const extractDurationMinutes = (line, fallbackMinutes) => {
  const hourMatch = line.match(/(\d+)\s*(h|soat)/i);
  const minMatch = line.match(/(\d+)\s*(m|min|daqiqa)/i);
  const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
  const mins = minMatch ? parseInt(minMatch[1], 10) : 0;
  const total = hours * 60 + mins;
  return total > 0 ? total : fallbackMinutes;
};

const cleanTaskTitle = (line) => {
  const cleaned = line
    .replace(/(\d+)\s*(h|soat)/gi, '')
    .replace(/(\d+)\s*(m|min|daqiqa)/gi, '')
    .replace(/[()\-–—]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned || line.trim();
};

// Offline AI javoblari (backend ishlamagan holatda)
const getOfflineResponse = (message) => {
  const msg = message.toLowerCase();
  
  if (msg.includes('salom') || msg.includes('assalom')) {
    return 'Salom! Sizga qanday yordam bera olaman? Vazifalar, rejalar yoki dastur haqida so\'rang.';
  }
  if (msg.includes('vazifa') && (msg.includes('qo\'sh') || msg.includes('yaratish'))) {
    return 'Yangi vazifa qo\'shish uchun bosh sahifadagi "Yangi Vazifa Qo\'shish" bo\'limidan foydalaning. U yerda vazifa nomi, sanasi, vaqti, kategoriyasi va muhimlik darajasini belgilashingiz mumkin.';
  }
  if (msg.includes('vazifa')) {
    return 'Vazifalar bo\'limida siz barcha vazifalaringizni ko\'rishingiz, tahrirlashingiz va bajarilgan deb belgilashingiz mumkin. Filtrlar yordamida bugungi, shoshilinch yoki bajarilgan vazifalarni ajratib ko\'rishingiz mumkin.';
  }
  if (msg.includes('pomodoro') || msg.includes('taymer')) {
    return 'Pomodoro texnikasi 25 daqiqa ishlash va 5 daqiqa dam olishdan iborat. Pomodoro sahifasiga o\'ting va taymerni boshlang!';
  }
  if (msg.includes('statistika') || msg.includes('hisobot')) {
    return 'Statistika sahifasida haftalik va oylik bajarilgan vazifalaringiz grafiklar ko\'rinishida ko\'rsatiladi.';
  }
  if (msg.includes('eslatma') || msg.includes('bildirishnoma')) {
    return 'Eslatmalar uchun vazifa qo\'shayotganda "Eslatma qo\'shish" tugmasini yoqing va qancha vaqt oldin eslatilishini tanlang.';
  }
  if (msg.includes('maqsad') || msg.includes('goal')) {
    return 'Maqsadlar sahifasida uzoq muddatli maqsadlaringizni belgilashingiz va progress\'ni kuzatishingiz mumkin.';
  }
  if (msg.includes('sozlama') || msg.includes('settings')) {
    return 'Sozlamalar sahifasida mavzuni (light/dark), bildirishnomalarni va boshqa parametrlarni o\'zgartirishingiz mumkin.';
  }
  if (msg.includes('yordam') || msg.includes('help')) {
    return 'Men sizga quyidagilar haqida yordam bera olaman:\n• Vazifalarni boshqarish\n• Pomodoro texnikasi\n• Statistika va hisobotlar\n• Eslatmalar sozlash\n• Maqsadlarni belgilash\n\nNima haqida bilmoqchisiz?';
  }
  if (msg.includes('rahmat') || msg.includes('tashakkur')) {
    return 'Marhamat! Yana savollaringiz bo\'lsa, bemalol yozing. 😊';
  }
  
  return 'Tushundim. Sizga quyidagilar haqida yordam bera olaman: vazifalar, pomodoro, statistika, eslatmalar, maqsadlar yoki dastur sozlamalari. Qaysi biri haqida bilmoqchisiz?';
};

export default function AssistantAI() {
  const [messages, setMessages] = useState(DEFAULT_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [planForm, setPlanForm] = useState({
    date: getTodayString(),
    startTime: '09:00',
    endTime: '18:00',
    breakMinutes: 10,
    defaultDuration: 30,
    category: 'work',
    priority: 'medium',
    tasksText: ''
  });
  const [planResult, setPlanResult] = useState(null);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input };
    setMessages(msgs => [...msgs, userMsg]);
    const userInput = input;
    setInput('');
    setLoading(true);
    
    try {
      // Backend serverga ulanishga harakat qilish
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput })
      });
      const data = await res.json();
      if (data.answer) {
        setMessages(msgs => [...msgs, { from: 'ai', text: data.answer }]);
      } else {
        // Backend javob bermasa, offline rejimda ishlash
        const offlineAnswer = getOfflineResponse(userInput);
        setMessages(msgs => [...msgs, { from: 'ai', text: offlineAnswer }]);
      }
    } catch {
      // Server ishlamasa, offline rejimda ishlash
      const offlineAnswer = getOfflineResponse(userInput);
      setMessages(msgs => [...msgs, { from: 'ai', text: offlineAnswer }]);
    }
    setLoading(false);
  };

  const buildSchedulePlan = () => {
    const lines = planForm.tasksText
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);

    if (!lines.length) {
      setPlanResult({ scheduled: [], unscheduled: [], error: 'Vazifalar ro\'yxatini kiriting.' });
      return;
    }

    const tasks = lines.map((line) => {
      const durationMinutes = extractDurationMinutes(line, planForm.defaultDuration);
      return {
        title: cleanTaskTitle(line),
        durationMinutes
      };
    });

    const existingTasks = JSON.parse(localStorage.getItem('kun-tartibi-tasks') || '[]')
      .filter(t => t.date === planForm.date && !t.completed)
      .map(t => ({
        start: timeToMinutes(t.time),
        end: timeToMinutes(t.time) + (t.durationMinutes || t.duration || 30)
      }));

    let busySlots = normalizeSlots(existingTasks);
    const scheduled = [];
    const unscheduled = [];
    const startMin = timeToMinutes(planForm.startTime);
    const endMin = timeToMinutes(planForm.endTime);
    let pointer = startMin;

    tasks.forEach((task) => {
      const slotStart = findSlot(busySlots, pointer, endMin, task.durationMinutes);
      if (slotStart === null) {
        unscheduled.push(task);
        return;
      }

      const slotEnd = slotStart + task.durationMinutes;
      scheduled.push({
        ...task,
        date: planForm.date,
        time: minutesToTime(slotStart)
      });

      busySlots = normalizeSlots([...busySlots, { start: slotStart, end: slotEnd }]);
      pointer = slotEnd + Number(planForm.breakMinutes || 0);
    });

    setPlanResult({ scheduled, unscheduled, error: null });
  };

  const applyPlan = async () => {
    if (!planResult?.scheduled?.length) return;
    let createdCount = 0;

    for (const task of planResult.scheduled) {
      try {
        await tasksAPI.create({
          title: task.title,
          date: task.date,
          time: task.time,
          category: planForm.category,
          priority: planForm.priority,
          description: `AI rejalash: ${task.durationMinutes} daqiqa`,
          durationMinutes: task.durationMinutes
        });
        createdCount += 1;
      } catch (err) {
        console.error('Task create error:', err);
      }
    }

    if (createdCount > 0) {
      window.dispatchEvent(new CustomEvent('kuntartib-toast', {
        detail: { message: `AI rejalash: ${createdCount} ta vazifa qo'shildi`, type: 'success' }
      }));
      setMessages(msgs => [...msgs, { from: 'ai', text: `AI rejalash yakunlandi. ${createdCount} ta vazifa qo'shildi.` }]);
    }

    setPlanResult(null);
    setPlannerOpen(false);
    setPlanForm(prev => ({ ...prev, tasksText: '' }));
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
          <div className="assistant-toolbar">
            <button
              type="button"
              className={`assistant-tool-btn${plannerOpen ? ' active' : ''}`}
              onClick={() => setPlannerOpen(prev => !prev)}
            >
              AI rejalash
            </button>
          </div>
          {plannerOpen && (
            <div className="assistant-planner">
              <div className="planner-grid">
                <label>
                  Sana
                  <input
                    type="date"
                    value={planForm.date}
                    onChange={(e) => setPlanForm({ ...planForm, date: e.target.value })}
                  />
                </label>
                <label>
                  Boshlanish
                  <input
                    type="time"
                    value={planForm.startTime}
                    onChange={(e) => setPlanForm({ ...planForm, startTime: e.target.value })}
                  />
                </label>
                <label>
                  Tugash
                  <input
                    type="time"
                    value={planForm.endTime}
                    onChange={(e) => setPlanForm({ ...planForm, endTime: e.target.value })}
                  />
                </label>
                <label>
                  Tanaffus (daq.)
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={planForm.breakMinutes}
                    onChange={(e) => setPlanForm({ ...planForm, breakMinutes: e.target.value })}
                  />
                </label>
                <label>
                  Default davomiylik (daq.)
                  <input
                    type="number"
                    min="10"
                    max="180"
                    value={planForm.defaultDuration}
                    onChange={(e) => setPlanForm({ ...planForm, defaultDuration: e.target.value })}
                  />
                </label>
                <label>
                  Kategoriya
                  <select
                    value={planForm.category}
                    onChange={(e) => setPlanForm({ ...planForm, category: e.target.value })}
                  >
                    <option value="work">Ish</option>
                    <option value="study">O'qish</option>
                    <option value="home">Uy</option>
                    <option value="personal">Shaxsiy</option>
                    <option value="health">Sog'lom</option>
                  </select>
                </label>
                <label>
                  Prioritet
                  <select
                    value={planForm.priority}
                    onChange={(e) => setPlanForm({ ...planForm, priority: e.target.value })}
                  >
                    <option value="low">Past</option>
                    <option value="medium">O'rta</option>
                    <option value="high">Yuqori</option>
                  </select>
                </label>
              </div>

              <label className="planner-tasks">
                Vazifalar (har qatorda bitta)
                <textarea
                  placeholder="Masalan:\nHisobot yozish - 60m\nEmail tekshirish - 20m\nSport - 45m"
                  value={planForm.tasksText}
                  onChange={(e) => setPlanForm({ ...planForm, tasksText: e.target.value })}
                />
              </label>

              <div className="planner-actions">
                <button type="button" onClick={buildSchedulePlan}>Rejalash</button>
                <button type="button" className="secondary" onClick={() => { setPlanResult(null); setPlannerOpen(false); }}>Yopish</button>
              </div>

              {planResult && (
                <div className="planner-result">
                  {planResult.error && <div className="plan-error">{planResult.error}</div>}
                  {planResult.scheduled?.length > 0 && (
                    <>
                      <div className="plan-title">Tavsiflangan jadval</div>
                      {planResult.scheduled.map((t, idx) => (
                        <div key={`${t.title}-${idx}`} className="plan-item">
                          <span className="plan-time">{t.time}</span>
                          <span className="plan-title-text">{t.title}</span>
                          <span className="plan-duration">{t.durationMinutes}m</span>
                        </div>
                      ))}
                      <button type="button" className="apply-btn" onClick={applyPlan}>Tasdiqlash va qo'shish</button>
                    </>
                  )}
                  {planResult.unscheduled?.length > 0 && (
                    <div className="plan-warning">
                      {planResult.unscheduled.length} ta vazifa vaqtga sig'madi.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
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
