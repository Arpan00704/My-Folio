// 1. Setup Three.js Scene and Responsive Canvas
const canvas = document.querySelector('#webgl-canvas');
const container = document.querySelector('.right-canvas');

// Calculate layout dimensions dynamically to support desktop (50vw) and mobile (100vw)
let width = container.clientWidth;
let height = container.clientHeight;

const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
camera.position.z = 10;

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// 2. Create the 3D Object (A multi-part group)
const objectGroup = new THREE.Group();

// Part A: The Outer Shell (Wireframe Icosahedron)
const shellGeometry = new THREE.IcosahedronGeometry(3, 1);
const shellMaterial = new THREE.MeshStandardMaterial({ 
  color: 0x38bdf8, 
  wireframe: true,
  transparent: true,
  opacity: 1 
});
const shell = new THREE.Mesh(shellGeometry, shellMaterial);

// Part B: The Inner Core (Solid Sphere)
const coreGeometry = new THREE.SphereGeometry(1.2, 32, 32);
const coreMaterial = new THREE.MeshStandardMaterial({ 
  color: 0x8b5cf6, 
  roughness: 0.3, 
  metalness: 0.9 
});
const core = new THREE.Mesh(coreGeometry, coreMaterial);

// Assemble the parts
objectGroup.add(shell);
objectGroup.add(core);
scene.add(objectGroup);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0xffffff, 1.2);
pointLight1.position.set(5, 5, 5);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0x38bdf8, 0.8);
pointLight2.position.set(-5, -5, -5);
scene.add(pointLight2);

// 3. Render Loop (Keep it spinning slightly at all times)
function animate() {
  requestAnimationFrame(animate);
  
  // Idle continuous rotation
  objectGroup.rotation.y += 0.003;
  objectGroup.rotation.x += 0.0015;

  renderer.render(scene, camera);
}
animate();

// 4. GSAP Scroll Animations
gsap.registerPlugin(ScrollTrigger);

// Animate the text opacity based on scroll
const steps = gsap.utils.toArray('.step');
steps.forEach((step) => {
  ScrollTrigger.create({
    trigger: step,
    start: "top center",
    end: "bottom center",
    toggleClass: "active",
  });
});

// Create a master timeline for the 3D object tied to the whole left container
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".left-text",
    start: "top top",
    end: "bottom bottom",
    scrub: 1.5, // Smoothly link animation to scrollbar with a slight lag for premium feel
  }
});

// Phase 1 to Phase 2: Reveal the Core
// When scrolling from the first to the second block of text
tl.to(shell.scale, { x: 1.5, y: 1.5, z: 1.5, ease: "power2.inOut" }, 0)
  .to(shell.material, { opacity: 0.1, ease: "power2.inOut" }, 0) // Fade outer shell
  .to(core.scale, { x: 1.8, y: 1.8, z: 1.8, ease: "power2.inOut" }, 0) // Grow core
  .to(objectGroup.rotation, { z: Math.PI / 2, ease: "power2.inOut" }, 0); // Rotate the whole group

// Phase 2 to Phase 3: The Climax
// When scrolling from the second to the third block of text
tl.to(coreMaterial.color, { r: 0.98, g: 0.22, b: 0.57 }, 0.5) // Change core color to glowing pink/magenta
  .to(shell.rotation, { x: Math.PI * 1.5, y: Math.PI, ease: "none" }, 0.5) // Spin the shell intensely
  .to(camera.position, { z: 7.5, ease: "power2.inOut" }, 0.5); // Move camera closer

// --------------------------------------------------------
// 6. Interactive 3D Surface (Part 4)
// --------------------------------------------------------
const surfaceCanvas = document.querySelector('#surface-canvas');
const surfaceContainer = document.querySelector('.surface-canvas-container');

let surfaceWidth = surfaceContainer.clientWidth;
let surfaceHeight = surfaceContainer.clientHeight;

const surfaceScene = new THREE.Scene();

// Camera
const surfaceCamera = new THREE.PerspectiveCamera(45, surfaceWidth / surfaceHeight, 0.1, 100);
surfaceCamera.position.set(0, -6, 8); // Tilted perspective
surfaceCamera.lookAt(0, 0, 0);

// Renderer
const surfaceRenderer = new THREE.WebGLRenderer({ canvas: surfaceCanvas, alpha: true, antialias: true });
surfaceRenderer.setSize(surfaceWidth, surfaceHeight);
surfaceRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Plane Mesh Geometry
// We use a high segment count for smooth wave deformations
const planeGeometry = new THREE.PlaneGeometry(28, 20, 70, 50);

// Save the original z positions to compute the base sine waves properly
const positionAttribute = planeGeometry.attributes.position;
const originalZ = new Float32Array(positionAttribute.count);
for (let i = 0; i < positionAttribute.count; i++) {
  originalZ[i] = positionAttribute.getZ(i);
}

// Plane Material
const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0x38bdf8,
  emissive: 0x1a0b2e,
  roughness: 0.2,
  metalness: 0.8,
  wireframe: true,
  transparent: true,
  opacity: 0.3 // Reduced opacity so boxes stand out
});

const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
surfaceScene.add(planeMesh);

// 3D Boxes Instanced Mesh — Sparse Grid (every 3rd vertex to avoid clutter)
const cols = 71; // planeGeometry width segments + 1
const boxIndices = []; // stores which vertex indices get a box
for (let i = 0; i < positionAttribute.count; i++) {
  const col = i % cols;
  const row = Math.floor(i / cols);
  if (col % 3 === 0 && row % 3 === 0) {
    boxIndices.push(i);
  }
}

const boxGeometry = new THREE.BoxGeometry(0.28, 0.28, 0.28);
const boxMaterial = new THREE.MeshStandardMaterial({
  color: 0x8b5cf6,
  emissive: 0x38bdf8,
  emissiveIntensity: 0.3,
  roughness: 0.15,
  metalness: 0.9
});
const boxInstancedMesh = new THREE.InstancedMesh(boxGeometry, boxMaterial, boxIndices.length);
boxInstancedMesh.frustumCulled = false;
surfaceScene.add(boxInstancedMesh);

const dummy = new THREE.Object3D();

// Lighting
const surfaceAmbient = new THREE.AmbientLight(0xffffff, 0.2);
surfaceScene.add(surfaceAmbient);

// Interactive Hover Light (Follows mouse)
const hoverLight = new THREE.PointLight(0x8b5cf6, 3, 10);
hoverLight.position.set(0, 0, 2);
surfaceScene.add(hoverLight);

// Raycaster & Mouse setup
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
// We'll store the target intersection point
const targetIntersect = new THREE.Vector3(0, 0, 0);

// Track mouse movement over the container
surfaceContainer.addEventListener('mousemove', (event) => {
  const rect = surfaceContainer.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  
  raycaster.setFromCamera(mouse, surfaceCamera);
  const intersects = raycaster.intersectObject(planeMesh);
  
  if (intersects.length > 0) {
    targetIntersect.copy(intersects[0].point);
  }
});

// Render Loop for the Surface
const clock = new THREE.Clock();

function animateSurface() {
  requestAnimationFrame(animateSurface);
  
  const elapsedTime = clock.getElapsedTime();
  
  // Smoothly move the hover light towards the target intersection
  hoverLight.position.x += (targetIntersect.x - hoverLight.position.x) * 0.1;
  hoverLight.position.y += (targetIntersect.y - hoverLight.position.y) * 0.1;

  // Animate the vertices and boxes
  for (let i = 0; i < positionAttribute.count; i++) {
    const x = positionAttribute.getX(i);
    const y = positionAttribute.getY(i);
    
    // 1. Base idle wave animation (using sine and cosine)
    const waveX = Math.sin(x * 0.5 + elapsedTime * 1.5) * 0.3;
    const waveY = Math.cos(y * 0.5 + elapsedTime * 1.2) * 0.3;
    let newZ = originalZ[i] + waveX + waveY;
    
    // 2. Interactive Gaussian deformation from hover light
    const dx = x - hoverLight.position.x;
    const dy = y - hoverLight.position.y;
    const distanceSq = dx * dx + dy * dy;
    
    // Apply a bump that pulls vertices upward towards the mouse
    const hoverInfluence = Math.exp(-distanceSq / 4.0) * 2.0; 
    newZ += hoverInfluence;
    
    positionAttribute.setZ(i, newZ);
  }
  
  positionAttribute.needsUpdate = true;

  // 3. Update Box Instances (sparse grid, only pop up near cursor)
  for (let b = 0; b < boxIndices.length; b++) {
    const vi = boxIndices[b]; // vertex index
    const x = positionAttribute.getX(vi);
    const y = positionAttribute.getY(vi);
    const z = positionAttribute.getZ(vi);

    // Distance from hover point
    const dx = x - hoverLight.position.x;
    const dy = y - hoverLight.position.y;
    const distSq = dx * dx + dy * dy;

    // Tight Gaussian — boxes only visible within ~radius 3
    const influence = Math.exp(-distSq / 2.5);

    if (influence > 0.05) {
      // Pop up: scale from 0 to full based on proximity
      const s = influence * 1.8;
      const popZ = z + influence * 1.5; // lift above the surface

      dummy.position.set(x, y, popZ);
      dummy.rotation.set(
        elapsedTime * 0.5,
        elapsedTime * 0.3,
        influence * Math.PI * 0.5
      );
      dummy.scale.set(s, s, s);
    } else {
      // Hide: scale to zero
      dummy.position.set(x, y, z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(0, 0, 0);
    }
    
    dummy.updateMatrix();
    boxInstancedMesh.setMatrixAt(b, dummy.matrix);
  }
  
  boxInstancedMesh.instanceMatrix.needsUpdate = true;
  
  surfaceRenderer.render(surfaceScene, surfaceCamera);
}
animateSurface();

// --------------------------------------------------------
// 7. Global Window Resize Handler
// --------------------------------------------------------
window.addEventListener('resize', () => {
  // Update First Canvas
  width = container.clientWidth;
  height = container.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  
  // Update Second Canvas
  surfaceWidth = surfaceContainer.clientWidth;
  surfaceHeight = surfaceContainer.clientHeight;
  surfaceCamera.aspect = surfaceWidth / surfaceHeight;
  surfaceCamera.updateProjectionMatrix();
  surfaceRenderer.setSize(surfaceWidth, surfaceHeight);
  surfaceRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
