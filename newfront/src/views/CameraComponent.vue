<template>
  <div style="display: flex; flex-direction: column; align-items: center;">
    <div style="position: relative;">
      <video ref="video" autoplay muted playsinline></video>
      <canvas ref="canvas"></canvas>
    </div>

    <p>{{ cameraStatus }}</p>
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
    this.loadScripts().then(() => {
      this.initializeCamera();
    });
  },
  methods: {
    loadScripts() {
      const load = src => new Promise(resolve => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        document.head.appendChild(script);
      });

      return Promise.all([
        load('https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/pose.js'),
        load('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js'),
        load('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js')
      ]);
    },

    initializeCamera() {
      const video = this.$refs.video;
      const canvas = this.$refs.canvas;

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
    },

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
