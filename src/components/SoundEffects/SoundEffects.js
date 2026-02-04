// Sound Effects Manager for KunTartib
// Provides audio feedback for user interactions

class SoundManager {
  constructor() {
    this.enabled = this.loadSettings();
    this.volume = this.loadVolume();
    this.audioContext = null;
    this.sounds = {};
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem('kuntartib-sounds-enabled');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  }

  loadVolume() {
    try {
      const saved = localStorage.getItem('kuntartib-sounds-volume');
      return saved !== null ? parseFloat(saved) : 0.3;
    } catch {
      return 0.3;
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    localStorage.setItem('kuntartib-sounds-enabled', JSON.stringify(enabled));
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('kuntartib-sounds-volume', this.volume.toString());
  }

  getAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.audioContext;
  }

  // Generate tones using Web Audio API
  playTone(frequency, duration, type = 'sine', attack = 0.01, decay = 0.1) {
    if (!this.enabled) return;

    try {
      const ctx = this.getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      const now = ctx.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(this.volume, now + attack);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration - decay);

      oscillator.start(now);
      oscillator.stop(now + duration);
    } catch (e) {
      console.warn('Sound playback failed:', e);
    }
  }

  // Play a sequence of notes
  playMelody(notes) {
    if (!this.enabled) return;

    let delay = 0;
    notes.forEach(note => {
      setTimeout(() => {
        this.playTone(note.freq, note.duration || 0.15, note.type || 'sine');
      }, delay);
      delay += (note.delay || 100);
    });
  }

  // ===== Predefined Sounds =====

  // Task completed - cheerful ascending notes
  taskComplete() {
    this.playMelody([
      { freq: 523.25, duration: 0.1 }, // C5
      { freq: 659.25, duration: 0.1, delay: 80 }, // E5
      { freq: 783.99, duration: 0.2, delay: 80 }, // G5
    ]);
  }

  // Task added - soft confirmation
  taskAdd() {
    this.playTone(880, 0.1, 'sine'); // A5
  }

  // Task deleted - descending tone
  taskDelete() {
    this.playMelody([
      { freq: 440, duration: 0.08 },
      { freq: 330, duration: 0.12, delay: 60 },
    ]);
  }

  // Button click - soft click
  click() {
    this.playTone(600, 0.05, 'sine');
  }

  // Success - happy melody
  success() {
    this.playMelody([
      { freq: 523.25, duration: 0.1 },
      { freq: 587.33, duration: 0.1, delay: 100 },
      { freq: 659.25, duration: 0.1, delay: 100 },
      { freq: 783.99, duration: 0.2, delay: 100 },
    ]);
  }

  // Error - low warning tone
  error() {
    this.playMelody([
      { freq: 200, duration: 0.15, type: 'square' },
      { freq: 180, duration: 0.2, delay: 120, type: 'square' },
    ]);
  }

  // Warning - attention tone
  warning() {
    this.playTone(440, 0.3, 'triangle');
  }

  // Notification - gentle chime
  notification() {
    this.playMelody([
      { freq: 880, duration: 0.15 },
      { freq: 1108.73, duration: 0.2, delay: 120 }, // C#6
    ]);
  }

  // Level up / Achievement - epic fanfare
  levelUp() {
    this.playMelody([
      { freq: 523.25, duration: 0.15 }, // C5
      { freq: 659.25, duration: 0.15, delay: 120 }, // E5
      { freq: 783.99, duration: 0.15, delay: 120 }, // G5
      { freq: 1046.50, duration: 0.3, delay: 120 }, // C6
    ]);
  }

  // Timer tick
  tick() {
    this.playTone(1000, 0.03, 'sine');
  }

  // Timer complete - alarm
  timerComplete() {
    this.playMelody([
      { freq: 880, duration: 0.2 },
      { freq: 880, duration: 0.2, delay: 250 },
      { freq: 880, duration: 0.2, delay: 250 },
      { freq: 1174.66, duration: 0.4, delay: 250 }, // D6
    ]);
  }

  // Hover sound - very subtle
  hover() {
    if (!this.enabled) return;
    this.playTone(1200, 0.02, 'sine');
  }

  // Toggle sound
  toggle() {
    this.playTone(this.enabled ? 700 : 500, 0.08, 'sine');
  }

  // Drag start
  dragStart() {
    this.playTone(400, 0.05, 'sine');
  }

  // Drop
  drop() {
    this.playTone(600, 0.08, 'sine');
  }

  // Streak milestone
  streak() {
    this.playMelody([
      { freq: 659.25, duration: 0.1 },
      { freq: 783.99, duration: 0.1, delay: 80 },
      { freq: 987.77, duration: 0.15, delay: 80 }, // B5
      { freq: 1174.66, duration: 0.25, delay: 80 }, // D6
    ]);
  }
}

// Create singleton instance
const soundManager = new SoundManager();

// React hook for using sounds
export const useSounds = () => {
  return {
    play: (soundName) => {
      if (soundManager[soundName]) {
        soundManager[soundName]();
      }
    },
    taskComplete: () => soundManager.taskComplete(),
    taskAdd: () => soundManager.taskAdd(),
    taskDelete: () => soundManager.taskDelete(),
    click: () => soundManager.click(),
    success: () => soundManager.success(),
    error: () => soundManager.error(),
    warning: () => soundManager.warning(),
    notification: () => soundManager.notification(),
    levelUp: () => soundManager.levelUp(),
    tick: () => soundManager.tick(),
    timerComplete: () => soundManager.timerComplete(),
    hover: () => soundManager.hover(),
    toggle: () => soundManager.toggle(),
    dragStart: () => soundManager.dragStart(),
    drop: () => soundManager.drop(),
    streak: () => soundManager.streak(),
    setEnabled: (enabled) => soundManager.setEnabled(enabled),
    setVolume: (volume) => soundManager.setVolume(volume),
    isEnabled: () => soundManager.enabled,
    getVolume: () => soundManager.volume,
  };
};

export default soundManager;
