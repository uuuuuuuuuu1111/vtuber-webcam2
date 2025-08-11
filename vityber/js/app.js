// Improved app.js: more robust, status messages, resize handling, smoothing.

const videoElement = document.getElementById('webcam');
const canvas = document.getElementById('output');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

let cw = window.innerWidth;
let ch = window.innerHeight;
canvas.width = cw;
canvas.height = ch;

// Simple linear interpolation for smoothing
function lerp(a,b,t){return a+(b-a)*t;}
const smooth = {x:0,y:0,scale:1,rot:0};

// Load character sprite and wait
const character = new Image();
character.src = 'assets/character.png';
let characterLoaded = false;
character.onload = ()=>{ characterLoaded = true; status('Персонаж загружен'); };

function status(txt){ statusEl.innerText = txt; console.log(txt); }

// Check secure context (getUserMedia requires https or localhost)
if(location.protocol === 'file:'){
    status('Запущено по file:// — откройте через локальный сервер (пример: python -m http.server)');
}

// Resize handling
function resizeCanvas(){
    cw = window.innerWidth;
    ch = window.innerHeight;
    canvas.width = cw;
    canvas.height = ch;
}
window.addEventListener('resize', resizeCanvas);

// Initialize MediaPipe Holistic
if(typeof Holistic === 'undefined'){
    status('MediaPipe не загружен. Проверьте подключение к интернету.');
}

const holistic = new Holistic.Holistic({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`
});

holistic.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    refineFaceLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

holistic.onResults(onResults);

// Start camera
let camera;
try{
    camera = new Camera(videoElement, {
        onFrame: async () => { await holistic.send({image: videoElement}); },
        width: 640,
        height: 480
    });
    camera.start();
    status('Камера запускается... разрешите доступ к камере.');
}catch(e){
    console.error(e);
    status('Ошибка запуска камеры: ' + e.message);
}

// Default baseline shoulder distance for scale reference
let baselineShoulderDist = null;

function getDistance(a,b){
    const dx = (a.x - b.x);
    const dy = (a.y - b.y);
    return Math.sqrt(dx*dx + dy*dy);
}

function onResults(results){
    ctx.clearRect(0,0,cw,ch);

    if(!characterLoaded){
        status('Ждём загрузки персонажа...');
        return;
    }

    if(!results.poseLandmarks){
        status('Не обнаружено позы — подойдите к камере.');
        return;
    }

    status('Слежение активно');

    // Use nose as main anchor (poseLandmarks[0])
    const nose = results.poseLandmarks[0];
    const leftShoulder = results.poseLandmarks[11];
    const rightShoulder = results.poseLandmarks[12];

    // Calculate target position on canvas
    const targetX = nose.x * cw;
    const targetY = nose.y * ch;

    // Calculate scale based on shoulder distance (bigger when closer)
    const shoulderDist = getDistance(leftShoulder, rightShoulder);
    if(!baselineShoulderDist) baselineShoulderDist = shoulderDist;
    const scaleTarget = 1 * (shoulderDist / baselineShoulderDist) * 1.8; // tuning multiplier

    // rotation: angle between shoulders
    const dx = (leftShoulder.x - rightShoulder.x);
    const dy = (leftShoulder.y - rightShoulder.y);
    const angle = Math.atan2(dy, dx); // radians

    // Smooth values
    smooth.x = lerp(smooth.x, targetX, 0.2);
    smooth.y = lerp(smooth.y, targetY, 0.2);
    smooth.scale = lerp(smooth.scale, scaleTarget, 0.15);
    smooth.rot = lerp(smooth.rot, angle, 0.15);

    // Draw character centered at smooth.x/smooth.y with rotation and scale
    const imgW = character.width * smooth.scale;
    const imgH = character.height * smooth.scale;

    ctx.save();

    // Optional: mirror so character faces camera (uncomment if you prefer mirror)
    // ctx.translate(cw/2, 0); ctx.scale(-1,1); ctx.translate(-cw/2,0);

    ctx.translate(smooth.x, smooth.y);
    ctx.rotate(smooth.rot);
    ctx.drawImage(character, -imgW/2, -imgH/2, imgW, imgH);
    ctx.restore();
}
