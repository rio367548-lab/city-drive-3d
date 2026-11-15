
import * as THREE from 'three';
import './style.css';

// ==========================================
// 1. PERSIAPAN SCENE
// ==========================================

const container = document.getElementById('game-container');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x91b8ce);
scene.fog = new THREE.Fog(0x91b8ce, 100, 230);

const camera = new THREE.PerspectiveCamera(
  60,
  container.clientWidth / container.clientHeight,
  0.1,
  500
);

const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

container.appendChild(renderer.domElement);

// ==========================================
// 2. PENCAHAYAAN
// ==========================================

const ambientLight = new THREE.HemisphereLight(
  0xffffff,
  0x40513b,
  2.1
);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 3);
sunLight.position.set(-35, 65, -25);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(2048, 2048);
sunLight.shadow.camera.left = -85;
sunLight.shadow.camera.right = 85;
sunLight.shadow.camera.top = 85;
sunLight.shadow.camera.bottom = -85;
scene.add(sunLight);

// ==========================================
// 3. LINGKUNGAN DAN RUMPUT
// ==========================================

const grass = new THREE.Mesh(
  new THREE.PlaneGeometry(220, 180),
  new THREE.MeshStandardMaterial({
    color: 0x477d45,
    roughness: 1
  })
);

grass.rotation.x = -Math.PI / 2;
grass.position.y = -0.12;
grass.receiveShadow = true;
scene.add(grass);

// ==========================================
// 4. MEMBUAT LINTASAN OVAL
// ==========================================

const trackShape = new THREE.Shape();

trackShape.absellipse(
  0, 0, 52, 34, 0, Math.PI * 2, false, 0
);

const trackHole = new THREE.Path();

trackHole.absellipse(
  0, 0, 38, 20, 0, Math.PI * 2, true, 0
);

trackShape.holes.push(trackHole);

const trackGeometry = new THREE.ShapeGeometry(
  trackShape,
  96
);

const trackMaterial = new THREE.MeshStandardMaterial({
  color: 0x343b43,
  roughness: 0.95,
  side: THREE.DoubleSide
});

const track = new THREE.Mesh(trackGeometry, trackMaterial);
track.rotation.x = -Math.PI / 2;
track.position.y = 0.02;
track.receiveShadow = true;
scene.add(track);

// ==========================================
// 5. MEMBUAT GARIS MARKA OVAL
// ==========================================

function createOvalLine(rx, rz, color, y, dashed = false) {
  const points = [];

  const segments = dashed ? 180 : 240;

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;

    points.push(
      new THREE.Vector3(
        Math.cos(angle) * rx,
        y,
        Math.sin(angle) * rz
      )
    );
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: dashed ? 0.75 : 0.9
  });

  const line = new THREE.Line(geometry, material);
  scene.add(line);
  return line;
}

createOvalLine(52, 34, 0xffffff, 0.10);
createOvalLine(38, 20, 0xffffff, 0.10);
createOvalLine(45, 27, 0xf4f0d5, 0.11, true);

// ==========================================
// 6. KERB / PEMBATAS MERAH PUTIH
// ==========================================

function createKerb(rx, rz) {
  const count = 100;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;

    const block = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.18, 0.75),
      new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0xe83e42 : 0xffffff
      })
    );

    const x = Math.cos(angle) * rx;
    const z = Math.sin(angle) * rz;

    block.position.set(x, 0.12, z);
    block.rotation.y = -Math.atan2(
      Math.cos(angle) * rz,
      -Math.sin(angle) * rx
    );

    block.castShadow = true;
    scene.add(block);
  }
}

createKerb(52.5, 34.5);
createKerb(37.5, 19.5);

// ==========================================
// 7. PEMBATAS LUAR SIRKUIT
// ==========================================

function createBarrier(rx, rz) {
  const count = 100;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;

    const barrier = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 0.9, 0.8),
      new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0xeeeeee : 0xe34840
      })
    );

    barrier.position.set(
      Math.cos(angle) * rx,
      0.45,
      Math.sin(angle) * rz
    );

    barrier.rotation.y = -Math.atan2(
      Math.cos(angle) * rz,
      -Math.sin(angle) * rx
    );

    barrier.castShadow = true;
    scene.add(barrier);
  }
}

createBarrier(57, 38);

// ==========================================
// 8. AREA TENGAH SIRKUIT
// ==========================================

const centerIsland = new THREE.Mesh(
  new THREE.CylinderGeometry(17, 17, 0.3, 64),
  new THREE.MeshStandardMaterial({
    color: 0x568c48
  })
);

centerIsland.position.y = 0.02;
centerIsland.receiveShadow = true;
scene.add(centerIsland);

// Pohon sederhana
function createTree(x, z, scale = 1) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.45, 3, 8),
    new THREE.MeshStandardMaterial({ color: 0x70472b })
  );

  trunk.position.set(x, 1.5 * scale, z);
  trunk.scale.setScalar(scale);
  scene.add(trunk);

  const leaves = new THREE.Mesh(
    new THREE.ConeGeometry(2.2, 5, 8),
    new THREE.MeshStandardMaterial({ color: 0x24623b })
  );

  leaves.position.set(x, 4 * scale, z);
  leaves.scale.setScalar(scale);
  leaves.castShadow = true;
  scene.add(leaves);
}

for (let i = 0; i < 14; i++) {
  const angle = (i / 14) * Math.PI * 2;
  createTree(
    Math.cos(angle) * 13,
    Math.sin(angle) * 13,
    0.8 + Math.random() * 0.4
  );
}

// ==========================================
// 9. MEMBUAT GEDUNG DI SEKITAR ARENA
// ==========================================

function createBuilding(x, z, width, height, depth) {
  const building = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshStandardMaterial({
      color: 0x778b9b,
      roughness: 0.8
    })
  );

  building.position.set(x, height / 2, z);
  building.castShadow = true;
  building.receiveShadow = true;
  scene.add(building);

  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.5, 0.5, depth + 0.5),
    new THREE.MeshStandardMaterial({ color: 0x37475b })
  );

  roof.position.set(x, height + 0.2, z);
  scene.add(roof);
}

createBuilding(-75, -55, 12, 18, 12);
createBuilding(-57, -65, 10, 25, 10);
createBuilding(70, -55, 14, 22, 12);
createBuilding(75, 60, 15, 28, 15);
createBuilding(-70, 60, 12, 20, 12);

// ==========================================
// 10. GARIS START / FINISH
// ==========================================


const startLine = new THREE.Group();

// Membuat garis finish hitam-putih
const tileCount = 20;

for (let i = 0; i < tileCount; i++) {
  const tile = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.04, 0.8),
    new THREE.MeshStandardMaterial({
      color: i % 2 === 0 ? 0xffffff : 0x151515,
      roughness: 0.8
    })
  );

  tile.position.set(-11.4 + i * 1.2, 0.05, 0);
  tile.receiveShadow = true;

  startLine.add(tile);
}

// Posisi dan arah garis finish
startLine.position.set(0, 0, -27);
startLine.rotation.y = Math.PI / 2;

scene.add(startLine);

// ==========================================
// 11. MEMBUAT MOBIL SPORT 3D
// ==========================================

const car = new THREE.Group();
scene.add(car);

const redPaint = new THREE.MeshStandardMaterial({
  color: 0xd92f32,
  metalness: 0.45,
  roughness: 0.3
});

const darkMaterial = new THREE.MeshStandardMaterial({
  color: 0x101820,
  metalness: 0.4,
  roughness: 0.3
});

const glassMaterial = new THREE.MeshStandardMaterial({
  color: 0x142b40,
  metalness: 0.5,
  roughness: 0.15
});

const rubberMaterial = new THREE.MeshStandardMaterial({
  color: 0x101010,
  roughness: 0.9
});

function addCarPart(geometry, material, x, y, z) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  car.add(mesh);
  return mesh;
}

// Body utama
addCarPart(
  new THREE.BoxGeometry(4.5, 0.65, 2.1),
  redPaint,
  0, 0.9, 0
);

// Kap mesin
addCarPart(
  new THREE.BoxGeometry(1.5, 0.28, 1.95),
  redPaint,
  1.35, 1.3, 0
);

// Bagian kabin
addCarPart(
  new THREE.BoxGeometry(2.15, 0.8, 1.65),
  glassMaterial,
  -0.45, 1.55, 0
);

// Atap
addCarPart(
  new THREE.BoxGeometry(1.55, 0.16, 1.7),
  redPaint,
  -0.45, 2, 0
);

// Spoiler belakang
addCarPart(
  new THREE.BoxGeometry(0.25, 0.5, 0.12),
  darkMaterial,
  -1.85, 1.45, -0.7
);

addCarPart(
  new THREE.BoxGeometry(0.25, 0.5, 0.12),
  darkMaterial,
  -1.85, 1.45, 0.7
);

addCarPart(
  new THREE.BoxGeometry(0.45, 0.12, 2),
  redPaint,
  -1.9, 1.72, 0
);

// Lampu depan dan belakang
for (const z of [-0.7, 0.7]) {
  addCarPart(
    new THREE.BoxGeometry(0.12, 0.2, 0.4),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 1.5
    }),
    2.28, 1.02, z
  );

  addCarPart(
    new THREE.BoxGeometry(0.12, 0.2, 0.4),
    new THREE.MeshStandardMaterial({
      color: 0xff1717,
      emissive: 0xff0000,
      emissiveIntensity: 1
    }),
    -2.28, 1.02, z
  );
}

// Roda
const wheels = [];

for (const x of [-1.45, 1.45]) {
  for (const z of [-1.1, 1.1]) {
    const wheel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.48, 0.48, 0.32, 24),
      rubberMaterial
    );

    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(x, 0.65, z);
    wheel.castShadow = true;
    car.add(wheel);
    wheels.push(wheel);

    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.34, 16),
      new THREE.MeshStandardMaterial({
        color: 0xb9c1c9,
        metalness: 0.85,
        roughness: 0.2
      })
    );

    hub.rotation.x = Math.PI / 2;
    hub.position.copy(wheel.position);
    car.add(hub);
  }
}

// Posisi awal mobil
const startPosition = new THREE.Vector3(-8, 0, -27);
car.position.copy(startPosition);
car.rotation.y = 0;

// ==========================================
// 12. KAMERA THIRD PERSON
// ==========================================

const cameraOffset = new THREE.Vector3(-11, 7, 0);

camera.position.set(
  startPosition.x - 11,
  9,
  startPosition.z
);

camera.lookAt(car.position);

 // ==========================================
 // 13. SISTEM KONTROL MOBIL
 // ==========================================

const keys = {
  gas: false,
  brake: false,
  left: false,
  right: false
};

let speed = 0;
let heading = 0;
let started = false;
let elapsed = 0;
let raceTime = 0;

// SISTEM LAP BALAPAN
let currentLap = 0;
const totalLaps = 3;
let hasCrossedStart = false;
let nextCheckpoint = 0;

const maxSpeed = 65;


// ==========================================
// SISTEM AUDIO GAME
// ==========================================

let audioContext = null;
let engineOscillator = null;
let engineGain = null;
let engineFilter = null;

// Menyiapkan audio mesin
function setupAudio() {
  if (audioContext) return;

  audioContext = new (window.AudioContext || window.webkitAudioContext)();

  engineOscillator = audioContext.createOscillator();
  engineGain = audioContext.createGain();
  engineFilter = audioContext.createBiquadFilter();

  engineOscillator.type = 'sawtooth';
  engineOscillator.frequency.value = 55;

  engineFilter.type = 'lowpass';
  engineFilter.frequency.value = 180;

  engineGain.gain.value = 0.0001;

  engineOscillator.connect(engineFilter);
  engineFilter.connect(engineGain);
  engineGain.connect(audioContext.destination);

  engineOscillator.start();
}

// Menghidupkan suara mesin
async function startEngineSound() {
  setupAudio();

  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }

  engineGain.gain.setTargetAtTime(
    0.035,
    audioContext.currentTime,
    0.2
  );
}

// Mengatur suara mesin sesuai kecepatan
function updateEngineSound() {
  if (!audioContext || !engineOscillator) return;

  const currentSpeed = Math.abs(speed);

  engineOscillator.frequency.setTargetAtTime(
    55 + currentSpeed * 2.5,
    audioContext.currentTime,
    0.08
  );

  engineFilter.frequency.setTargetAtTime(
    180 + currentSpeed * 8,
    audioContext.currentTime,
    0.1
  );
}

// Mematikan suara mesin
function stopEngineSound() {
  if (!audioContext || !engineGain) return;

  engineGain.gain.setTargetAtTime(
    0.0001,
    audioContext.currentTime,
    0.15
  );
}

// Suara kemenangan
async function playFinishSound() {
  setupAudio();

  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }

  const notes = [523.25, 659.25, 783.99, 1046.5];

  notes.forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    const startTime = audioContext.currentTime + index * 0.18;

    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(0.12, startTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.35);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + 0.36);
  });
}

// RESET MOBIL
function resetCar() {
  car.position.copy(startPosition);

  heading = 0;
  car.rotation.y = heading;

  speed = 0;
  elapsed = 0;
  raceTime = 0;
  started = false;

  currentLap = 0;
  hasCrossedStart = false;
  nextCheckpoint = 0;

  // Lepaskan semua tombol kontrol
  keys.gas = false;
  keys.brake = false;
  keys.left = false;
  keys.right = false;

  // Reset kamera
  camera.position.copy(car.position).add(cameraOffset);
  camera.lookAt(car.position);

  // Reset tampilan
  document.getElementById('start-overlay').style.display = 'grid';
  document.getElementById('result-overlay').style.display = 'none';
  document.getElementById('game-message').textContent = '';
  document.getElementById('timer').textContent = '00:00.0';
  document.getElementById('lap').textContent = '00 / 03';

  document.getElementById('speed').textContent = '0';
  document.getElementById('speed-fill').style.width = '0%';
}


// SISTEM PENGHITUNG LAP

function checkLap(previousX, previousZ) {
  // Deteksi garis start / finish
  const crossedFinish =
    previousX < 0 &&
    car.position.x >= 0 &&
    car.position.z > -32 &&
    car.position.z < -22 &&
    Math.cos(heading) > 0;

  // Persilangan pertama untuk memulai balapan
  if (!hasCrossedStart && crossedFinish) {
    hasCrossedStart = true;
    currentLap = 0;
    nextCheckpoint = 0;

    document.getElementById('lap').textContent = '01 / 03';
    document.getElementById('game-message').textContent =
      'LAP 1 STARTED!';

    return;
  }

  if (!hasCrossedStart) return;

  // CHECKPOINT 1: Sisi kanan sirkuit
  const checkpointRight =
    previousZ < 0 &&
    car.position.z >= 0 &&
    car.position.x > 30;

  // CHECKPOINT 2: Sisi bawah sirkuit
  const checkpointBottom =
    previousX > 0 &&
    car.position.x <= 0 &&
    car.position.z > 20;

  // CHECKPOINT 3: Sisi kiri sirkuit
  const checkpointLeft =
    previousZ > 0 &&
    car.position.z <= 0 &&
    car.position.x < -30;

  if (nextCheckpoint === 0 && checkpointRight) {
    nextCheckpoint = 1;
    document.getElementById('game-message').textContent =
      'CHECKPOINT 1/3!';
  }

  else if (nextCheckpoint === 1 && checkpointBottom) {
    nextCheckpoint = 2;
    document.getElementById('game-message').textContent =
      'CHECKPOINT 2/3!';
  }

  else if (nextCheckpoint === 2 && checkpointLeft) {
    nextCheckpoint = 3;
    document.getElementById('game-message').textContent =
      'CHECKPOINT 3/3!';
  }

  // Hitung lap setelah semua checkpoint dilewati
  if (crossedFinish && nextCheckpoint === 3) {
    currentLap++;
    nextCheckpoint = 0;

    if (currentLap >= totalLaps) {
  started = false;
  speed = 0;

  document.getElementById('lap').textContent = '03 / 03';

  document.getElementById('speed').textContent = '0';
  document.getElementById('speed-fill').style.width = '0%';

  // Tampilkan total waktu balapan
  const minutes = Math.floor(elapsed / 60);
  const seconds = Math.floor(elapsed % 60);
  const decimal = Math.floor((elapsed % 1) * 10);

  const finalTime =
    `${String(minutes).padStart(2, '0')}:` +
    `${String(seconds).padStart(2, '0')}.` +
    decimal;

  document.getElementById('final-time').textContent = finalTime;

  // Tampilkan layar hasil
  document.getElementById('result-overlay').style.display = 'grid';
  stopEngineSound();
  playFinishSound();

  return;
}

    document.getElementById('lap').textContent =
      `${String(currentLap + 1).padStart(2, '0')} / 03`;

    document.getElementById('game-message').textContent =
      `LAP ${currentLap + 1}! KEEP RACING!`;
  }
}


// PERGERAKAN MOBIL
function updateCar(delta) {
  if (!started) return;

  // Akselerasi
  if (keys.gas) {
    speed += 27 * delta;
  } else if (keys.brake) {
    speed -= 45 * delta;
  } else {
    if (speed > 0) {
      speed = Math.max(0, speed - 12 * delta);
    } else if (speed < 0) {
      speed = Math.min(0, speed + 12 * delta);
    }
  }

  speed = THREE.MathUtils.clamp(speed, -10, maxSpeed);

  
// KEMUDI MOBIL
const steering =
  (keys.left ? 1 : 0) -
  (keys.right ? 1 : 0);

const speedFactor = THREE.MathUtils.clamp(
  Math.abs(speed) / maxSpeed,
  0,
  1
);

// Kemudi lebih responsif
const steeringPower = 0.35 + (speedFactor * 0.9);

if (Math.abs(speed) > 1) {
  heading +=
    steering *
    steeringPower *
    delta *
    Math.sign(speed);
}


  // Simpan posisi sebelum bergerak
  const previousX = car.position.x;
  const previousZ = car.position.z;

  // Gerakkan mobil
  car.position.x += Math.cos(heading) * speed * delta / 3.6;
  car.position.z -= Math.sin(heading) * speed * delta / 3.6;

  car.rotation.y = heading;

  // Periksa garis finish
  checkLap(previousX, previousZ);

  // Animasi roda
  wheels.forEach(wheel => {
    wheel.rotation.y += speed * delta * 0.15;
  });

  // Kamera mengikuti mobil
  const offset = cameraOffset.clone();

  offset.applyAxisAngle(
    new THREE.Vector3(0, 1, 0),
    heading
  );

  const targetCamera = car.position.clone().add(offset);

  camera.position.lerp(
    targetCamera,
    1 - Math.pow(0.001, delta)
  );

  camera.lookAt(
    car.position.x,
    car.position.y + 1,
    car.position.z
  );

  // Tampilan kecepatan
  document.getElementById('speed').textContent =
    Math.round(Math.abs(speed));

  document.getElementById('speed-fill').style.width =
    `${Math.abs(speed) / maxSpeed * 100}%`;

  // Perbarui suara mesin sesuai kecepatan
  updateEngineSound();
}

// ==========================================
// 14. INPUT KEYBOARD
// ==========================================

const keyMap = {
  w: 'gas',
  arrowup: 'gas',
  s: 'brake',
  arrowdown: 'brake',
  a: 'left',
  arrowleft: 'left',
  d: 'right',
  arrowright: 'right'
};

window.addEventListener('keydown', event => {
  const key = event.key.toLowerCase();

  if (keyMap[key]) {
    event.preventDefault();
    keys[keyMap[key]] = true;
  }

  if (key === 'r') resetCar();
});

window.addEventListener('keyup', event => {
  const key = event.key.toLowerCase();

  if (keyMap[key]) {
    keys[keyMap[key]] = false;
  }
});

// ==========================================
// 15. TOMBOL KONTROL LAYAR SENTUH
// ==========================================

document.querySelectorAll('[data-control]').forEach(button => {
  const control = button.dataset.control;

  button.addEventListener('pointerdown', event => {
    event.preventDefault();
    keys[control] = true;
    button.setPointerCapture(event.pointerId);
  });

  const release = () => {
    keys[control] = false;
  };

  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
  button.addEventListener('lostpointercapture', release);
});

// ==========================================
// 16. START DAN RESET
// ==========================================

document.getElementById('start-btn').addEventListener('click', async () => {
  started = true;

  await startEngineSound();

  document.getElementById('start-overlay').style.display = 'none';
  document.getElementById('game-message').textContent =
    'GOOD LUCK! ENJOY THE RACE';
});

document.getElementById('reset-btn').addEventListener('click', resetCar);

// ==========================================
// TOMBOL RACE RESULTS
// ==========================================

// Ulangi balapan
document.getElementById('race-again-btn').addEventListener('click', async () => {
  document.getElementById('result-overlay').style.display = 'none';
  resetCar();
  await startEngineSound();
  started = true;

  document.getElementById('start-overlay').style.display = 'none';
  document.getElementById('game-message').textContent =
    'GOOD LUCK! ENJOY THE RACE';
});

// Kembali ke menu awal
document.getElementById('back-menu-btn').addEventListener('click', () => {
  document.getElementById('result-overlay').style.display = 'none';
  resetCar();
});

// ==========================================
// 17. TIMER
// ==========================================

function updateTimer(delta) {
  if (!started) return;

  elapsed += delta;
  raceTime = elapsed;

  const minutes = Math.floor(raceTime / 60);
  const seconds = Math.floor(raceTime % 60);
  const decimal = Math.floor((raceTime % 1) * 10);

  document.getElementById('timer').textContent =
    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${decimal}`;
}

// ==========================================
// 18. RESPONSIVE CANVAS
// ==========================================

window.addEventListener('resize', () => {
  const width = container.clientWidth;
  const height = container.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// ==========================================
// 19. ANIMATION LOOP
// ==========================================

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);

  updateCar(delta);
  updateTimer(delta);

  renderer.render(scene, camera);
}

animate();

console.log('CITY DRIVE 3D berhasil dijalankan!');
