<template>
  <div class="main">
    <!-- 📸 결과 사진 출력 -->
    <div class="result-photo-group" v-if="worstFrameUrl || bestFrameUrl">
      <div v-if="bestFrameUrl" class="photo-block">
        <p>✅ 가장 좋은 자세</p>
        <img :src="bestFrameUrl" alt="좋은 자세" />
      </div>
      <div v-if="worstFrameUrl" class="photo-block">
        <p>⚠️ 가장 나쁜 자세</p>
        <img :src="worstFrameUrl" alt="거북목 자세" />
      </div>
    </div>

    <h2>자세 측정</h2>
    <button @click="toggleMeasurement">
      {{ isCapturing ? '📴 측정 종료' : '📸 측정 시작' }}
    </button>

    <!-- 🔴 실시간 측정 영상 -->
    <div v-show="showMeasurementArea && !measurementFinished" class="measurement-area">
      <div class="video-canvas">
        <video ref="video" autoplay muted playsinline></video>
        <canvas ref="canvas"></canvas>
      </div>
      <p>⏱ 측정 시간: {{ formattedTime }}</p>
    </div>

    <!-- 📊 측정 결과 -->
    <div v-if="measurementFinished" class="result-info">
      <p>✏️ 평균 목 각도: {{ averageNeck.toFixed(2) }}°</p>
      <p>📏 최대 목 각도: {{ maxNeck.toFixed(2) }}°</p>
      <p>📸 측정 결과 저장 완료</p>
      <button @click="restartMeasurement">다시 측정하기</button>
    </div>
  </div>
</template>

<script>
import { nextTick } from "vue";

let pose = null;
let camera = null;

export default {
  emits: ["handlePhotoUploaded"],
  data() {
    return {
      isCapturing: false,
      showMeasurementArea: false,
      measurementFinished: false,
      neckAngles: [],
      capturedFrames: [],
      averageNeck: 0,
      maxNeck: 0,
      bestFrameUrl: '',
      worstFrameUrl: '',
      elapsedSeconds: 0,
      timerInterval: null,
      frameCounter: 0,
      frameInterval: 5,
      bestPhotoId: null,
      worstPhotoId: null
    };
  },
  computed: {
    formattedTime() {
      const minutes = Math.floor(this.elapsedSeconds / 60);
      const seconds = this.elapsedSeconds % 60;
      return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    },
  },
  methods: {
    toggleMeasurement() {
      this.isCapturing ? this.stopCamera() : this.startCamera();
    },

    async startCamera() {
      this.neckAngles = [];
      this.capturedFrames = [];
      this.measurementFinished = false;
      this.showMeasurementArea = true;
      this.elapsedSeconds = 0;
      this.frameCounter = 0;

      await nextTick();

      const video = this.$refs.video;
      const canvas = this.$refs.canvas;
      const ctx = canvas.getContext("2d");

      if (!video || !canvas || !ctx) {
        alert("비디오 또는 캔버스를 찾을 수 없습니다.");
        return;
      }

      this.timerInterval = setInterval(() => this.elapsedSeconds++, 1000);

      pose = new window.Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}`,
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      pose.onResults((results) => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

        if (results.poseLandmarks) {
          const ear = results.poseLandmarks[7];
          const shoulder = results.poseLandmarks[11];

          const dx = (ear.x - shoulder.x) * canvas.width;
          const dy = (ear.y - shoulder.y) * canvas.height;
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          const neckAngle = Math.abs(angle);
          this.neckAngles.push(neckAngle);

          ctx.beginPath();
          ctx.strokeStyle = "deepskyblue";
          ctx.lineWidth = 4;
          ctx.moveTo(ear.x * canvas.width, ear.y * canvas.height);
          ctx.lineTo(shoulder.x * canvas.width, shoulder.y * canvas.height);
          ctx.stroke();

          ctx.fillStyle = neckAngle > 135 ? "red" : "green";
          ctx.font = "35px Arial";
          ctx.fillText(`📐 ${neckAngle.toFixed(1)}°`, 10, 35);

          this.frameCounter++;
          if (this.frameCounter % this.frameInterval === 0) {
            const imageCanvas = document.createElement("canvas");
            imageCanvas.width = canvas.width;
            imageCanvas.height = canvas.height;
            imageCanvas.getContext("2d").drawImage(canvas, 0, 0);
            this.capturedFrames.push({
              angle: neckAngle,
              dataUrl: imageCanvas.toDataURL("image/jpeg"),
            });
          }
        }
      });

      camera = new window.Camera(video, {
        onFrame: async () => {
          await pose.send({ image: video });
        },
        width: 640,
        height: 480,
      });

      camera.start();
      this.isCapturing = true;
    },

    async stopCamera() {
      clearInterval(this.timerInterval);
      this.timerInterval = null;

      if (camera?.stop) camera.stop();
      if (pose?.close) pose.close();

      const avg = this.neckAngles.reduce((a, b) => a + b, 0) / this.neckAngles.length;
      const max = Math.max(...this.neckAngles);
      this.averageNeck = avg;
      this.maxNeck = max;

      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.user_id;
      if (!userId) return alert("사용자 정보 없음");

      const worst = this.capturedFrames.reduce((max, f) => (f.angle > max.angle ? f : max), this.capturedFrames[0]);
      const best = this.capturedFrames.reduce((min, f) => (f.angle < min.angle ? f : min), this.capturedFrames[0]);

      const worstId = await this.uploadToServer(worst.dataUrl, "worst");
      const bestId = await this.uploadToServer(best.dataUrl, "best");

      this.worstFrameUrl = worst.dataUrl;
      this.bestFrameUrl = best.dataUrl;
      this.bestPhotoId = bestId;
      this.worstPhotoId = worstId;

      await fetch("http://210.101.236.158:5000/api/posture/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          average_neck_angle: avg,
          max_neck_angle: max,
          average_shoulder_angle: 0,
          max_shoulder_angle: 0,
          duration: this.elapsedSeconds,
          best_photo_id: bestId,
          worst_photo_id: worstId,
          feedback: max > 135 ? "거북목 의심" : "정상"
        })
      });

      this.isCapturing = false;
      this.measurementFinished = true;
    },

    async uploadToServer(dataUrl, type = "worst") {
      try {
        const byteString = atob(dataUrl.split(",")[1]);
        const mime = dataUrl.split(",")[0].split(":")[1].split(";")[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
        const blob = new Blob([ab], { type: mime });

        const formData = new FormData();
        const user = JSON.parse(localStorage.getItem("user"));
        formData.append("user_id", user?.user_id);
        formData.append("photo", blob, `${type}_photo.jpg`);
        formData.append("neck_angle", this.averageNeck.toFixed(2));
        formData.append("shoulder_angle", 0);
        formData.append("type", type);

        const res = await fetch("http://210.101.236.158:5000/api/photos/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (data.success) {
          this.$emit("handlePhotoUploaded");
          return data.photo_id || null;
        } else {
          alert("업로드 실패: " + data.message);
          return null;
        }
      } catch (err) {
        console.error(`❌ [${type}] 업로드 실패`, err);
        alert("사진 업로드 중 오류 발생");
        return null;
      }
    },

    restartMeasurement() {
      this.measurementFinished = false;
      this.showMeasurementArea = false;
    },
  },

  mounted() {
    const loadScript = (src) => {
      return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = resolve;
        document.head.appendChild(script);
      });
    };

    Promise.all([
      loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/pose.js"),
      loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js"),
      loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"),
    ]);
  },
};
</script>

<style scoped>
.main {
  padding: 20px;
  text-align: center;
}
.result-photo img {
  width: 640px;
  border: 3px solid skyblue;
  margin-bottom: 20px;
}
.video-canvas {
  position: relative;
  display: inline-block;
}
video,
canvas {
  width: 640px;
  height: 480px;
  border: 2px solid #ccc;
}
canvas {
  position: absolute;
  top: 0;
  left: 0;
}
.result-info {
  margin-top: 20px;
}
.result-photo-group {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}
.photo-block {
  text-align: center;
}
.photo-block img {
  width: 300px;
  border: 3px solid #ccc;
  border-radius: 12px;
}
.photo-block p {
  margin-bottom: 8px;
  font-weight: bold;
  font-size: 16px;
}
</style>
