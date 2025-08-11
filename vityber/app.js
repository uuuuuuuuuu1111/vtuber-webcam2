import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/controls/OrbitControls.js';
import { VRM, VRMUtils } from 'https://cdn.jsdelivr.net/npm/@pixiv/three-vrm@1.0.5/dist/three-vrm.module.js';

const container = document.getElementById('canvas-container');
const statusEl = document.getElementById('status');
const startBtn = document.getElementById('btn-start');

let renderer, scene, camera, clock, mixer, currentVRM;

function setStatus(s){ statusEl.textContent = s; }

async function initThree(){
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(0.0, 1.4, 2.5);

  const light = new THREE.DirectionalLight(0xffffff);
  light.position.set(1,1,1).normalize();
  scene.add(light);
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0,1.2,0);
  controls.update();

  clock = new THREE.Clock();
  window.addEventListener('resize', onWindowResize);
  animate();
}

function onWindowResize(){
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(){
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (currentVRM && currentVRM.update) currentVRM.update(delta);
  renderer.render(scene, camera);
}

async function loadVRM(url){
  setStatus('Loading VRM...');
  const loader = new THREE.GLTFLoader();
  // GLTFLoader depends on DRACOLoader for some models; we keep this simple.
  return new Promise((resolve, reject) => {
    loader.load(url, (gltf) => {
      VRM.from(gltf).then(vrm => {
        VRMUtils.rotateY(vrm.scene, Math.PI); // rotate to face camera
        resolve(vrm);
      }).catch(reject);
    }, (progress) => {}, reject);
  });
}

startBtn.addEventListener('click', async () => {
  startBtn.disabled = true;
  setStatus('Initializing three.js...');
  await initThree();
  try {
    // placeholder vrm in assets/
    const vrm = await loadVRM('assets/model.vrm');
    vrm.scene.scale.set(1.0,1.0,1.0);
    scene.add(vrm.scene);
    currentVRM = vrm;
    setStatus('VRM loaded. (Replace assets/model.vrm with your real .vrm)');
    // simple blink / look example using blendshapes if present
    if (vrm.blendShapeProxy){
      const blink = () => {
        const indices = ['v_aa','v_kk','v_p']; // common names vary; user should inspect their model
        vrm.blendShapeProxy.setValue('Blink', 1.0);
        setTimeout(()=> vrm.blendShapeProxy.setValue('Blink', 0.0), 150);
      };
      setInterval(blink, 4000);
    }
  } catch(e) {
    console.error(e);
    setStatus('Failed to load VRM. See console.');
  }
});
