<template>
  <div>
    <div class="main-measure-wrapper">
    <!-- ✅ 제목 -->
    <div class="section-title-wrapper">
      <h2 class="section-title"><span class="emoji">📊</span> 자세 측정</h2>
    </div>

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


    <PhotoModal v-if="modalUrl" :photoUrl="modalUrl" @close="modalUrl = null" />
    <p class="mini-section-title">📷 거북목 & 어깨 측정</p>
    <!-- ✅ 측정 타이틀 -->
    <p class="camera-guide">📌정확한 측정을 위해 카메라는 반드시 사용자의 왼쪽에 설치해주세요.</p>

    <!-- ✅ 버튼 -->
    <div class="button-group" v-if="isCapturing && !measurementFinished">
      <button class="stop-btn" @click="stopCamera">📴 측정 중지</button>
      <button class="complete-btn" @click="finishMeasurement">✅ 측정 완료</button>
    </div>
    <div class="button-center" v-else>
      <button class="start-btn" @click="toggleMeasurement">📸 측정 시작</button>
    </div>

    <!-- ✅ 측정 중 비디오 영역 -->
    <div v-show="showMeasurementArea && !measurementFinished" class="measurement-area">
      <div class="video-canvas">
        <video ref="video" autoplay muted playsinline></video>
        <canvas ref="canvas"></canvas>
      </div>
      <p class="timer-text">⏱ 측정 시간: {{ formattedTime }}</p>
    </div>

    <!-- ✅ 측정 결과 -->
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
      <div class="message">✅ 측정 결과가 저장되었습니다.</div>
      <div class="button-center">
        <button class="restart-btn" @click="restartMeasurement">🔁 다시 측정하기</button>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
import PhotoModal from '../photo/PhotoModal.vue';
import { nextTick } from 'vue';

let pose = null;
let camera = null;

export default {
name: 'MainPhotos',
components: {
PhotoModal,
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
    bestPhotoLocal: this.bestPhoto,
    worstPhotoLocal: this.worstPhoto
  };
},
computed: {
  formattedTime() {
    const min = String(Math.floor(this.elapsedSeconds / 60)).padStart(2, '0');
    const sec = String(this.elapsedSeconds % 60).padStart(2, '0');
    return `${min}:${sec}`;
  },
  hasBestPhoto() {
    return this.bestPhoto !== null;
  },
  hasWorstPhoto() {
    return this.worstPhoto !== null;
  }
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
    if (this.neckAngles.length === 0) {
    alert("측정된 데이터가 없습니다. 목 움직임이 감지되지 않았습니다.");
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
          best_photo_url: bestResult?.url || null,
          worst_photo_url: worstResult?.url || null,
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

    console.log(`[📷 ${type} 업로드 응답]:`, data);         // 원래 있던 로그
    console.log(`[📷 ${type}] 받은 photo_id:`, data.photo_id); // 🔥 꼭 확인할 로그

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

  // ✅ 여기에 추가!
  this.$watch('bestPhoto', (newVal) => {
  this.bestPhotoLocal = newVal;
  if (!newVal) {
    console.log("❌ bestPhoto 없음 → bestFrameUrl 초기화");
    this.bestFrameUrl = '';
  }
  if (!newVal && !this.worstPhoto) {
    console.log("🔥 모든 측정 사진 삭제됨 → measurementFinished 초기화");
    this.measurementFinished = false;
  }
});

this.$watch('worstPhoto', (newVal) => {
  this.worstPhotoLocal = newVal;
  if (!newVal) {
    console.log("❌ worstPhoto 없음 → worstFrameUrl 초기화");
    this.worstFrameUrl = '';
  }
  if (!newVal && !this.bestPhoto) {
    console.log("🔥 모든 측정 사진 삭제됨 → measurementFinished 초기화");
    this.measurementFinished = false;
  }
});



},

};
</script>
<style scoped>
/* ✅ 공통 제목 스타일 */
.section-title-wrapper {
  display: flex;
  justify-content: center;
  margin: 0 0 12px; /* 위 여백 완전 제거 + 아래도 살짝 줄임 */
}

.section-title {
  font-size: 30px;         /* ✅ 크게! */
  font-weight: 800;
  color: #1976d2;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border-bottom: 3px solid #42a5f5;
  padding-bottom: 4px;
}

.section-title .emoji {
  font-size: 24px;
  margin-bottom: 2px;
}

/* ✅ 안내 문구 */
.camera-guide {
  display: block;
  margin: 16px auto 24px;  /* 🔹 중앙 배치 */
  padding: 14px 20px;
  max-width: 600px;
  text-align: center;      /* 🔹 텍스트 중앙 정렬 */
  font-size: 17px;
  font-weight: 500;
  color: #444;
  background-color: #f0f8ff;
  border: 1px solid #cce4ff;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

/* ✅ 버튼 공통 스타일 */
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

.start-btn {
  background-color: #1976d2;
  color: white;
}
.start-btn:hover {
  background-color: #1565c0;
  transform: scale(1.03);
}

.stop-btn {
  background-color: #e53935;
  color: white;
}
.stop-btn:hover {
  background-color: #c62828;
  transform: scale(1.03);
}

.complete-btn,
.restart-btn {
  background-color: #43a047;
  color: white;
}
.complete-btn:hover,
.restart-btn:hover {
  background-color: #2e7d32;
  transform: scale(1.03);
}

.restart-btn {
  padding: 14px 36px;
  min-width: 200px;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 20px 0;
}

.button-center {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* ✅ 비디오 캔버스 */
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

/* ✅ 측정 시간 */
.timer-text {
  font-size: 24px;
  font-weight: bold;
  color: #1565c0;
  text-align: center;
}

/* ✅ 결과 요약 */
.result-info {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 24px;
  margin: 20px auto;
  border: 1px solid #dfefff;
  text-align: center;

  max-width: none;     /* ✅ 제한 없애기 */
  width: 100%;         /* ✅ 전체 너비 사용 */
  box-sizing: border-box;
}

.stat-item {
  margin-bottom: 12px;
  font-size: 15px;
}
.label {
  font-weight: bold;
  margin-right: 8px;
  color: #333;
}
.value {
  font-weight: 600;
}
.value.blue {
  color: #1565c0;
}

/* ✅ 결과 메시지 */
.message {
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 16px 24px;
  font-weight: bold;
  font-size: 16px;
  border-radius: 10px;
  border: 1px dashed #81c784;
  box-shadow: inset 0 0 0 1px rgba(76, 175, 80, 0.1);
  max-width: 550px;
  margin: 20px auto 0;
}

/* ✅ 결과 사진 */
.result-photo-group-row {
  display: flex;
  justify-content: center;
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
/* ✅ 자세 측정 박스 */
.main-measure-wrapper {
  background-color: #ffffff;
  border-radius: 24px;
  padding: 32px; /* ✅ 기존 48px → 32px으로 줄임 */
  min-height: 900px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
  box-sizing: border-box;
  width: 100%;
  margin-top: -17px; /* ✅ 전체 박스를 살짝 위로 당김 */
  max-width: none;
}

.mini-section-title {
  font-size: 22px;
  font-weight: 600;
  color: #333;
  margin: 20px 0 12px;

  display: flex;
  justify-content: center; /* ✅ 중앙 정렬 */
  align-items: center;
  gap: 6px;
  text-align: center;      /* ✅ 텍스트도 중앙 */
}


</style>