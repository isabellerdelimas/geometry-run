const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const levelTitle = document.querySelector('#levelTitle');
const progressLabel = document.querySelector('#progressLabel');
const message = document.querySelector('#message');
const restartBtn = document.querySelector('#restartBtn');
const jumpBtn = document.querySelector('#jumpBtn');
const avatarList = document.querySelector('#avatarList');

const floorY = 350;
const playerX = 180;
const gravity = 0.78;
const jumpVelocity = -14.5;
const speed = 5.2;

const avatars = [
  { icon: '■', color: '#7c5cff', name: 'Square' },
  { icon: '◆', color: '#33d1ff', name: 'Diamond' },
  { icon: '●', color: '#58e39b', name: 'Orb' },
  { icon: '▲', color: '#ffd166', name: 'Triangle' },
  { icon: '⬟', color: '#ff7ab6', name: 'Hex' },
];

const levels = [
  {
    name: 'Level 1 · Learn the rhythm',
    length: 2350,
    platforms: [
      { x: 0, width: 520, y: floorY },
      { x: 620, width: 180, y: 305 },
      { x: 900, width: 190, y: 270 },
      { x: 1190, width: 180, y: 315 },
      { x: 1480, width: 220, y: 285 },
      { x: 1820, width: 530, y: floorY },
    ],
    spikes: [{ x: 1970, width: 80 }],
    pads: [],
  },
  {
    name: 'Level 2 · The helper button',
    length: 2600,
    platforms: [
      { x: 0, width: 450, y: floorY },
      { x: 560, width: 170, y: 300 },
      { x: 820, width: 170, y: 260 },
      { x: 1090, width: 180, y: 310 },
      { x: 1390, width: 170, y: 275 },
      { x: 1650, width: 170, y: 235 },
      { x: 1910, width: 170, y: 290 },
      { x: 2180, width: 420, y: floorY },
    ],
    spikes: [{ x: 2300, width: 90 }],
    pads: [{ x: 390 }, { x: 760 }, { x: 1330 }, { x: 1850 }],
  },
  {
    name: 'Level 3 · Spike garden',
    length: 2850,
    platforms: [
      { x: 0, width: 440, y: floorY },
      { x: 540, width: 180, y: 300 },
      { x: 830, width: 150, y: 260 },
      { x: 1090, width: 150, y: 300 },
      { x: 1350, width: 150, y: 250 },
      { x: 1610, width: 180, y: 305 },
      { x: 1910, width: 170, y: 270 },
      { x: 2190, width: 660, y: floorY },
    ],
    spikes: [
      { x: 2250, width: 70 },
      { x: 2400, width: 70 },
      { x: 2550, width: 70 },
    ],
    pads: [{ x: 485 }, { x: 1030 }, { x: 1550 }],
  },
  {
    name: 'Level 4 · Final run',
    length: 3200,
    platforms: [
      { x: 0, width: 400, y: floorY },
      { x: 500, width: 160, y: 305 },
      { x: 760, width: 140, y: 255 },
      { x: 1010, width: 140, y: 300 },
      { x: 1260, width: 140, y: 240 },
      { x: 1510, width: 170, y: 290 },
      { x: 1800, width: 140, y: 245 },
      { x: 2050, width: 160, y: 300 },
      { x: 2330, width: 870, y: floorY },
    ],
    spikes: [
      { x: 2390, width: 70 },
      { x: 2520, width: 70 },
      { x: 2650, width: 70 },
      { x: 2780, width: 70 },
      { x: 2910, width: 70 },
    ],
    pads: [{ x: 440 }, { x: 950 }, { x: 1450 }, { x: 1990 }],
  },
];

let state;
let holdingJump = false;
let selectedAvatar = 0;
let unlockedAvatars = 1;

function resetGame(levelIndex = state?.levelIndex ?? 0) {
  const level = levels[levelIndex];
  state = {
    levelIndex,
    level,
    cameraX: 0,
    player: { y: floorY - 38, vy: 0, size: 38, grounded: true },
    dead: false,
    won: false,
    lastPad: null,
  };
  levelTitle.textContent = level.name;
  message.classList.remove('show');
}

function currentWorldX() {
  return state.cameraX + playerX;
}

function tryJump() {
  if (state.dead || state.won) return;
  if (state.player.grounded) {
    state.player.vy = jumpVelocity;
    state.player.grounded = false;
  }
}

function getStandingPlatform() {
  const worldX = currentWorldX();
  return state.level.platforms.find((platform) =>
    worldX + state.player.size * 0.4 >= platform.x &&
    worldX - state.player.size * 0.4 <= platform.x + platform.width
  );
}

function update() {
  if (state.dead || state.won) return;

  state.cameraX += speed;
  const player = state.player;
  player.vy += gravity;
  player.y += player.vy;

  const platform = getStandingPlatform();
  if (platform && player.vy >= 0 && player.y + player.size >= platform.y && player.y + player.size <= platform.y + 28) {
    player.y = platform.y - player.size;
    player.vy = 0;
    if (!player.grounded && holdingJump) {
      player.grounded = true;
      tryJump();
    } else {
      player.grounded = true;
    }
  } else {
    player.grounded = false;
  }

  const worldX = currentWorldX();
  const pad = state.level.pads.find((item) => Math.abs(worldX - item.x) < 18);
  if (pad && state.lastPad !== pad && player.grounded) {
    state.lastPad = pad;
    player.vy = jumpVelocity;
    player.grounded = false;
  }

  const spikeHit = state.level.spikes.some((spike) =>
    worldX + player.size * 0.3 > spike.x &&
    worldX - player.size * 0.3 < spike.x + spike.width &&
    player.y + player.size > floorY - 26
  );

  if (spikeHit || player.y > canvas.height + 80) {
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

  drawGrid();

  state.level.platforms.forEach(drawPlatform);
  state.level.spikes.forEach(drawSpikes);
  state.level.pads.forEach(drawPad);
  drawFinishLine();
  drawPlayer();
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

function nextAction() {
  if (state.dead) {
    resetGame(state.levelIndex);
    return;
  }
  if (state.won) {
    if (state.levelIndex < levels.length - 1) resetGame(state.levelIndex + 1);
    else resetGame(0);
    return;
  }
  tryJump();
}

window.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    event.preventDefault();
    holdingJump = true;
    nextAction();
  }
});

window.addEventListener('keyup', (event) => {
  if (event.code === 'Space') holdingJump = false;
});

jumpBtn.addEventListener('pointerdown', () => {
  holdingJump = true;
  nextAction();
});
jumpBtn.addEventListener('pointerup', () => holdingJump = false);
jumpBtn.addEventListener('pointerleave', () => holdingJump = false);
restartBtn.addEventListener('click', () => resetGame(state.levelIndex));

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

resetGame(0);
renderAvatars();
loop();
