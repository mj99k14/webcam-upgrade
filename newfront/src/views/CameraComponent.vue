<template>
  <div style="display: flex; flex-direction: column; align-items: center;">
    <div style="position: relative;">
      <video ref="video" autoplay muted playsinline></video>
      <canvas ref="canvas"></canvas>
    </div>

    <p>{{ cameraStatus }}</p>

    <button @click="startMeasurement" :disabled="isCapturing">📸 7초 측정 시작</button>
  </div>
</template>

<script>
export default {
  name: 'CameraComponent',
  data() {
    return {
      neckAngle: null,
      shoulderAngle: null,
      isCapturing: false,
      capturedFrames: [],
      cameraStatus: '⏳ 카메라 초기화 중...'
    };
  },
  mounted() {
    const video = this.$refs.video;
    const canvas = this.$refs.canvas;

    let scriptsLoaded = 0;
    const checkAllScriptsLoaded = () => {
      scriptsLoaded++;
      if (scriptsLoaded < 3) return;

      const pose = new window.Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}`
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      pose.onResults((results) => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
      });

      const camera = new window.Camera(video, {
        onFrame: async () => {
          await pose.send({ image: video });
        },
        width: 640,
        height: 480
      });

      try {
        camera.start();
        this.cameraStatus = "✅ 카메라 연결 성공!";
        console.log("✅ camera.start() 성공");
      } catch (e) {
        this.cameraStatus = "❌ 카메라 시작 실패!";
        console.error("❌ camera.start() 에러", e);
      }
    };

    // 스크립트 로드
    const scriptPose = document.createElement('script');
    const scriptDrawing = document.createElement('script');
    const scriptCamera = document.createElement('script');

    scriptPose.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/pose.js';
    scriptDrawing.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js';
    scriptCamera.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';

    scriptPose.onload = checkAllScriptsLoaded;
    scriptDrawing.onload = checkAllScriptsLoaded;
    scriptCamera.onload = checkAllScriptsLoaded;

    document.head.appendChild(scriptPose);
    document.head.appendChild(scriptDrawing);
    document.head.appendChild(scriptCamera);
  },

  methods: {
    startMeasurement() {
      const canvas = this.$refs.canvas;
      this.capturedFrames = [];
      this.isCapturing = true;

      const interval = setInterval(() => {
        const frameCanvas = document.createElement('canvas');
        frameCanvas.width = canvas.width;
        frameCanvas.height = canvas.height;
        const ctx = frameCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, 0);
        const dataUrl = frameCanvas.toDataURL("image/jpeg");
        this.capturedFrames.push(dataUrl);
      }, 500);

      setTimeout(() => {
        clearInterval(interval);
        this.isCapturing = false;
        this.$emit('measurementFinished', this.capturedFrames);
      }, 7000);
    }
  }
};
</script>

<style scoped>
video {
  width: 640px;
  height: 480px;
  display: block;
  border: 1px solid #ddd;
  background: black;
}
canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 640px;
  height: 480px;
  pointer-events: none;
}
</style>
