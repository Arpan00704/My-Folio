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

// 5. Handle Window Resize
window.addEventListener('resize', () => {
  width = container.clientWidth;
  height = container.clientHeight;
  
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
