<template>
  <div class="main">
    <!-- 결과 사진 -->
    <div class="result-photo-group" v-if="measurementFinished && (bestFrameUrl || worstFrameUrl)">
      <div v-if="bestFrameUrl" class="photo-block" @click="openModal(bestFrameUrl)">
        <p>✅ 가장 좋은 자세</p>
        <img :src="bestFrameUrl" alt="좋은 자세" />
      </div>
      <div v-if="worstFrameUrl" class="photo-block" @click="openModal(worstFrameUrl)">
        <p>⚠️ 가장 나쁜 자세</p>
        <img :src="worstFrameUrl" alt="나쁜 자세" />
      </div>
    </div>

    <PhotoModal v-if="modalUrl" :photoUrl="modalUrl" @close="modalUrl = null" />

    <div class="title-group">
      <h2>거북목 측정</h2>
      <p class="camera-guide">📌 정확한 측정을 위해 카메라는 반드시 사용자의 왼쪽에 설치해주세요.</p>
      <div class="button-group" v-if="isCapturing && !measurementFinished">
        <button class="stop-btn" @click="stopCamera">📴 측정 중지</button>
        <button class="complete-btn" @click="finishMeasurement">✅ 측정 완료</button>
      </div>
      <button v-else @click="toggleMeasurement" class="start-btn">📸 측정 시작</button>
    </div>

    <div v-show="showMeasurementArea && !measurementFinished" class="measurement-area">
      <div class="video-canvas">
        <video ref="video" autoplay muted playsinline></video>
        <canvas ref="canvas"></canvas>
      </div>
      <p class="timer-text">⏱ 측정 시간: {{ formattedTime }}</p>
    </div>

    <div v-if="measurementFinished" class="result-info">
      <div class="stat-item">
        <span class="label">🖍️ 평균 목 각도:</span>
        <span class="value">{{ averageNeck.toFixed(2) }}°</span>
      </div>
      <div class="stat-item">
        <span class="label">📏 최대 목 각도:</span>
        <span class="value">{{ maxNeck.toFixed(2) }}°</span>
      </div>
      <div class="stat-item message">
        ✅ 측정 결과가 저장되었습니다.
      </div>
      <button @click="restartMeasurement" class="restart-btn">🔁 다시 측정하기</button>
    </div>
  </div>
</template>

<script>
import PhotoModal from './PhotoModal.vue';
import { nextTick } from 'vue';

let pose = null;
let camera = null;

export default {
  components: { PhotoModal },
  emits: ['handlePhotoUploaded'],
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
      worstPhotoId: null,
      modalUrl: null,
    };
  },
  computed: {
    formattedTime() {
      const min = String(Math.floor(this.elapsedSeconds / 60)).padStart(2, '0');
      const sec = String(this.elapsedSeconds % 60).padStart(2, '0');
      return `${min}:${sec}`;
    },
  },
  methods: {
    toggleMeasurement() {
      alert("⚠️ 카메라는 반드시 사용자의 왼쪽에 설치해주세요!");
      this.startCamera();
    },
    openModal(url) {
      this.modalUrl = url;
    },
    stopCamera() {
      if (confirm("측정을 그만하시겠습니까?")) {
        clearInterval(this.timerInterval);
        camera?.stop?.();
        pose?.close?.();
        this.resetMeasurementState();
      }
    },
    async finishMeasurement() {
      clearInterval(this.timerInterval);
      camera?.stop?.();
      pose?.close?.();

      if (this.neckAngles.length === 0 || this.capturedFrames.length === 0) {
        alert("저장할 사진이 없습니다.");
        this.resetMeasurementState();
        return;
      }

      const avg = this.neckAngles.reduce((a, b) => a + b, 0) / this.neckAngles.length;
      const max = Math.max(...this.neckAngles);
      this.averageNeck = avg;
      this.maxNeck = max;

      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.user_id;
      if (!userId) return alert("사용자 정보 없음");

      const worst = this.capturedFrames.reduce((max, f) => (f.angle > max.angle ? f : max), this.capturedFrames[0]);
      const best = this.capturedFrames.reduce((min, f) => (f.angle < min.angle ? f : min), this.capturedFrames[0]);

      let bestResult = null;
      let worstResult = null;

      if (best.dataUrl === worst.dataUrl) {
        if (max > 135) {
          worstResult = await this.uploadToServer(worst.dataUrl, "worst", worst.angle);
          this.bestFrameUrl = '';
          this.worstFrameUrl = worstResult?.url || '';
          this.bestPhotoId = null;
          this.worstPhotoId = worstResult?.id || null;
        } else {
          bestResult = await this.uploadToServer(best.dataUrl, "best", best.angle);
          this.bestFrameUrl = bestResult?.url || '';
          this.worstFrameUrl = '';
          this.bestPhotoId = bestResult?.id || null;
          this.worstPhotoId = null;
        }
      } else {
        worstResult = await this.uploadToServer(worst.dataUrl, "worst", worst.angle);
        bestResult = await this.uploadToServer(best.dataUrl, "best", best.angle);
        this.worstFrameUrl = worstResult?.url || '';
        this.bestFrameUrl = bestResult?.url || '';
        this.bestPhotoId = bestResult?.id || null;
        this.worstPhotoId = worstResult?.id || null;
      }

      try {
        await fetch("http://210.101.236.158:5000/api/posture/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            average_neck_angle: avg,
            max_neck_angle: max,
            duration: this.elapsedSeconds,
            best_photo_id: bestResult?.id || null,
            worst_photo_id: worstResult?.id || null,
            feedback: max > 135 ? "거북목 의심" : "정상",
          }),
        });
      } catch (err) {
        console.error("측정 결과 저장 실패:", err);
        alert("📛 측정 결과를 서버에 저장하는 도중 오류가 발생했습니다.");
      }

      this.isCapturing = false;
      this.measurementFinished = true;
    },
    async uploadToServer(dataUrl, type, neckAngle) {
      try {
        const byteString = atob(dataUrl.split(',')[1]);
        const mime = dataUrl.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
        const blob = new Blob([ab], { type: mime });

        const formData = new FormData();
        const user = JSON.parse(localStorage.getItem('user'));
        formData.append('user_id', user?.user_id);
        formData.append('photo', blob, `${type}_photo.jpg`);
        formData.append('neck_angle', neckAngle.toFixed(2));
        formData.append('type', type);

        const res = await fetch('http://210.101.236.158:5000/api/photos/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (data.success) {
          this.$emit('handlePhotoUploaded');
          return {
            id: data.photo_id || null,
            url: `http://210.101.236.158:5000${data.photo_url}` // ✅ 절대 경로
          };
        } else {
          alert('업로드 실패: ' + data.message);
          return null;
        }
      } catch (err) {
        console.error(`[${type}] 업로드 오류`, err);
        alert('사진 업로드 중 오류 발생');
        return null;
      }
    },
    restartMeasurement() {
      this.resetMeasurementState();
      setTimeout(() => this.startCamera(), 100);
    },
    async startCamera() {
      this.resetMeasurementState();
      await nextTick();
      const video = this.$refs.video;
      const canvas = this.$refs.canvas;
      const ctx = canvas.getContext('2d');
      if (!video || !canvas || !ctx) return alert('비디오 또는 캔버스를 찾을 수 없습니다.');

      this.timerInterval = setInterval(() => this.elapsedSeconds++, 1000);

      pose = new window.Pose({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}` });
      pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });

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
          ctx.strokeStyle = 'deepskyblue';
          ctx.lineWidth = 4;
          ctx.moveTo(ear.x * canvas.width, ear.y * canvas.height);
          ctx.lineTo(shoulder.x * canvas.width, shoulder.y * canvas.height);
          ctx.stroke();

          ctx.fillStyle = neckAngle > 135 ? 'red' : 'green';
          ctx.font = '35px Arial';
          ctx.fillText(`🖐 ${neckAngle.toFixed(1)}°`, 10, 35);

          this.frameCounter++;
          if (this.frameCounter % this.frameInterval === 0) {
            const imageCanvas = document.createElement('canvas');
            imageCanvas.width = canvas.width;
            imageCanvas.height = canvas.height;
            imageCanvas.getContext('2d').drawImage(canvas, 0, 0);
            this.capturedFrames.push({ angle: neckAngle, dataUrl: imageCanvas.toDataURL('image/jpeg') });
          }
        }
      });

      camera = new window.Camera(video, {
        onFrame: async () => await pose.send({ image: video }),
        width: 640,
        height: 480,
      });

      camera.start();
      this.isCapturing = true;
      this.showMeasurementArea = true;
    },
    resetMeasurementState() {
      this.isCapturing = false;
      this.showMeasurementArea = false;
      this.measurementFinished = false;
      this.neckAngles = [];
      this.capturedFrames = [];
      this.elapsedSeconds = 0;
      this.frameCounter = 0;
      this.bestFrameUrl = '';
      this.worstFrameUrl = '';
    },
  },
  mounted() {
    const loadScript = (src) => new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      document.head.appendChild(script);
    });

    Promise.all([
      loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/pose.js'),
      loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js'),
      loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js'),
    ]);
  },
};
</script>


<style scoped>
/* 🌐 전체 영역 */
.main {
  padding: 20px;
  text-align: center;
}

/* 📸 결과 사진 그룹 */
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
  border-radius: 12px;
  border: 3px solid #ccc;
}

/* 📹 비디오 & 캔버스 영역 */
.video-canvas {
  position: relative;
  width: 640px;
  height: 480px;
  margin: 0 auto;
}
video, canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  object-fit: cover;
  z-index: 1;
}
canvas {
  z-index: 2;
  pointer-events: none;
}

/* ⏱ 측정 시간 */
.timer-text {
  font-size: 25px;
  text-align: center;
  margin-top: 10px;
}

/* 📋 측정 결과 블럭 */
.result-info {
  margin-top: 30px;
  background-color: #ffffff;
  padding: 30px 40px;
  border-radius: 15px;
  width: 400px;
  margin-left: auto;
  margin-right: auto;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  font-size: 22px;
  text-align: left;
}
.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.label {
  font-weight: 600;
  color: #333;
}
.value {
  color: #007BFF;
  font-weight: bold;
  font-size: 18px;
}
.message {
  text-align: center;
  color: #28a745;
  font-size: 17px;
  font-weight: 500;
  margin: 20px 0;
}

/* 🔁 다시 측정 버튼 */
.restart-btn {
  padding: 14px 24px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  width: 100%;
  font-size: 18px;
}
.restart-btn:hover {
  background-color: #388e3c;
}

/* 🧭 제목 및 안내 */
.title-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 20px;
}
.camera-guide {
  color: #e53935;
  font-weight: bold;
  font-size: 22px;
  text-align: center;
  margin-bottom: 12px;
}

/* 🧭 버튼들 (측정 시작/중지/완료) */
.button-group {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}
.start-btn,
.stop-btn,
.complete-btn {
  padding: 10px 16px;
  font-weight: bold;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  color: white;
}

/* 각 버튼 색상 */
.start-btn {
  background-color: #1976d2;
}
.start-btn:hover {
  background-color: #1565c0;
}
.stop-btn {
  background-color: #f44336;
}
.stop-btn:hover {
  background-color: #c62828;
}
.complete-btn {
  background-color: #4caf50;
}
.complete-btn:hover {
  background-color: #388e3c;
}

</style>