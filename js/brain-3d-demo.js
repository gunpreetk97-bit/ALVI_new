/**
 * ALVI — Interactive 3D Brain Sculpture Prototype Logic
 * Real Three.js WebGL application featuring:
 * - 3D GLTF/GLB human brain mesh loader
 * - Physically Based Rendering (PBR) studio lighting (Warm ivory aesthetic)
 * - OrbitControls with smooth inertia damping, spherical rotation & zoom clamps
 * - Gentle automatic idle turntable rotation (pauses on user interaction)
 * - Responsive viewport resizing & prefers-reduced-motion support
 */

// THREE, OrbitControls, and GLTFLoader are loaded as UMD globals via <script> tags in brain-3d-demo.html
// No ES module imports needed.

(function () {
  'use strict';

  // ── 1. DOM Elements ────────────────────────────────────────────────────────
  const container = document.getElementById('webgl-canvas-container');
  const loadingOverlay = document.getElementById('loading-overlay');
  const loadingStatusText = document.getElementById('loading-status-text');
  const resetBtn = document.getElementById('btn-reset-camera');

  if (!container) return;

  // Reduced motion preference
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let isReducedMotion = reducedMotionQuery.matches;
  reducedMotionQuery.addEventListener('change', (e) => {
    isReducedMotion = e.matches;
  });

  // ── 2. Three.js Scene, Camera & Renderer Setup ─────────────────────────────
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xF8F6F3); // Warm ivory canvas to match ALVI palette

  const camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  // Default camera position: slight elevated perspective
  const DEFAULT_CAM_POS = new THREE.Vector3(0, 1.2, 5.0);
  camera.position.copy(DEFAULT_CAM_POS);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // ── 3. OrbitControls (Smooth Inertia & Clamped Spherical Navigation) ───────
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.rotateSpeed = 0.85;
  controls.zoomSpeed = 0.9;
  controls.panSpeed = 0.6;
  controls.minDistance = 2.4;  // Prevent clipping through the brain interior
  controls.maxDistance = 8.5;  // Keep brain visually dominant in the viewport
  controls.maxPolarAngle = Math.PI * 0.92; // Prevent turning completely upside down
  controls.target.set(0, 0, 0);

  // ── 4. Controlled Anatomical Studio Lighting Setup ─────────────────────────
  // A. Low ambient baseline to keep fold shadows deep and defined
  const ambientLight = new THREE.AmbientLight(0xEAE7E2, 0.35);
  scene.add(ambientLight);

  // B. Key Light: Oblique directional light creating crisp contrast across gyri/sulci
  const keyLight = new THREE.DirectionalLight(0xFFF9F0, 1.15);
  keyLight.position.set(5, 7, 4);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  keyLight.shadow.bias = -0.0001;
  scene.add(keyLight);

  // C. Fill Light: Soft, low-intensity cool fill on opposite side
  const fillLight = new THREE.DirectionalLight(0xD6DFDC, 0.4);
  fillLight.position.set(-5, 2, 2);
  scene.add(fillLight);

  // D. Rim / Accent Light: Backlight defining anatomical contours against the canvas
  const rimLight = new THREE.DirectionalLight(0xE0ECE8, 0.55);
  rimLight.position.set(0, 5, -6);
  scene.add(rimLight);

  // E. Ground Plane Shadow Receiver (Soft, natural grounding)
  const shadowPlaneGeo = new THREE.PlaneGeometry(16, 16);
  const shadowPlaneMat = new THREE.ShadowMaterial({
    opacity: 0.08
  });
  const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = -1.4;
  shadowPlane.receiveShadow = true;
  scene.add(shadowPlane);

  // ── 5. Sculptural Material (Neutral Studio Clay / Plaster Finish) ──────────
  // Medium-warm sculptural gray with high matte roughness to reveal anatomical depth
  const sculptureMaterial = new THREE.MeshStandardMaterial({
    color: 0x9E9992,          // Medium-warm neutral plaster gray (preserves contrast)
    roughness: 0.72,          // Matte stone/clay finish prevents blown-out glare
    metalness: 0.0,           // Biological dielectric material
    side: THREE.DoubleSide
  });

  // ── 6. Load Anatomical Brain Model (assets/models/brain.glb) ───────────────
  // Diagnostic: confirm GLTFLoader is available
  if (typeof THREE.GLTFLoader !== 'function') {
    if (loadingStatusText) loadingStatusText.textContent = 'ERROR: THREE.GLTFLoader not loaded. Check CDN scripts.';
    console.error('THREE.GLTFLoader is not a function:', typeof THREE.GLTFLoader);
    return;
  }

  let brainGroup = new THREE.Group();
  scene.add(brainGroup);

  // Diagnostic: pre-test GLB reachability with fetch before passing to GLTFLoader
  fetch('assets/models/brain.glb', { method: 'HEAD' })
    .then(r => {
      if (!r.ok) {
        if (loadingStatusText) loadingStatusText.textContent = 'ERROR: GLB fetch HEAD returned ' + r.status + '. Server may not be running.';
        return;
      }
      startLoader();
    })
    .catch(err => {
      if (loadingStatusText) loadingStatusText.textContent = 'ERROR: Fetch failed — ' + err.message + '. Open via http://localhost:8000';
    });

  function startLoader() {
  const loader = new THREE.GLTFLoader();

  const MODEL_PATH = 'assets/models/brain.glb';

  loader.load(
    MODEL_PATH,
    (gltf) => {
      const model = gltf.scene;

      // Calculate bounding box to normalize scale and center brain precisely at origin
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      box.getSize(size);
      const center = new THREE.Vector3();
      box.getCenter(center);

      // Center model geometry
      model.position.x = -center.x;
      model.position.y = -center.y;
      model.position.z = -center.z;

      // Scale to fit standard unit sphere (~2.6 units across)
      const maxDim = Math.max(size.x, size.y, size.z);
      const targetScale = 2.6 / maxDim;
      brainGroup.scale.set(targetScale, targetScale, targetScale);

      // Apply museum-sculpture material, enable shadows and smooth normals
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.material = sculptureMaterial;
          if (child.geometry && !child.geometry.attributes.normal) {
            child.geometry.computeVertexNormals();
          }
        }
      });

      // Initial natural orientation (anatomical sagittal three-quarter tilt)
      brainGroup.rotation.y = -0.45;
      brainGroup.rotation.x = 0.12;

      brainGroup.add(model);

      // Dismiss loading overlay smoothly
      if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
      }
    },
    (xhr) => {
      if (xhr.lengthComputable && loadingStatusText) {
        const percent = Math.round((xhr.loaded / xhr.total) * 100);
        loadingStatusText.textContent = `Loading 3D anatomical mesh (${percent}%)…`;
      }
    },
    (error) => {
      console.error('Error loading 3D brain model:', error);
      const msg = (error && error.message) ? error.message : String(error);
      if (loadingStatusText) {
        loadingStatusText.textContent = 'GLB load error: ' + msg;
      }
    }
  );
  } // end startLoader

  // ── 7. Automatic Idle Turntable Rotation ───────────────────────────────────
  let isUserInteracting = false;
  let idleTimer = null;
  const IDLE_TIMEOUT_MS = 2400; // Resume slow spin after 2.4s of inactivity

  function onInteractionStart() {
    isUserInteracting = true;
    clearTimeout(idleTimer);
  }

  function onInteractionEnd() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      isUserInteracting = false;
    }, IDLE_TIMEOUT_MS);
  }

  controls.addEventListener('start', onInteractionStart);
  controls.addEventListener('end', onInteractionEnd);

  // ── 8. Reset Perspective Button ───────────────────────────────────────────
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      // Smoothly animate camera and controls back to default orientation
      controls.reset();
      camera.position.copy(DEFAULT_CAM_POS);
      controls.target.set(0, 0, 0);
      controls.update();
      if (brainGroup) {
        brainGroup.rotation.y = -0.45;
        brainGroup.rotation.x = 0.12;
      }
    });
  }

  // ── 9. Viewport Resizing Handler ──────────────────────────────────────────
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  // ── 10. Animation & Render Loop ───────────────────────────────────────────
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    // Gentle auto-rotation only when idle and reduced-motion is not requested
    if (!isUserInteracting && !isReducedMotion && brainGroup) {
      brainGroup.rotation.y += delta * 0.14; // Elegant, slow turntable rotation
    }

    controls.update();
    renderer.render(scene, camera);
  }

  animate();
})();

