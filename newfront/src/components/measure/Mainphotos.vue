<template>
    <div class="main-wrapper">
    <!-- ✅ 결과 사진 -->
      <div class="result-photo-group-row" v-if="measurementFinished && (bestFrameUrl || worstFrameUrl)">
        <div v-if="bestFrameUrl" class="photo-block" @click="openModal(bestFrameUrl)">
          <p>✅ 가장 좋은 자세 ({{ bestNeckAngle }}°)</p>
          <img :src="bestFrameUrl" alt="좋은 자세" />
        </div>
        <div v-if="worstFrameUrl" class="photo-block" @click="openModal(worstFrameUrl)">
          <p>⚠️ 가장 나쁜 자세 ({{ worstNeckAngle }}°)</p>
          <img :src="worstFrameUrl" alt="나쁜 자세" />
        </div>
      </div>

    <!-- ✅ 확대 모달 -->
    <PhotoModal v-if="modalUrl" :photoUrl="modalUrl" @close="modalUrl = null" />

    <div class="section-header">
      <h2 class="section-title"><span class="emoji">📊</span> 자세 피드백</h2>
    </div>
    <TodayFeedback v-if="user && user.user_id && !measurementFinished" :userId="user.user_id" />
    
    <div class="feedback-box" style="margin-bottom: 50px;"></div>

    <!-- ✅ 측정 시작 영역 -->
    <div class="section-wrapper">
    <div class="title-group">
      <h2>거북목 측정</h2>
      <p class="camera-guide">📌 정확한 측정을 위해 카메라는 반드시 사용자의 왼쪽에 설치해주세요.</p>

      <div class="button-group" v-if="isCapturing && !measurementFinished">
        <button class="stop-btn" @click="stopCamera">📴 측정 중지</button>
        <button class="complete-btn" @click="finishMeasurement">✅ 측정 완료</button>
      </div>
      <button v-else @click="toggleMeasurement" class="start-btn">📸 측정 시작</button>
    </div>

  <!-- ✅ 카메라 및 타이머 영역 -->
  <div v-show="showMeasurementArea && !measurementFinished" class="measurement-area">
    <div class="video-canvas">
      <video ref="video" autoplay muted playsinline></video>
      <canvas ref="canvas"></canvas>
    </div>
    <p class="timer-text">⏱ 측정 시간: {{ formattedTime }}</p>
  </div>

  <!-- ✅ 측정 결과 요약 -->
  <div v-if="measurementFinished" class="result-info">
    <div class="stat-item">
      <span class="label">📏 평균 목 각도:</span>
      <span class="value blue">{{ averageNeck.toFixed(2) }}°</span>
    </div>
    <div class="stat-item">
      <span class="label">🖐️ 최대 목 각도:</span>
      <span class="value blue">{{ maxNeck.toFixed(2) }}°</span>
    </div>
    <div class="stat-item">
      <span class="label">↕️ 어깨 상태:</span>
      <span class="value blue">{{ shoulderStatus }} ({{ shoulderDiff }}px)</span>
    </div>
    <div class="message">
      ✅ 측정 결과가 저장되었습니다.
    </div>
    <div class="button-center">
      <button class="restart-btn" @click="restartMeasurement">🔁 다시 측정하기</button>
    </div>
  </div>
</div>

    </div>


</template>
<script>
import PhotoModal from '../photo/PhotoModal.vue';
import TodayFeedback from '../feedback/TodayFeedback.vue';

import { nextTick } from 'vue';

let pose = null;
let camera = null;

export default {
  name: 'MainPhotos',

components: {
  PhotoModal,
  TodayFeedback,
},

props: {
  cameraActive: {
    type: Boolean,
    default: false,
  },
  bestPhoto: {
    type: Object,
    default: () => null,
  },
  worstPhoto: {
    type: Object,
    default: () => null,
  },
},

emits: [
  'startCamera',
  'handlePhotoUploaded',
  'openModal',
],
  data() {
    return {
      user: JSON.parse(localStorage.getItem("user")),
      isCapturing: false,
      showMeasurementArea: false,
      measurementFinished: false,
      neckAngles: [],
      capturedFrames: [],
      averageNeck: 0,
      maxNeck: 0,
      bestFrameUrl: '',
      worstFrameUrl: '',
      bestNeckAngle: 0,
      worstNeckAngle: 0,
      elapsedSeconds: 0,
      timerInterval: null,
      frameCounter: 0,
      frameInterval: 5,
      bestPhotoId: null,
      worstPhotoId: null,
      modalUrl: null,
      shoulderStatus: '',
      shoulderDiff: 0,
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
    async startCamera() {
      this.resetMeasurementState();
      this.measurementFinished = false;
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

          const left = results.poseLandmarks[11];
          const right = results.poseLandmarks[12];
          if (left && right) {
            const diff = (left.y - right.y) * canvas.height;
            this.shoulderDiff = Math.abs(diff).toFixed(2);
            this.shoulderStatus = Math.abs(diff) < 10 ? '어깨 수평 (정상)' : diff > 0 ? '왼쪽 어깨가 높음' : '오른쪽 어깨가 높음';

            ctx.beginPath();
            ctx.strokeStyle = 'orange';
            ctx.lineWidth = 3;
            ctx.moveTo(left.x * canvas.width, left.y * canvas.height);
            ctx.lineTo(right.x * canvas.width, right.y * canvas.height);
            ctx.stroke();
          }

          ctx.fillStyle = neckAngle > 135 ? 'red' : 'green';        
          ctx.font = '20px Arial';
          ctx.fillText(`🐢 ${neckAngle.toFixed(1)}°`, 10, 35);
          
          ctx.fillStyle = 'black';
          ctx.font = '20px Arial';
          ctx.fillText(`🤷 ${this.shoulderStatus}`, 10, 65);

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

      // 📛 데이터 없음 방어 처리
      if (this.neckAngles.length === 0 || this.capturedFrames.length === 0) {
        alert("저장할 사진이 없습니다.");
        this.resetMeasurementState();
        return;
      }

      // 📏 평균/최대 목 각도 계산
      const avg = this.neckAngles.reduce((a, b) => a + b, 0) / this.neckAngles.length;
      const max = Math.max(...this.neckAngles);
      this.averageNeck = avg;
      this.maxNeck = max;

      // 👤 사용자 정보 확인
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.user_id;
      if (!userId) return alert("사용자 정보 없음");

      // 📸 가장 좋은/나쁜 프레임 구하기
      const worst = this.capturedFrames.reduce((max, f) => (f.angle > max.angle ? f : max), this.capturedFrames[0]);
      const best = this.capturedFrames.reduce((min, f) => (f.angle < min.angle ? f : min), this.capturedFrames[0]);
      this.bestNeckAngle = best.angle.toFixed(1);
      this.worstNeckAngle = worst.angle.toFixed(1);

      // ☁️ 사진 서버 업로드
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

      // 🕒 measured_at: 한국 시간으로 문자열 전송 (YYYY-MM-DDTHH:mm:ss)
      const now = new Date();
      const koreaTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
      const measuredAt = koreaTime.toLocaleString('sv-SE').replace(' ', 'T'); // 예: 2025-04-10T09:45:23

      // 📝 서버에 측정 결과 저장
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
            shoulder_status: this.shoulderStatus,
            shoulder_diff: parseFloat(this.shoulderDiff),
            measured_at: measuredAt, // ✅ 최종 날짜 문자열 전달
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
        formData.append('shoulder_status', this.shoulderStatus || '');
        formData.append('shoulder_diff', this.shoulderDiff || 0);

        const res = await fetch('http://210.101.236.158:5000/api/photos/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();

        console.log(`[📷 ${type} 업로드 응답]:`, data); // ✅ 추가된 디버깅 로그

        if (data.success) {
          this.$emit('handlePhotoUploaded');
          return {
            id: data.photo_id || null,
            url: `http://210.101.236.158:5000${data.photo_url}`,
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

.main {
  flex: 1;
  padding: 24px;
  text-align: center;
  font-family: 'Segoe UI', sans-serif;
}

/* 📷 비디오 + 캔버스 */
.video-canvas {
  position: relative;
  width: 100%;
  max-width: 640px;
  height: 480px;
  margin: 0 auto 24px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  background-color: #000;
  aspect-ratio: 4 / 3;
}

video,
canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* 🧾 제목 */
.title-group {
  margin-bottom: 24px;
  text-align: center;
}

.camera-guide {
  margin: 10px 0;
  color: #555;
  font-size: 15px;
}

/* ⏱ 측정 시간 텍스트 */
.timer-text {
  font-size: 24px;
  font-weight: bold;
  margin-top: 16px;
  color: #1565c0;
  text-align: center;
}

/* 🔘 버튼 공통 */
button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: bold;
  font-size: 16px;
  padding: 12px 24px;
  border-radius: 10px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  margin: 20px 0;
}

.button-center {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

/* ✅ 버튼 스타일 */
.start-btn {
  background-color: #1976d2;
  color: white;
  border-color: #0d47a1;
}
.start-btn:hover {
  background-color: #1565c0;
  transform: scale(1.03);
}

.stop-btn {
  background-color: #e53935;
  color: white;
  border-color: #b71c1c;
}
.stop-btn:hover {
  background-color: #c62828;
  transform: scale(1.03);
}

.complete-btn {
  background-color: #43a047;
  color: white;
  border-color: #2e7d32;
}
.complete-btn:hover {
  background-color: #2e7d32;
  transform: scale(1.03);
}

.restart-btn {
  background-color: #43a047;
  color: white;
  border-color: #2e7d32;
  padding: 14px 36px;
  min-width: 200px;
}
.restart-btn:hover {
  background-color: #2e7d32;
  transform: scale(1.03);
}

/* 🧠 측정 결과 요약 */
.result-info {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  max-width: 640px; /* 위 박스랑 똑같이 */
  margin: 20px auto; /* 가운데 정렬 */
  font-family: 'Segoe UI', sans-serif;
  border: 1px solid #dfefff;
  text-align: center; /* 텍스트 중앙 정렬 */
}

.result-info h3 {
  font-size: 20px;
  margin-bottom: 16px;
  color: #333;
  border-bottom: 1px solid #ddd;
  padding-bottom: 8px;
}

.stat-item {
  margin-bottom: 12px;
  font-size: 15px;
  display: block;
}
.label {
  font-weight: bold;
  color: #333;
  display: inline-block;
  margin-right: 8px;
}
.value {
  font-size: 15px;
  font-weight: 600;
}
.value.blue {
  color: #1565c0;
}


/* ✅ 저장 메시지 */
.message-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.message {
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 16px 24px;           /* ✅ 상하 16px, 좌우 24px 여백 */
  font-weight: bold;
  font-size: 16px;
  border-radius: 10px;
  border: 1px dashed #81c784;
  box-shadow: inset 0 0 0 1px rgba(76, 175, 80, 0.1);
  text-align: center;
  width: 100%;
  max-width: 550px;             /* ✅ 전체 폭 제한 */
  margin: 20px auto 0;          /* ✅ 위는 20px, 좌우는 auto로 가운데 정렬 */
}
/* 🖼️ 결과 사진 */
.result-photo-group-row {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-wrap: nowrap;
  gap: 40px;
  overflow-x: auto;
  padding-bottom: 10px;
  margin-top: 20px;
}

.photo-block {
  width: 260px;
  flex-shrink: 0;
  text-align: center;
}

.photo-block img {
  width: 100%;
  border-radius: 14px;
  border: 3px solid #ccc;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.main-wrapper {
  background-color: white;
  border-radius: 16px;
  padding: 24px;
  width: 90%;         /* ✅ 가로 너비를 전체로 */
  max-width: none;     /* ✅ 최대 너비 제한 없애기 */
  margin: 0;           /* ✅ 가운데 정렬 제거 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.card-inner.main {
  max-width: 720px; /* ✅ 오른쪽 card-inner와 똑같이 */
  margin: 0 auto; 
  width: 100%;  
}

.measurement-box {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  max-width: 480px;
  margin: 20px auto;
  font-family: 'Segoe UI', sans-serif;
  border: 1px solid #dfefff;
  text-align: center;
}

</style>


