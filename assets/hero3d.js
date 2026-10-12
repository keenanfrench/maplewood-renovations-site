// Maplewood Renovations — hero "material board" (Three.js)
// Four floating finish samples, procedurally textured (no image downloads).
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const host = document.querySelector('#board');
const caption = document.querySelector('#board-caption');
const chips = [...document.querySelectorAll('.swatch')];
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const SAMPLES = {
  marble: 'Calacatta-look marble — <b>benchtops, splashbacks & vanity tops</b>',
  oak: 'European oak — <b>timber benchtops, open shelving & floors</b>',
  tile: 'Sage zellige — <b>handmade-look feature tiles for walls & niches</b>',
  brass: 'Brushed brass — <b>tapware, handles & lighting accents</b>',
};
const DEFAULT_CAPTION = 'Tap a sample: <b>the finishes our clients choose most</b>';

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch (e) {
  host.classList.add('no-webgl');
}

if (renderer) init();

function init() {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.82;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  host.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.38;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
  const target = new THREE.Vector3(0.05, 0.2, 0);

  // Lights
  const sun = new THREE.DirectionalLight(0xfff1df, 1.9);
  sun.position.set(0.9, 7, 2.2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -3.2; sun.shadow.camera.right = 3.2;
  sun.shadow.camera.top = 3.2; sun.shadow.camera.bottom = -3.2;
  sun.shadow.radius = 6;
  sun.shadow.bias = -0.0006;
  scene.add(sun);
  scene.add(new THREE.HemisphereLight(0xf5efe6, 0x8a7a68, 0.45));

  // Soft contact shadow plane
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ opacity: 0.2 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.75;
  ground.receiveShadow = true;
  scene.add(ground);

  const board = new THREE.Group();
  scene.add(board);
  const items = [];

  function addItem(key, obj, pos, rotY, phase) {
    obj.position.copy(pos);
    obj.rotation.y = rotY;
    obj.userData = { key, base: pos.clone(), rotY, phase, lift: 0 };
    obj.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; o.userData.item = obj; } });
    board.add(obj);
    items.push(obj);
  }

  // Marble slab
  const marbleTex = canvasTexture(1024, 512, drawMarble);
  const marble = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.1, 1.4, 1, 1, 1),
    new THREE.MeshPhysicalMaterial({ map: marbleTex, roughness: 0.22, clearcoat: 0.6, clearcoatRoughness: 0.25 })
  );
  addItem('marble', marble, new THREE.Vector3(-0.45, 0.0, -0.25), 0.14, 0);

  // Oak board
  const oakTex = canvasTexture(1024, 256, drawOak);
  const oak = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 0.12, 0.56),
    new THREE.MeshStandardMaterial({ map: oakTex, roughness: 0.62 })
  );
  addItem('oak', oak, new THREE.Vector3(0.4, 0.26, 0.45), -0.3, 1.7);

  // Zellige tiles (3 x 2)
  const glazeTex = canvasTexture(256, 256, drawGlaze);
  const tiles = new THREE.Group();
  const sages = [0x7d9875, 0x6b8664, 0x88a280, 0x728d6b, 0x809b78, 0x67805f];
  const tileGeo = new THREE.BoxGeometry(0.4, 0.05, 0.4);
  for (let i = 0; i < 6; i++) {
    const t = new THREE.Mesh(tileGeo, new THREE.MeshPhysicalMaterial({
      color: sages[i], map: glazeTex, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.12,
    }));
    t.position.set((i % 3 - 1) * 0.43, 0, (Math.floor(i / 3) - 0.5) * 0.43);
    t.rotation.set(rand(-0.03, 0.03), rand(-0.04, 0.04), rand(-0.03, 0.03));
    tiles.add(t);
  }
  addItem('tile', tiles, new THREE.Vector3(0.95, 0.5, -0.7), 0.38, 3.1);

  // Brushed brass pull handle
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xc9a062, metalness: 1, roughness: 0.3 });
  const handle = new THREE.Group();
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 1.25, 32), brassMat);
  bar.rotation.z = Math.PI / 2;
  bar.position.y = 0.14;
  handle.add(bar);
  for (const x of [-0.5, 0.5]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.15, 24), brassMat);
    post.position.set(x, 0.06, 0);
    handle.add(post);
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 32), brassMat);
    foot.position.set(x, -0.01, 0);
    handle.add(foot);
  }
  addItem('brass', handle, new THREE.Vector3(-0.7, 0.55, 0.7), 0.42, 4.6);

  // Interaction
  let selected = null;
  const pointer = new THREE.Vector2(0, 0);
  const tilt = new THREE.Vector2(0, 0);
  const ray = new THREE.Raycaster();

  function select(key) {
    selected = selected === key ? null : key;
    chips.forEach(c => c.setAttribute('aria-pressed', String(c.dataset.sample === selected)));
    caption.innerHTML = selected ? SAMPLES[selected] : DEFAULT_CAPTION;
  }
  chips.forEach(c => c.addEventListener('click', () => select(c.dataset.sample)));

  function hit(e) {
    const r = renderer.domElement.getBoundingClientRect();
    const v = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(v, camera);
    const h = ray.intersectObjects(items, true)[0];
    return h ? h.object.userData.item : null;
  }
  renderer.domElement.addEventListener('click', e => {
    const it = hit(e);
    if (it) select(it.userData.key);
  });
  renderer.domElement.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const r = renderer.domElement.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1);
    renderer.domElement.style.cursor = hit(e) ? 'pointer' : 'default';
  });
  renderer.domElement.addEventListener('pointerleave', () => pointer.set(0, 0));

  // Sizing
  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const dist = camera.aspect < 0.9 ? 8.2 : 7.0;
    camera.position.set(0.6, dist * 0.52, dist * 0.86);
    camera.lookAt(target);
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(host);
  resize();

  // Loop (paused when off screen or tab hidden)
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 }).observe(host);
  const clock = new THREE.Clock();
  let t = 0;

  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05);
    if (!visible || document.hidden) return;
    if (!reduced) t += dt;
    const k = reduced ? 1 : 1 - Math.pow(0.002, dt); // frame-rate independent easing

    tilt.x += (pointer.x - tilt.x) * k * 0.6;
    tilt.y += (pointer.y - tilt.y) * k * 0.6;
    board.rotation.y = Math.sin(t * 0.18) * 0.22 + tilt.x * 0.32;
    board.rotation.x = tilt.y * 0.1;

    for (const it of items) {
      const u = it.userData;
      const goal = selected === null ? 0 : selected === u.key ? 1 : -0.35;
      u.lift += (goal - u.lift) * k;
      const lifted = Math.max(u.lift, 0);
      it.position.y = u.base.y + Math.sin(t * 0.9 + u.phase) * 0.045 + u.lift * 0.5;
      it.position.z = u.base.z + lifted * 0.35;
      it.rotation.x = lifted * 0.42 + Math.sin(t * 0.6 + u.phase) * 0.02;
      it.rotation.z = Math.cos(t * 0.7 + u.phase) * 0.018;
      it.rotation.y = u.rotY - lifted * u.rotY * 0.6;
    }
    renderer.render(scene, camera);
  });
}

// ---------- procedural textures ----------
function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function drawMarble(g, w, h) {
  g.fillStyle = '#e6e1d9';
  g.fillRect(0, 0, w, h);
  // soft clouding
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * w, y = Math.random() * h, r = rand(60, 220);
    const grd = g.createRadialGradient(x, y, 0, x, y, r);
    grd.addColorStop(0, 'rgba(196,188,176,0.22)');
    grd.addColorStop(1, 'rgba(214,208,198,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
  }
  // veins: wandering diagonal strokes
  const vein = (width, alpha, color) => {
    let x = rand(-100, w * 0.6), y = rand(-50, h);
    const ang = rand(-0.5, 0.2);
    g.beginPath();
    g.moveTo(x, y);
    for (let s = 0; s < 70; s++) {
      x += Math.cos(ang) * 20 + rand(-6, 6);
      y += Math.sin(ang) * 20 + rand(-12, 12);
      g.lineTo(x, y);
    }
    g.strokeStyle = color.replace('A', alpha);
    g.lineWidth = width;
    g.stroke();
  };
  g.filter = 'blur(1.5px)';
  for (let i = 0; i < 5; i++) vein(rand(4, 8), 0.5, 'rgba(105,98,90,A)');
  g.filter = 'blur(0.6px)';
  for (let i = 0; i < 9; i++) vein(rand(1, 2.4), 0.65, 'rgba(88,82,76,A)');
  for (let i = 0; i < 3; i++) vein(rand(1, 2), 0.35, 'rgba(176,146,98,A)'); // faint gold
  g.filter = 'none';
}

function drawOak(g, w, h) {
  const grd = g.createLinearGradient(0, 0, 0, h);
  grd.addColorStop(0, '#b98c5e');
  grd.addColorStop(0.5, '#ad8153');
  grd.addColorStop(1, '#b6895b');
  g.fillStyle = grd;
  g.fillRect(0, 0, w, h);
  for (let i = 0; i < 70; i++) {
    const y0 = rand(0, h), amp = rand(1, 6), f = rand(0.002, 0.008), ph = rand(0, 6);
    g.beginPath();
    for (let x = 0; x <= w; x += 8) {
      const y = y0 + Math.sin(x * f + ph) * amp + Math.sin(x * f * 3.1) * amp * 0.3;
      x === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
    }
    g.strokeStyle = `rgba(${rand(120, 150) | 0},${rand(84, 100) | 0},${rand(52, 64) | 0},${rand(0.12, 0.4)})`;
    g.lineWidth = rand(0.6, 2.4);
    g.stroke();
  }
  // a couple of small knots / flecks
  for (let i = 0; i < 26; i++) {
    g.fillStyle = 'rgba(110,76,46,0.18)';
    g.fillRect(rand(0, w), rand(0, h), rand(6, 18), 1.2);
  }
}

function drawGlaze(g, w, h) {
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, w, h);
  for (let i = 0; i < 26; i++) {
    const x = Math.random() * w, y = Math.random() * h, r = rand(20, 90);
    const grd = g.createRadialGradient(x, y, 0, x, y, r);
    const light = Math.random() > 0.5;
    grd.addColorStop(0, light ? 'rgba(255,255,255,0.5)' : 'rgba(150,160,145,0.35)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
  }
  // darker pooled edge, like hand-glazed tile
  const edge = g.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.72);
  edge.addColorStop(0, 'rgba(0,0,0,0)');
  edge.addColorStop(1, 'rgba(60,70,55,0.35)');
  g.fillStyle = edge;
  g.fillRect(0, 0, w, h);
}

function rand(a, b) { return a + Math.random() * (b - a); }
