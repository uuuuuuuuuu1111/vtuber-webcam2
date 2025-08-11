const video = document.getElementById('video');
const canvas = document.getElementById('output');
const ctx = canvas.getContext('2d');

let bgOn = true;
let vtuberImg = new Image();
vtuberImg.src = './assets/character.png';

let bgImg = new Image();
bgImg.src = './assets/bg.png';

navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
    video.srcObject = stream;
});

function toggleBackground() {
    bgOn = !bgOn;
}

const pose = new Pose({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
}});
pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});
pose.onResults(onResults);

const camera = new Camera(video, {
    onFrame: async () => {
        await pose.send({image: video});
    },
    width: 640,
    height: 480
});
camera.start();

function onResults(results) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (bgOn) {
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(vtuberImg, 200, 100, 240, 360);
}