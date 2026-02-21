// Tag 1on1 3D Game using Three.js
// Red: WASD, Blue: Arrow keys, both move freely, obstacles in arena

let scene, camera, renderer, controls;
let red, blue, obstacles = [], arenaSize = 400;
let keys = {};
let gameOver = false;
let statusEl = document.getElementById('tag3dStatus');

function initTag3DGame() {
  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x3cb371); // green background
  camera = new THREE.PerspectiveCamera(75, 600/400, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(600, 400);
  document.getElementById('tag3dContainer').innerHTML = '';
  document.getElementById('tag3dContainer').appendChild(renderer.domElement);

  // Arena floor
  const floorGeo = new THREE.PlaneGeometry(arenaSize, arenaSize);
  const floorMat = new THREE.MeshPhongMaterial({ color: 0x228B22 }); // green floor
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  scene.add(floor);

  // Lighting
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 300, 200);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x888888));

  // Players
  red = makePlayer(0xff3333, -100, 20, -100);
  blue = makePlayer(0x3399ff, 100, 20, 100);
  scene.add(red.mesh);
  scene.add(blue.mesh);

  // Obstacles (platforms)
  obstacles = [];
  // Add some elevated platforms
  const platforms = [
    { x: 0, y: 60, z: 0, w: 100, d: 100 },
    { x: -120, y: 100, z: 80, w: 60, d: 60 },
    { x: 120, y: 140, z: -80, w: 60, d: 60 },
    { x: 0, y: 180, z: 120, w: 80, d: 40 },
    { x: 80, y: 80, z: 80, w: 40, d: 80 }
  ];
  for (const p of platforms) {
    const geo = new THREE.BoxGeometry(p.w, 10, p.d);
    const mat = new THREE.MeshPhongMaterial({ color: 0x8d5524 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(p.x, p.y, p.z);
    scene.add(mesh);
    obstacles.push(mesh);
  }

  // Camera
  camera.position.set(0, 350, 350);
  camera.lookAt(0, 0, 0);

  gameOver = false;
  statusEl.textContent = 'Red: WASD | Blue: Arrows | W/Up = Jump';
}

function makePlayer(color, x, y, z) {
  const geometry = new THREE.SphereGeometry(18, 32, 32);
  const material = new THREE.MeshPhongMaterial({ color });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  return { mesh, color, x, y, z, vx: 0, vz: 0, vy: 0, onGround: true };
}

function makeObstacle() {
  const geo = new THREE.BoxGeometry(40, 40, 40);
  const mat = new THREE.MeshPhongMaterial({ color: 0x888800 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(
    Math.random() * (arenaSize - 120) - (arenaSize - 120)/2,
    20,
    Math.random() * (arenaSize - 120) - (arenaSize - 120)/2
  );
  return mesh;
}

function resetTag3DGame() {
  initTag3DGame();
}

function animateTag3D() {
  requestAnimationFrame(animateTag3D);
  if (!gameOver) updateTag3DGame();
  renderer.render(scene, camera);
}

  // Red controls (WASD + jump)
  red.vx = red.vz = 0;
  if (keys['a'] || keys['A']) red.vx = -4;
  if (keys['d'] || keys['D']) red.vx = 4;
  if (keys['s'] || keys['S']) red.vz = 4;
  if (keys['w'] || keys['W']) {
    if (red.onGround) {
      red.vy = 8; // jump
      red.onGround = false;
    } else {
      red.vz = -4;
    }
  }
  // Blue controls (arrows + jump)
  blue.vx = blue.vz = 0;
  if (keys['ArrowLeft']) blue.vx = -4;
  if (keys['ArrowRight']) blue.vx = 4;
  if (keys['ArrowDown']) blue.vz = 4;
  if (keys['ArrowUp']) {
    if (blue.onGround) {
      blue.vy = 8; // jump
      blue.onGround = false;
    } else {
      blue.vz = -4;
    }
  }
  // Move and check collisions
  movePlayer3D(red);
  movePlayer3D(blue);
  // Tag detection (3D)
  const dx = red.mesh.position.x - blue.mesh.position.x;
  const dz = red.mesh.position.z - blue.mesh.position.z;
  const dy = red.mesh.position.y - blue.mesh.position.y;
  if (Math.sqrt(dx*dx + dz*dz + dy*dy) < 36) {
    statusEl.textContent = 'Red tagged Blue!';
    gameOver = true;
  }
}

  let nx = player.mesh.position.x + player.vx;
  let nz = player.mesh.position.z + player.vz;
  let ny = player.mesh.position.y + (player.vy || 0);
  // Gravity
  if (!player.onGround) {
    player.vy -= 0.5;
  }
  // Clamp to arena
  nx = Math.max(-arenaSize/2 + 18, Math.min(nx, arenaSize/2 - 18));
  nz = Math.max(-arenaSize/2 + 18, Math.min(nz, arenaSize/2 - 18));
  // Floor collision
  if (ny <= 20) {
    ny = 20;
    player.vy = 0;
    player.onGround = true;
  } else {
    player.onGround = false;
  }
  // Platform collision (AABB, y)
  let onPlatform = false;
  for (const obs of obstacles) {
    const px = nx, pz = nz;
    const ox = obs.position.x, oy = obs.position.y, oz = obs.position.z;
    const hw = obs.geometry.parameters.width / 2;
    const hd = obs.geometry.parameters.depth / 2;
    // Check if above platform and within bounds
    if (
      Math.abs(px - ox) < hw - 10 &&
      Math.abs(pz - oz) < hd - 10 &&
      player.mesh.position.y >= oy + 10 &&
      ny <= oy + 15
    ) {
      ny = oy + 15;
      player.vy = 0;
      player.onGround = true;
      onPlatform = true;
      break;
    }
  }
  player.mesh.position.x = nx;
  player.mesh.position.z = nz;
  player.mesh.position.y = ny;
}

document.addEventListener('keydown', e => { keys[e.key] = true; });
document.addEventListener('keyup', e => { keys[e.key] = false; });

window.resetTag3DGame = resetTag3DGame;
window.onload = function() {
  resetTag3DGame();
  animateTag3D();
};
