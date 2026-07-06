// --- Curated Focus & Execution Quotes Array (31 Days of Momentum) ---
const motivationalQuotes = [
  "Focus precedes execution. Minimize the noise.",
  "Amateurs wait for inspiration. Professionals just get to work.",
  "You do not rise to the level of your goals. You fall to the level of your systems.",
  "Deep work is not a luxury; it is a necessity for exceptional results.",
  "Great things are done by a series of small things brought together.",
  "The secret of your future is hidden in your daily routine.",
  "Energy flows where attention goes. Lock it in.",
  "Discipline is choosing between what you want now and what you want most.",
  "Do not mistake motion for progress. A rocking horse moves but never gets anywhere.",
  "The best way to predict your future is to execute it in the present.",
  "You don't need more time. You need more focus.",
  "Work deeply. Your best contribution to the world requires absolute presence.",
  "If you commit to nothing, you will be distracted by everything.",
  "The velocity of your execution determines the scale of your achievements.",
  "It is not that we have a short time to live, but that we waste a lot of it.",
  "Be regular and orderly in your life so that you may be violent and original in your work.",
  "Small daily improvements over time lead to stunning results.",
  "Your mind is for having ideas, not holding them. Put systems in place.",
  "Focus is a muscle. The more you shield your attention, the stronger it becomes.",
  "Simplicity is the ultimate sophistication. Eliminate the non-essential.",
  "The successful warrior is the average person, with laser-like focus.",
  "Quality is not an act, it is a habit.",
  "Action cures fear. Execution builds confidence.",
  "Consistency beats intensity every single time.",
  "You can do anything, but you cannot do everything.",
  "He who is everywhere is nowhere. One block at a time.",
  "Great execution is the ultimate competitive advantage.",
  "Build the ritual, and the ritual will build you.",
  "Don't look at the whole mountain. Just watch your feet for the next step.",
  "The friction of starting is always greater than the friction of continuing.",
  "Mastery requires patience, systems require discipline, execution requires focus."
];

// --- Application State Management ---
let state = {
  manifestation: localStorage.getItem('focus_manifestation') || '',
  streak: parseInt(localStorage.getItem('focus_streak')) || 0,
  lastStreakUpdate: localStorage.getItem('focus_last_streak_date') || '', // YYYY-MM-DD
  habits: JSON.parse(localStorage.getItem('focus_habits')) || [
    { id: 1, text: "Drink 3L Water", completed: false },
    { id: 2, text: "Code for 2 Hours", completed: false },
    { id: 3, text: "Read 10 Pages", completed: false }
  ],
  // Volume state cache memory fallback registry
  volumes: JSON.parse(localStorage.getItem('focus_mixer_volumes')) || {
    rain: 0,
    cafe: 0,
    noise: 0
  }
};

// --- Pomodoro Timer Engine Variables ---
let timerInterval = null;
let timeLeft = 25 * 60; 
let isTimerRunning = false;

// --- DOM Element Registries ---
const themeBtn = document.getElementById('themeBtn');
const htmlEl = document.documentElement;
const streakCounterEl = document.getElementById('streakCounter');

const manifestationInput = document.getElementById('manifestationInput');
const saveManifestationBtn = document.getElementById('saveManifestationBtn');

const timerMinutesEl = document.getElementById('timerMinutes');
const timerSecondsEl = document.getElementById('timerSeconds');
const startPauseBtn = document.getElementById('startPauseBtn');
const resetTimerBtn = document.getElementById('resetTimerBtn');

const audioElements = {
  rain: document.getElementById('audioRain'),
  cafe: document.getElementById('audioCafe'),
  noise: document.getElementById('audioNoise')
};

const volumeSliders = {
  rain: document.getElementById('volumeRain'),
  cafe: document.getElementById('volumeCafe'),
  noise: document.getElementById('volumeNoise')
};

const habitInput = document.getElementById('habitInput');
const addHabitBtn = document.getElementById('addHabitBtn');
const habitListContainer = document.getElementById('habitList');
const ritualProgressText = document.getElementById('ritualProgressText');
const progressBar = document.getElementById('progressBar');


// --- 1. CORE MANIFESTATION & INITIALIZATION ---
function initApp() {
  manifestationInput.value = state.manifestation;
  streakCounterEl.textContent = state.streak;
  
  verifyStreakValidity();
  renderHabitsPipeline();
  setupAudioMixerListeners();
  rotateQuote(); 
  loadSavedMixerSettings();
}

saveManifestationBtn.addEventListener('click', () => {
  state.manifestation = manifestationInput.value.trim();
  localStorage.setItem('focus_manifestation', state.manifestation);
  
  saveManifestationBtn.textContent = 'Committed!';
  setTimeout(() => saveManifestationBtn.textContent = 'Commit', 1200);
});


// --- 2. DEEP WORK POMODORO CLOCK & AUDIO MIXER ---
function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerMinutesEl.textContent = String(minutes).padStart(2, '0');
  timerSecondsEl.textContent = String(seconds).padStart(2, '0');
}

function toggleTimer() {
  if (isTimerRunning) {
    clearInterval(timerInterval);
    startPauseBtn.textContent = 'Start Focus';
    startPauseBtn.style.backgroundColor = 'var(--accent-blue)';
    isTimerRunning = false;
  } else {
    isTimerRunning = true;
    startPauseBtn.textContent = 'Pause Arena';
    startPauseBtn.style.backgroundColor = '#ff4a4a';
    
    timerInterval = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();
      
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        handleTimerCompletion();
      }
    }, 1000);
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  isTimerRunning = false;
  timeLeft = 25 * 60;
  startPauseBtn.textContent = 'Start Focus';
  startPauseBtn.style.backgroundColor = 'var(--accent-blue)';
  updateTimerDisplay();
}

function handleTimerCompletion() {
  isTimerRunning = false;
  timeLeft = 25 * 60;
  startPauseBtn.textContent = 'Start Focus';
  startPauseBtn.style.backgroundColor = 'var(--accent-blue)';
  updateTimerDisplay();
  rotateQuote();
  
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); 
  gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
  oscillator.start();
  gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 1.5);
  oscillator.stop(audioCtx.currentTime + 1.5);
  
  alert("Deep work session finalized. Step away and reset your eyes.");
}

function setupAudioMixerListeners() {
  Object.keys(volumeSliders).forEach(key => {
    volumeSliders[key].addEventListener('input', (e) => {
      const volumeValue = parseFloat(e.target.value);
      const audio = audioElements[key];
      
      audio.volume = volumeValue;
      state.volumes[key] = volumeValue;
      localStorage.setItem('focus_mixer_volumes', JSON.stringify(state.volumes));
      
      // UPGRADE: Clean error handling catching autoplay blocks gracefully
      if (volumeValue > 0 && audio.paused) {
        audio.play().catch(() => {
          console.log(`Audio channel "${key}" requires user interface interaction before play initialization.`);
        });
      } else if (volumeValue === 0 && !audio.paused) {
        audio.pause();
      }
    });
  });
}

// UPGRADE: Hydrate and fire up previous audio balances automatically on layout paint
function loadSavedMixerSettings() {
  Object.keys(state.volumes).forEach(key => {
    const savedVol = state.volumes[key];
    if (volumeSliders[key] && audioElements[key]) {
      volumeSliders[key].value = savedVol;
      audioElements[key].volume = savedVol;
      
      if (savedVol > 0) {
        audioElements[key].play().catch(() => {
          console.log(`Saved ambient loop "${key}" auto-play deferred until user clicks layout canvas.`);
        });
      }
    }
  });
}

function rotateQuote() {
  const quoteElement = document.getElementById('affirmationText');
  if (!quoteElement) return;
  
  const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
  
  quoteElement.style.opacity = '0';
  setTimeout(() => {
    quoteElement.textContent = `"${motivationalQuotes[randomIndex]}"`;
    quoteElement.style.opacity = '1';
    quoteElement.style.transition = 'opacity 0.4s ease';
  }, 400);
}

startPauseBtn.addEventListener('click', toggleTimer);
resetTimerBtn.addEventListener('click', resetTimer);


// --- 3. DAILY RITUALS ENGINE & STREAK MATH ---
function renderHabitsPipeline() {
  habitListContainer.innerHTML = '';
  
  if (state.habits.length === 0) {
    habitListContainer.innerHTML = `<div class="empty-state" style="padding:20px; color:var(--text-muted); text-align:center;">No rituals tracked today.</div>`;
  } else {
    state.habits.forEach(habit => {
      const row = document.createElement('div');
      row.className = `habit-item ${habit.completed ? 'completed' : ''}`;
      row.setAttribute('tabindex', '0');
      row.setAttribute('role', 'checkbox');
      row.setAttribute('aria-checked', habit.completed ? 'true' : 'false');
      
      row.innerHTML = `
        <div class="habit-circle" data-action="toggle">
          <svg class="habit-check-img" width="9" height="7" viewBox="0 0 9 7" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 3.5L3.5 6L8 1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="habit-text" data-action="toggle">${escapeHTML(habit.text)}</span>
        <button class="habit-delete-btn" onclick="deleteHabitItem(${habit.id})" aria-label="Remove ritual">✕</button>
      `;
      
      row.addEventListener('click', (e) => {
        if (e.target.closest('[data-action="toggle"]') || e.target === row || e.target.className === 'habit-text') {
          toggleHabitStatus(habit.id);
        }
      });

      row.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          toggleHabitStatus(habit.id);
        }
      });
      
      habitListContainer.appendChild(row);
    });
  }
  
  calculateMetricsProgress();
  syncHabitsToDisk();
}

function addHabitItem() {
  const textValue = habitInput.value.trim();
  if (!textValue) return;

  state.habits.push({
    id: Date.now(),
    text: textValue,
    completed: false
  });
  
  habitInput.value = '';
  renderHabitsPipeline();
}

function toggleHabitStatus(id) {
  state.habits = state.habits.map(h => h.id === id ? { ...h, completed: !h.completed } : h);
  renderHabitsPipeline();
  checkAndProcessStreakIncrement();
}

function deleteHabitItem(id) {
  state.habits = state.habits.filter(h => h.id !== id);
  renderHabitsPipeline();
  checkAndProcessStreakIncrement();
}

function calculateMetricsProgress() {
  if (state.habits.length === 0) {
    ritualProgressText.textContent = '0% Completed';
    progressBar.style.width = '0%';
    return;
  }
  
  const total = state.habits.length;
  const completedCount = state.habits.filter(h => h.completed).length;
  const percentage = Math.round((completedCount / total) * 100);
  
  ritualProgressText.textContent = `${percentage}% Completed`;
  progressBar.style.width = `${percentage}%`;
}

function syncHabitsToDisk() {
  localStorage.setItem('focus_habits', JSON.stringify(state.habits));
}

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getYesterdayString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function verifyStreakValidity() {
  const today = getTodayString();
  const yesterday = getYesterdayString();
  
  if (state.lastStreakUpdate !== today && state.lastStreakUpdate !== yesterday && state.streak > 0) {
    state.streak = 0;
    localStorage.setItem('focus_streak', 0);
    streakCounterEl.textContent = 0;
  }
}

function checkAndProcessStreakIncrement() {
  const today = getTodayString();
  
  if (state.habits.length === 0 || state.habits.some(h => !h.completed)) return;
  
  if (state.lastStreakUpdate !== today) {
    state.streak += 1;
    state.lastStreakUpdate = today;
    
    localStorage.setItem('focus_streak', state.streak);
    localStorage.setItem('focus_last_streak_date', today);
    streakCounterEl.textContent = state.streak;
    
    streakCounterEl.parentElement.style.transform = 'scale(1.15)';
    setTimeout(() => streakCounterEl.parentElement.style.transform = 'none', 300);
  }
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

habitInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addHabitItem();
});
addHabitBtn.addEventListener('click', addHabitItem);

themeBtn.addEventListener('click', () => {
  const currentTheme = htmlEl.getAttribute('data-theme');
  htmlEl.setAttribute('data-theme', currentTheme === 'dark' ? 'light' : 'dark');
});

initApp();

// --- PROGRESSIVE WEB APP ENGINE REGISTRATION ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((registration) => {
        console.log('Focus Arena PWA initialized successfully with scope:', registration.scope);
      })
      .catch((error) => {
        console.error('Focus Arena PWA registration sequence aborted:', error);
      });
  });
}