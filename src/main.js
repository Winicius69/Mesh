import * as THREE from 'three';

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.06);
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const canvas = renderer.domElement;

canvas.addEventListener('webglcontextlost', (event) => {
  event.preventDefault();
  location.reload();
});

canvas.addEventListener('webglcontextrestored', () => {
  location.reload();
});

// ======== CRIAR PARTÍCULAS ========
const particleCount = 3000;
const positions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
  positions[i * 3 + 0] = (Math.random() - 0.5) * 20; // X
  positions[i * 3 + 1] = (Math.random() - 0.5) * 20; // Y
  positions[i * 3 + 2] = (Math.random() - 0.5) * 20; // Z
}

const particleGeometry = new THREE.BufferGeometry();
particleGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(positions, 3)
);

const particleMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.03
});

const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

// ======== POSIÇÃO DA CÂMERA ========
camera.position.z = 5;

// ======== PARÂMETROS DE TRAVESSIA ========
const travelSpeed = 0.02;
const zLimitFront = camera.position.z + 1;
const zLimitBack = -20;

// ======== VARIAÇÃO ORGÂNICA ========
const velocities = new Float32Array(particleCount);
const drift = new Float32Array(particleCount * 2);

for (let i = 0; i < particleCount; i++) {
  velocities[i] = travelSpeed * (0.6 + Math.random() * 0.8);
  drift[i * 2 + 0] = (Math.random() * 0.004) - 0.002; // X
  drift[i * 2 + 1] = (Math.random() * 0.004) - 0.002; // Y
}

// ======== ANIMAÇÃO ========
function animate() {
  requestAnimationFrame(animate);

  // Movimento tipo espaço viajando
  particles.rotation.x += 0.0008;
  particles.rotation.y += 0.001;

  // Travessia contínua no eixo Z
  const positionsArray = particles.geometry.attributes.position.array;
  for (let i = 2; i < positionsArray.length; i += 3) {
    positionsArray[i] += travelSpeed;
  }

  // Ajuste orgânico por partícula (Z + drift X/Y)
  for (let p = 0; p < particleCount; p++) {
    const base = p * 3;
    const dx = drift[p * 2 + 0];
    const dy = drift[p * 2 + 1];

    positionsArray[base + 0] += dx;
    positionsArray[base + 1] += dy;
    positionsArray[base + 2] += velocities[p] - travelSpeed;
    if (positionsArray[base + 2] > zLimitFront) {
      positionsArray[base + 0] = (Math.random() - 0.5) * 20;
      positionsArray[base + 1] = (Math.random() - 0.5) * 20;
      positionsArray[base + 2] = zLimitBack;
    }
  }
  particles.geometry.attributes.position.needsUpdate = true;

  renderer.render(scene, camera);
}

animate();

// ======== RESPONSIVIDADE ========
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
