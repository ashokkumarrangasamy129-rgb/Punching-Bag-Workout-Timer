// UI Elements
const prepTimeInput = document.getElementById('prepTimeInput');
const prepTimeSlider = document.getElementById('prepTime');
const workTimeInput = document.getElementById('workTimeInput');
const workTimeSlider = document.getElementById('workTime');
const restTimeInput = document.getElementById('restTimeInput');
const restTimeSlider = document.getElementById('restTime');
const roundsInput = document.getElementById('roundsInput');
const roundsSlider = document.getElementById('rounds');
const difficultySelect = document.getElementById('difficulty');

const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const resetBtn = document.getElementById('resetBtn');

const timerValue = document.getElementById('timerValue');
const timerLabel = document.getElementById('timerLabel');
const phaseText = document.getElementById('phaseText');
const roundText = document.getElementById('roundText');
const statusPill = document.getElementById('statusPill');
const comboDisplay = document.getElementById('comboDisplay');
const motivationText = document.getElementById('motivationText');

const roundTimeValue = document.getElementById('roundTimeValue');
const elapsedValue = document.getElementById('elapsedValue');
const remainingValue = document.getElementById('remainingValue');
const progressFill = document.getElementById('progressFill');
const progressInfo = document.getElementById('progressInfo');

const totalDurationEl = document.getElementById('totalDuration');
const summaryRoundsEl = document.getElementById('summaryRounds');
const perRoundEl = document.getElementById('perRound');

// Punch combinations database
const punchCombos = {
  beginner: [
    ['Jab', 'Jab'],
    ['Cross', 'Cross'],
    ['Hook', 'Hook'],
    ['Jab', 'Cross'],
    ['Jab', 'Hook'],
    ['Cross', 'Hook'],
    ['Jab', 'Jab', 'Cross'],
    ['Cross', 'Cross', 'Hook'],
  ],
  intermediate: [
    ['Jab', 'Cross', 'Right Hook'],
    ['Jab', 'Left Hook', 'Right Uppercut'],
    ['Right Hook', 'Left Uppercut', 'Slip'],
    ['Jab', 'Cross', 'Left Hook', 'Duck'],
    ['Jab', 'Right Uppercut', 'Cross'],
    ['Right Hook', 'Cross', 'Left Hook', 'Slip'],
    ['Jab', 'Jab', 'Cross', 'Right Uppercut'],
    ['Cross', 'Right Hook', 'Duck'],
    ['Jab', 'Left Uppercut', 'Cross', 'Slip'],
    ['Left Hook', 'Right Uppercut', 'Cross', 'Duck'],
  ],
  advanced: [
    ['Jab', 'Cross', 'Right Hook', 'Left Uppercut', 'Duck'],
    ['Double Jab', 'Cross', 'Left Hook', 'Right Uppercut', 'Slip'],
    ['Jab', 'Right Hook', 'Duck', 'Left Hook'],
    ['Cross', 'Right Uppercut', 'Slip', 'Left Hook'],
    ['Jab', 'Cross', 'Right Hook', 'Left Hook', 'Duck'],
    ['Left Hook', 'Cross', 'Right Uppercut', 'Duck'],
    ['Jab', 'Double Jab', 'Cross', 'Right Hook', 'Left Uppercut'],
    ['Cross', 'Right Hook', 'Slip', 'Left Hook'],
    ['Jab', 'Left Uppercut', 'Cross', 'Right Uppercut', 'Duck'],
    ['Right Hook', 'Left Hook', 'Slip', 'Cross'],
  ],
};

const motivationMessages = {
  ready: 'Set your workout and hit start!',
  prep: 'Get ready! Shake it out and focus!',
  workout: 'GO GO GO! Give it your all!',
  rest: 'Catch your breath. You\'re doing great!',
  complete: 'Amazing work! You crushed it! 💪',
};

// Workout State
let state = {
  status: 'stopped', // stopped, running, paused
  phase: 'ready', // ready, prep, workout, rest, complete
  currentRound: 0,
  totalRounds: 5,
  timeRemaining: 0,
  totalElapsed: 0,
  prepTime: 10,
  workTime: 60,
  restTime: 20,
  difficulty: 'intermediate',
};

let timerInterval = null;
let audioContext = null;

// Sync Input Sliders and Number Inputs
function setupInputSync() {
  prepTimeSlider.addEventListener('input', (e) => {
    prepTimeInput.value = e.target.value;
    updateSummary();
  });
  prepTimeInput.addEventListener('change', (e) => {
    prepTimeSlider.value = e.target.value;
    updateSummary();
  });

  workTimeSlider.addEventListener('input', (e) => {
    workTimeInput.value = e.target.value;
    updateSummary();
  });
  workTimeInput.addEventListener('change', (e) => {
    workTimeSlider.value = e.target.value;
    updateSummary();
  });

  restTimeSlider.addEventListener('input', (e) => {
    restTimeInput.value = e.target.value;
    updateSummary();
  });
  restTimeInput.addEventListener('change', (e) => {
    restTimeSlider.value = e.target.value;
    updateSummary();
  });

  roundsSlider.addEventListener('input', (e) => {
    roundsInput.value = e.target.value;
    updateSummary();
  });
  roundsInput.addEventListener('change', (e) => {
    roundsSlider.value = e.target.value;
    updateSummary();
  });
}

// Update Summary
function updateSummary() {
  const prep = parseInt(prepTimeInput.value) || 0;
  const work = parseInt(workTimeInput.value) || 0;
  const rest = parseInt(restTimeInput.value) || 0;
  const rounds = parseInt(roundsInput.value) || 1;

  const totalWorkTime = work * rounds;
  const totalRestTime = rest * Math.max(0, rounds - 1);
  const totalTime = prep + totalWorkTime + totalRestTime;

  totalDurationEl.textContent = formatTime(totalTime);
  summaryRoundsEl.textContent = rounds;
  perRoundEl.textContent = `${work + rest}s`;
}

// Format Time
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Get Random Combo
function getRandomCombo() {
  const difficulty = difficultySelect.value;
  const combos = punchCombos[difficulty];
  return combos[Math.floor(Math.random() * combos.length)];
}

// Punch number mapping (boxing notation)
const punchNumbers = {
  'Jab': '1',
  'Cross': '2',
  'Hook': '3',
  'Uppercut': '4',
  'Right Hook': 'RH',
  'Left Hook': 'LH',
  'Right Uppercut': 'RU',
  'Left Uppercut': 'LU',
  'Body Shot': 'B',
  'Slip': 'S',
  'Duck': 'D',
  'Double Jab': '1-1',
};

// Display Combo
function displayCombo() {
  if (state.phase === 'workout') {
    const combo = getRandomCombo();
    comboDisplay.innerHTML = combo.map((punch) => {
      const num = punchNumbers[punch] || '?';
      return `<div class="combo-item">${num} - ${punch}</div>`;
    }).join('');
  } else {
    comboDisplay.innerHTML = '<div class="combo-item">Ready</div>';
  }
}

// Play Audio Cue
function playBeep(frequency = 800, duration = 200) {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.frequency.value = frequency;
    osc.type = 'sine';

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration / 1000);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start(now);
    osc.stop(now + duration / 1000);
  } catch (e) {
    console.log('Audio not available');
  }
}

// Text to Speech
function speak(text) {
  if (!('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 1.1;
  window.speechSynthesis.speak(utterance);
}

// Announce Phase
function announcePhase(phase) {
  const messages = {
    prep: 'Get ready',
    workout: 'Go! Punch it!',
    rest: 'Rest time',
    complete: 'Workout complete',
  };

  if (messages[phase]) {
    playBeep(800, 300);
    setTimeout(() => speak(messages[phase]), 100);
  }
}

// Update UI Display
function updateDisplay() {
  timerValue.textContent = formatTime(Math.max(0, state.timeRemaining));

  const prep = parseInt(prepTimeInput.value) || 0;
  const work = parseInt(workTimeInput.value) || 0;
  const rest = parseInt(restTimeInput.value) || 0;
  const rounds = parseInt(roundsInput.value) || 1;

  const totalTime = prep + rounds * work + Math.max(0, rounds - 1) * rest;

  let label = '';
  switch (state.phase) {
    case 'ready':
      label = 'Get Ready';
      break;
    case 'prep':
      label = 'Preparation Time';
      break;
    case 'workout':
      label = `Round ${state.currentRound} - PUNCH IT!`;
      break;
    case 'rest':
      label = `Rest - Round ${state.currentRound} Complete`;
      break;
    case 'complete':
      label = 'Workout Complete!';
      break;
  }
  timerLabel.textContent = label;

  phaseText.textContent = state.phase.toUpperCase();
  roundText.textContent = `${state.currentRound}/${rounds}`;
  statusPill.textContent = state.status.toUpperCase();

  roundTimeValue.textContent = formatTime(state.timeRemaining);
  elapsedValue.textContent = formatTime(state.totalElapsed);
  remainingValue.textContent = formatTime(Math.max(0, totalTime - state.totalElapsed));

  // Progress bar
  const progress = totalTime > 0 ? (state.totalElapsed / totalTime) * 100 : 0;
  progressFill.style.width = Math.min(100, progress) + '%';
  progressInfo.textContent = Math.round(progress) + '%';

  // Motivation
  motivationText.textContent = motivationMessages[state.phase] || 'Keep going!';

  // Update Button States
  startBtn.disabled = state.status === 'running';
  pauseBtn.disabled = state.status !== 'running';
  resumeBtn.disabled = state.status !== 'paused';
  resetBtn.disabled = state.status === 'stopped' && state.phase === 'ready';
}

// Start Workout
function startWorkout() {
  state.prepTime = parseInt(prepTimeInput.value) || 0;
  state.workTime = parseInt(workTimeInput.value) || 0;
  state.restTime = parseInt(restTimeInput.value) || 0;
  state.totalRounds = parseInt(roundsInput.value) || 1;
  state.difficulty = difficultySelect.value;

  if (state.status === 'stopped') {
    state.status = 'running';
    state.phase = 'prep';
    state.currentRound = 1;
    state.totalElapsed = 0;
    state.timeRemaining = state.prepTime;

    disableInputs(true);
    announcePhase('prep');
  }

  runTimer();
}

// Pause Workout
function pauseWorkout() {
  state.status = 'paused';
  if (timerInterval) clearInterval(timerInterval);
  updateDisplay();
}

// Resume Workout
function resumeWorkout() {
  state.status = 'running';
  runTimer();
}

// Reset Workout
function resetWorkout() {
  state.status = 'stopped';
  state.phase = 'ready';
  state.currentRound = 0;
  state.totalElapsed = 0;
  state.timeRemaining = 0;

  if (timerInterval) clearInterval(timerInterval);
  disableInputs(false);
  comboDisplay.innerHTML = '<div class="combo-item">Ready</div>';
  updateDisplay();
}

// Disable/Enable Inputs
function disableInputs(disabled) {
  prepTimeInput.disabled = disabled;
  prepTimeSlider.disabled = disabled;
  workTimeInput.disabled = disabled;
  workTimeSlider.disabled = disabled;
  restTimeInput.disabled = disabled;
  restTimeSlider.disabled = disabled;
  roundsInput.disabled = disabled;
  roundsSlider.disabled = disabled;
  difficultySelect.disabled = disabled;
}

// Run Timer
function runTimer() {
  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    if (state.status !== 'running') return;

    state.timeRemaining--;
    state.totalElapsed++;

    // Check if phase needs to change
    if (state.timeRemaining <= 0) {
      transitionPhase();
    }

    updateDisplay();

    // Play warning beeps
    if (state.timeRemaining === 3 || state.timeRemaining === 2 || state.timeRemaining === 1) {
      playBeep(600, 100);
    }

    // Play final beep
    if (state.timeRemaining === 0) {
      playBeep(1000, 300);
    }
  }, 1000);

  updateDisplay();
}

// Transition Between Phases
function transitionPhase() {
  const rounds = state.totalRounds;

  if (state.phase === 'prep') {
    state.phase = 'workout';
    state.timeRemaining = state.workTime;
    displayCombo();
    announcePhase('workout');
  } else if (state.phase === 'workout') {
    if (state.currentRound < rounds) {
      state.phase = 'rest';
      state.timeRemaining = state.restTime;
      announcePhase('rest');
      comboDisplay.innerHTML = '<div class="combo-item">Recovery Time</div>';
    } else {
      state.phase = 'complete';
      state.status = 'stopped';
      clearInterval(timerInterval);
      disableInputs(false);
      announcePhase('complete');
      playBeep(1200, 500);
      setTimeout(() => playBeep(1000, 500), 600);
    }
  } else if (state.phase === 'rest') {
    state.currentRound++;
    state.phase = 'workout';
    state.timeRemaining = state.workTime;
    displayCombo();
    announcePhase('workout');
  }
}

// Button Event Listeners
startBtn.addEventListener('click', startWorkout);
pauseBtn.addEventListener('click', pauseWorkout);
resumeBtn.addEventListener('click', resumeWorkout);
resetBtn.addEventListener('click', resetWorkout);

// Change combo when difficulty changes (only if not running)
difficultySelect.addEventListener('change', () => {
  if (state.phase === 'workout' && state.status === 'running') {
    displayCombo();
  }
});

// Change combo every 5 seconds during workout
setInterval(() => {
  if (state.phase === 'workout' && state.status === 'running') {
    displayCombo();
  }
}, 5000);

// Initialize
setupInputSync();
updateSummary();
updateDisplay();
