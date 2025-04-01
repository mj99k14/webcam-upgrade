<template>
  <div class="center">
    <h2>자세 측정</h2>

    <div v-if="!measurementFinished">
      <video ref="video" autoplay muted playsinline></video>
      <canvas ref="canvas"></canvas>
      <button @click="toggleMeasurement">
        {{ isCapturing ? '📴 측정 종료' : '📸 측정 시작' }}
      </button>
      <p v-if="isCapturing">⏱ 측정 중: {{ measurementTime }}초</p>
    </div>

    <div v-else>
      <p>📝 평균 목 각도: {{ averageNeck.toFixed(2) }}°</p>
      <p>📏 최대 목 각도: {{ maxNeck.toFixed(2) }}°</p>
      <p>⏱ 총 측정 시간: {{ measurementTime }}초</p>
      <p>📸 거북목일 때 사진 저장 완료</p>
      <img v-if="worstFrameUrl" :src="worstFrameUrl" alt="거북목 사진" style="max-width: 100%; margin-top: 12px;" />
      <button @click="restartMeasurement">다시 측정하기</button>
    </div>
  </div>
</template>

<script>
let pose = null;
let camera = null;

export default {
  name: 'MainPhotos',
  data() {
    return {
      isCapturing: false,
      measurementFinished: false,
      neckAngles: [],
      capturedFrames: [],
      averageNeck: 0,
      maxNeck: 0,
      worstFrameUrl: '',
      measurementTime: 0,
      startTime: null,
    };
  },
  methods: {
    async toggleMeasurement() {
      if (this.isCapturing) {
        await this.stopCamera();
      } else {
        await this.startCamera();
      }
    },

    async startCamera() {
      const video = this.$refs.video;
      const canvas = this.$refs.canvas;
      const ctx = canvas.getContext("2d");

      this.isCapturing = true;
      this.measurementFinished = false;
      this.neckAngles = [];
      this.capturedFrames = [];
      this.startTime = Date.now();

      pose = new window.Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}`
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      pose.onResults((results) => {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        this.measurementTime = elapsed;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

        if (results.poseLandmarks) {
          // 💡 선 및 관절 표시
          window.drawConnectors(ctx, results.poseLandmarks, window.POSE_CONNECTIONS, {
            color: "#0077cc", lineWidth: 4
          });
          window.drawLandmarks(ctx, results.poseLandmarks, {
            color: "#00cc99", lineWidth: 2
          });

          const leftShoulder = results.poseLandmarks[11];
          const rightShoulder = results.poseLandmarks[12];
          const neckAngle = Math.abs(leftShoulder.y - rightShoulder.y) * 100;
          this.neckAngles.push(neckAngle);

          const imageCanvas = document.createElement('canvas');
          imageCanvas.width = canvas.width;
          imageCanvas.height = canvas.height;
          imageCanvas.getContext('2d').drawImage(canvas, 0, 0);
          this.capturedFrames.push({
            angle: neckAngle,
            dataUrl: imageCanvas.toDataURL('image/jpeg')
          });
        }
      });

      camera = new window.Camera(video, {
        onFrame: async () => {
          await pose.send({ image: video });
        },
        width: 640,
        height: 480
      });

      camera.start();
    },

    async stopCamera() {
      if (camera && camera.stop) camera.stop();
      if (pose && pose.close) pose.close();

      const avg = this.neckAngles.reduce((a, b) => a + b, 0) / this.neckAngles.length;
      const max = Math.max(...this.neckAngles);

      this.averageNeck = avg;
      this.maxNeck = max;

      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?.user_id;
      if (!userId) return alert("사용자 정보 없음");

      await fetch("http://210.101.236.158:5000/api/posture/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          average_neck_angle: avg,
          max_neck_angle: max
        })
      });

      const worst = this.capturedFrames.reduce((max, frame) => frame.angle > max.angle ? frame : max, this.capturedFrames[0]);
      await this.uploadToServer(worst.dataUrl);
      this.worstFrameUrl = worst.dataUrl;
      this.isCapturing = false;
      this.measurementFinished = true;
    },

    async uploadToServer(dataUrl) {
      const byteString = atob(dataUrl.split(',')[1]);
      const mime = dataUrl.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mime });

      const formData = new FormData();
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?.user_id;
      if (!userId) return alert("사용자 정보 없음");

      formData.append('user_id', userId);
      formData.append('photo', blob, 'turtle_neck.jpg');
      formData.append('neck_angle', this.averageNeck);

      try {
        const res = await fetch('http://210.101.236.158:5000/api/photos/turtleneck', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (!data.success) {
          alert('업로드 실패: ' + data.message);
        }
      } catch (err) {
        console.error("❌ 업로드 실패", err);
      }
    },

    restartMeasurement() {
      this.measurementFinished = false;
      this.measurementTime = 0;
    }
  },

  mounted() {
    const loadScript = (src) => {
      return new Promise(resolve => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        document.head.appendChild(script);
      });
    };

    Promise.all([
      loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/pose.js"),
      loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js"),
      loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js")
    ]);
  }
};
</script>

<style scoped>
.center {
  text-align: center;
  padding: 20px;
  background-color: #fff9e6;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
video {
  display: block;
  width: 640px;
  height: 480px;
  border: 1px solid #aaa;
  margin: 10px auto;
}
canvas {
  display: block;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 640px;
  height: 480px;
  pointer-events: none;
}
</style>
