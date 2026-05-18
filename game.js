const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const levelTitle = document.querySelector('#levelTitle');
const progressLabel = document.querySelector('#progressLabel');
const message = document.querySelector('#message');
const restartBtn = document.querySelector('#restartBtn');
const jumpButtons = document.querySelectorAll('.jump-btn');
const musicList = document.querySelector('#musicList');
const avatarList = document.querySelector('#avatarList');

const floorY = 350;
const playerX = 180;
const gravity = 0.78;
const jumpVelocity = -11.8;
const padJumpVelocity = -17.2;
const jumpHoldBoost = 0.54;
const maxJumpHoldMs = 220;
const jumpReleaseCut = 0.7;
const startingSpeed = 6.35;
const maxSpeed = 9.1;
const countdownSeconds = 3;
const buttonJumpVelocities = {
  short: -10.4,
  medium: -13.6,
  high: -16.2,
};

const avatars = [
  { icon: '■', color: '#7c5cff', name: 'Square' },
  { icon: '◆', color: '#33d1ff', name: 'Diamond' },
  { icon: '●', color: '#58e39b', name: 'Orb' },
  { icon: '▲', color: '#ffd166', name: 'Triangle' },
  { icon: '⬟', color: '#ff7ab6', name: 'Hex' },
];

const musicTracks = [
  {
    name: 'Neon Run',
    interval: 220,
    notes: [261.63, 329.63, 392.0, 523.25, 392.0, 329.63, 440.0, 493.88],
    leadTypes: ['sawtooth', 'triangle', 'triangle', 'triangle'],
    bassType: 'square',
  },
  {
    name: 'Cloud Hop',
    interval: 280,
    notes: [293.66, 349.23, 440.0, 523.25, 440.0, 392.0, 349.23, 329.63],
    leadTypes: ['sine', 'triangle', 'sine', 'triangle'],
    bassType: 'sine',
  },
  {
    name: 'Laser Sprint',
    interval: 170,
    notes: [329.63, 392.0, 493.88, 659.25, 587.33, 493.88, 440.0, 392.0],
    leadTypes: ['square', 'sawtooth', 'square', 'triangle'],
    bassType: 'sawtooth',
  },
];

const levels = [
  {
    name: 'Level 1 · Learn the rhythm',
    length: 3400,
    platforms: [
      { x: 0, width: 520, y: floorY },
      { x: 620, width: 180, y: 305 },
      { x: 900, width: 190, y: 270 },
      { x: 1190, width: 180, y: 315 },
      { x: 1480, width: 220, y: 285 },
      { x: 1820, width: 180, y: 245 },
      { x: 2110, width: 170, y: 300 },
      { x: 2390, width: 160, y: 255 },
      { x: 2660, width: 180, y: 305 },
      { x: 2950, width: 450, y: floorY },
    ],
    spikes: [
      { x: 3050, width: 70 },
      { x: 3230, width: 70 },
    ],
    pads: [],
  },
  {
    name: 'Level 2 · The helper button',
    length: 3850,
    platforms: [
      { x: 0, width: 450, y: floorY },
      { x: 560, width: 170, y: 300 },
      { x: 820, width: 170, y: 260 },
      { x: 1090, width: 180, y: 310 },
      { x: 1390, width: 170, y: 275 },
      { x: 1650, width: 170, y: 235 },
      { x: 1910, width: 170, y: 290 },
      { x: 2180, width: 170, y: 250 },
      { x: 2450, width: 150, y: 305 },
      { x: 2710, width: 150, y: 245 },
      { x: 2970, width: 170, y: 295 },
      { x: 3250, width: 600, y: floorY },
    ],
    spikes: [
      { x: 3350, width: 70 },
      { x: 3530, width: 90 },
      { x: 3740, width: 70 },
    ],
    pads: [{ x: 390 }, { x: 760 }, { x: 1330 }, { x: 1850 }, { x: 2390 }, { x: 2910 }],
  },
  {
    name: 'Level 3 · Spike garden',
    length: 4300,
    platforms: [
      { x: 0, width: 440, y: floorY },
      { x: 540, width: 180, y: 300 },
      { x: 830, width: 150, y: 260 },
      { x: 1090, width: 150, y: 300 },
      { x: 1350, width: 150, y: 250 },
      { x: 1610, width: 180, y: 305 },
      { x: 1910, width: 170, y: 270 },
      { x: 2190, width: 150, y: 245 },
      { x: 2460, width: 150, y: 300 },
      { x: 2720, width: 150, y: 235 },
      { x: 2990, width: 170, y: 300 },
      { x: 3270, width: 170, y: 255 },
      { x: 3560, width: 740, y: floorY },
    ],
    spikes: [
      { x: 3650, width: 70 },
      { x: 3830, width: 70 },
      { x: 4010, width: 70 },
      { x: 4190, width: 70 },
    ],
    pads: [{ x: 485 }, { x: 1030 }, { x: 1550 }, { x: 2140 }, { x: 2670 }, { x: 3500 }],
  },
  {
    name: 'Level 4 · Final run',
    length: 4850,
    platforms: [
      { x: 0, width: 400, y: floorY },
      { x: 500, width: 160, y: 305 },
      { x: 760, width: 140, y: 255 },
      { x: 1010, width: 140, y: 300 },
      { x: 1260, width: 140, y: 240 },
      { x: 1510, width: 170, y: 290 },
      { x: 1800, width: 140, y: 245 },
      { x: 2050, width: 160, y: 300 },
      { x: 2330, width: 140, y: 235 },
      { x: 2580, width: 140, y: 295 },
      { x: 2830, width: 140, y: 230 },
      { x: 3090, width: 150, y: 285 },
      { x: 3360, width: 150, y: 235 },
      { x: 3640, width: 160, y: 300 },
      { x: 3940, width: 910, y: floorY },
    ],
    spikes: [
      { x: 4030, width: 70 },
      { x: 4200, width: 70 },
      { x: 4370, width: 70 },
      { x: 4540, width: 70 },
    ],
    pads: [{ x: 440 }, { x: 950 }, { x: 1450 }, { x: 1990 }, { x: 2520 }, { x: 3300 }, { x: 3870 }],
  },
];

let state;
let holdingJump = false;
let selectedAvatar = 0;
let unlockedAvatars = 1;
let audioContext;
let musicTimer;
let beat = 0;
let selectedTrack = 0;

function resetGame(levelIndex = state?.levelIndex ?? 0) {
  const level = levels[levelIndex];
  state = {
    levelIndex,
    level,
    cameraX: 0,
    player: { y: floorY - 38, vy: 0, size: 38, grounded: true, jumpStartedAt: null },
    dead: false,
    won: false,
    ready: false,
    countdown: countdownSeconds,
    countdownStartedAt: performance.now(),
    lastPad: null,
  };
  levelTitle.textContent = level.name;
  showMessage(String(countdownSeconds));
}

function currentWorldX() {
  return state.cameraX + playerX;
}

function currentSpeed() {
  const progress = Math.min(1, currentWorldX() / state.level.length);
  return startingSpeed + (maxSpeed - startingSpeed) * progress;
}

function tryJump(velocity = jumpVelocity) {
  startMusic();
  if (state.dead || state.won || !state.ready) return;
  if (state.player.grounded) {
    state.player.vy = velocity;
    state.player.grounded = false;
    state.player.jumpStartedAt = performance.now();
  }
}

function performButtonJump(type) {
  holdingJump = false;
  nextAction(buttonJumpVelocities[type]);
}

function stopHoldingJump() {
  holdingJump = false;
  if (!state?.player.grounded && state?.player.vy < -4) {
    state.player.vy *= jumpReleaseCut;
  }
}

function update() {
  if (state.dead || state.won) return;

  if (!state.ready) {
    const elapsed = (performance.now() - state.countdownStartedAt) / 1000;
    const remaining = Math.max(0, Math.ceil(countdownSeconds - elapsed));
    if (remaining !== state.countdown) {
      state.countdown = remaining;
      if (remaining > 0) showMessage(String(remaining));
      else showMessage('GO!');
    }
    if (elapsed < countdownSeconds + 0.45) return;
    state.ready = true;
    message.classList.remove('show');
  }

  state.cameraX += currentSpeed();
  const player = state.player;
  const previousY = player.y;
  const previousBottom = previousY + player.size;
  const jumpHoldTime = player.jumpStartedAt ? performance.now() - player.jumpStartedAt : Infinity;
  if (holdingJump && !player.grounded && player.vy < 0 && jumpHoldTime < maxJumpHoldMs) {
    player.vy -= jumpHoldBoost;
  }
  player.vy += gravity;
  player.y += player.vy;

  const worldX = currentWorldX();
  const playerLeft = worldX - player.size * 0.5;
  const playerRight = worldX + player.size * 0.5;
  const playerBottom = player.y + player.size;
  const platform = state.level.platforms.find((item) =>
    playerRight > item.x &&
    playerLeft < item.x + item.width &&
    player.vy >= 0 &&
    previousBottom <= item.y &&
    playerBottom >= item.y
  );

  if (platform) {
    player.y = platform.y - player.size;
    player.vy = 0;
    player.jumpStartedAt = null;
    if (!player.grounded && holdingJump) {
      player.grounded = true;
      tryJump();
    } else {
      player.grounded = true;
    }
  } else {
    player.grounded = false;
  }

  const pad = state.level.pads.find((item) => Math.abs(worldX - item.x) < 18);
  if (pad && state.lastPad !== pad && player.grounded) {
    state.lastPad = pad;
    player.vy = padJumpVelocity;
    player.grounded = false;
    player.jumpStartedAt = performance.now();
  }

  const playerTop = player.y;
  const columnHit = state.level.platforms.some((item) =>
    playerRight > item.x &&
    playerLeft < item.x + item.width &&
    playerBottom > item.y &&
    playerTop < canvas.height &&
    item !== platform
  );

  const spikeHit = state.level.spikes.some((spike) =>
    worldX + player.size * 0.3 > spike.x &&
    worldX - player.size * 0.3 < spike.x + spike.width &&
    player.y + player.size > floorY - 26
  );

  if (columnHit || spikeHit || player.y > canvas.height + 80) {
    state.dead = true;
    showMessage('Ouch — restart and catch the rhythm again.');
  }

  if (worldX >= state.level.length) {
    state.won = true;
    unlockedAvatars = Math.min(avatars.length, Math.max(unlockedAvatars, state.levelIndex + 2));
    renderAvatars();
    if (state.levelIndex === levels.length - 1) {
      showMessage('You cleared every level! Pick any jumper you like.');
    } else {
      showMessage('Level clear! New avatar unlocked. Press Space for the next level.');
    }
  }

  const progress = Math.min(100, Math.floor((worldX / state.level.length) * 100));
  progressLabel.textContent = `${progress}%`;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#171d39');
  gradient.addColorStop(1, '#0b1020');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawPulseBackdrop();
  drawGrid();

  state.level.platforms.forEach(drawPlatform);
  state.level.spikes.forEach(drawSpikes);
  state.level.pads.forEach(drawPad);
  drawFinishLine();
  drawPlayer();
}

function drawPulseBackdrop() {
  const pulse = 0.5 + Math.sin(beat * 0.6) * 0.5;
  ctx.fillStyle = `rgba(124, 92, 255, ${0.08 + pulse * 0.08})`;
  for (let i = 0; i < 6; i++) {
    const x = ((i * 220) - (state.cameraX * 0.35 % 220)) + 40;
    const size = 42 + ((i + beat) % 3) * 10;
    ctx.beginPath();
    ctx.moveTo(x, 90);
    ctx.lineTo(x + size, 130);
    ctx.lineTo(x, 170);
    ctx.lineTo(x - size, 130);
    ctx.closePath();
    ctx.fill();
  }
}

function drawGrid() {
  ctx.strokeStyle = 'rgba(255,255,255,.05)';
  ctx.lineWidth = 1;
  for (let x = -(state.cameraX % 40); x < canvas.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 20; y < canvas.height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawPlatform(platform) {
  const x = platform.x - state.cameraX;
  ctx.fillStyle = '#283056';
  ctx.fillRect(x, platform.y, platform.width, canvas.height - platform.y);
  ctx.fillStyle = '#7c5cff';
  ctx.fillRect(x, platform.y, platform.width, 8);
}

function drawSpikes(spike) {
  const x = spike.x - state.cameraX;
  ctx.fillStyle = '#ff5b7a';
  for (let i = 0; i < spike.width; i += 24) {
    ctx.beginPath();
    ctx.moveTo(x + i, floorY);
    ctx.lineTo(x + i + 12, floorY - 28);
    ctx.lineTo(x + i + 24, floorY);
    ctx.closePath();
    ctx.fill();
  }
}

function drawPad(pad) {
  const x = pad.x - state.cameraX;
  ctx.fillStyle = '#33d1ff';
  ctx.fillRect(x - 18, floorY - 12, 36, 12);
  ctx.fillStyle = '#dff8ff';
  ctx.fillRect(x - 10, floorY - 20, 20, 8);
}

function drawFinishLine() {
  const x = state.level.length - state.cameraX;
  ctx.fillStyle = '#58e39b';
  ctx.fillRect(x, 180, 8, floorY - 180);
  ctx.fillStyle = '#f7f7fb';
  ctx.fillRect(x + 8, 180, 28, 22);
}

function drawPlayer() {
  const avatar = avatars[selectedAvatar];
  const { y, size } = state.player;
  ctx.fillStyle = avatar.color;
  ctx.save();
  ctx.translate(playerX + size / 2, y + size / 2);
  if (avatar.icon === '◆') ctx.rotate(Math.PI / 4);
  if (avatar.icon === '●') {
    ctx.beginPath();
    ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (avatar.icon === '▲') {
    ctx.beginPath();
    ctx.moveTo(0, -size / 2);
    ctx.lineTo(size / 2, size / 2);
    ctx.lineTo(-size / 2, size / 2);
    ctx.closePath();
    ctx.fill();
  } else if (avatar.icon === '⬟') {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI / 3 * i - Math.PI / 6;
      const px = Math.cos(angle) * size / 2;
      const py = Math.sin(angle) * size / 2;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.fillRect(-size / 2, -size / 2, size, size);
  }
  ctx.restore();
}

function startMusic() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  if (musicTimer) return;
  beginTrack();
}

function beginTrack() {
  if (!audioContext) return;
  if (musicTimer) window.clearInterval(musicTimer);
  const track = musicTracks[selectedTrack];
  let step = 0;
  musicTimer = window.setInterval(() => {
    if (!audioContext) return;
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = track.leadTypes[step % track.leadTypes.length];
    osc.frequency.value = track.notes[step % track.notes.length];
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.055, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    osc.connect(gain).connect(audioContext.destination);
    osc.start(now);
    osc.stop(now + 0.2);
    if (step % 2 === 0) {
      const bass = audioContext.createOscillator();
      const bassGain = audioContext.createGain();
      bass.type = track.bassType;
      bass.frequency.value = track.notes[step % track.notes.length] / 2;
      bassGain.gain.setValueAtTime(0.0001, now);
      bassGain.gain.exponentialRampToValueAtTime(0.028, now + 0.01);
      bassGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
      bass.connect(bassGain).connect(audioContext.destination);
      bass.start(now);
      bass.stop(now + 0.18);
    }
    step += 1;
    beat += 1;
  }, track.interval);
}

function showMessage(text) {
  message.textContent = text;
  message.classList.add('show');
}

function renderAvatars() {
  avatarList.innerHTML = '';
  avatars.forEach((avatar, index) => {
    const button = document.createElement('button');
    button.className = `avatar ${index === selectedAvatar ? 'selected' : ''} ${index >= unlockedAvatars ? 'locked' : ''}`;
    button.textContent = avatar.icon;
    button.title = index < unlockedAvatars ? avatar.name : 'Locked';
    button.disabled = index >= unlockedAvatars;
    button.addEventListener('click', () => {
      selectedAvatar = index;
      renderAvatars();
    });
    avatarList.appendChild(button);
  });
}

function renderMusicTracks() {
  musicList.innerHTML = '';
  musicTracks.forEach((track, index) => {
    const button = document.createElement('button');
    button.className = `music-btn ${index === selectedTrack ? 'selected' : ''}`;
    button.textContent = track.name;
    button.type = 'button';
    button.addEventListener('click', () => {
      selectedTrack = index;
      renderMusicTracks();
      if (audioContext) beginTrack();
      else startMusic();
    });
    musicList.appendChild(button);
  });
}

function nextAction(velocity = jumpVelocity) {
  if (state.dead) {
    resetGame(state.levelIndex);
    return;
  }
  if (state.won) {
    if (state.levelIndex < levels.length - 1) resetGame(state.levelIndex + 1);
    else resetGame(0);
    return;
  }
  tryJump(velocity);
}

window.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    event.preventDefault();
    holdingJump = true;
    nextAction();
  }
});

window.addEventListener('keyup', (event) => {
  if (event.code === 'Space') stopHoldingJump();
});

jumpButtons.forEach((button) => {
  button.addEventListener('click', () => performButtonJump(button.dataset.jump));
});
restartBtn.addEventListener('click', () => resetGame(state.levelIndex));

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

resetGame(0);
renderAvatars();
renderMusicTracks();
loop();
