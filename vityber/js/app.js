const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('output');
const ctx = canvasElement.getContext('2d');

const character = new Image();
character.src = 'assets/character.png';

canvasElement.width = window.innerWidth;
canvasElement.height = window.innerHeight;

// Настройка MediaPipe Holistic
const holistic = new Holistic.Holistic({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
    }
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

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await holistic.send({ image: videoElement });
    },
    width: 640,
    height: 480
});
camera.start();

function onResults(results) {
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    let x = canvasElement.width / 2;
    let y = canvasElement.height / 2;
    let scale = 1;

    if (results.poseLandmarks) {
        const nose = results.poseLandmarks[0]; // точка носа
        x = nose.x * canvasElement.width;
        y = nose.y * canvasElement.height;
        scale = 1 + (results.poseLandmarks[11].y - results.poseLandmarks[12].y) * 2; // простая реакция на позу плеч
    }

    const imgWidth = character.width * scale;
    const imgHeight = character.height * scale;
    ctx.drawImage(character, x - imgWidth / 2, y - imgHeight / 2, imgWidth, imgHeight);
}
