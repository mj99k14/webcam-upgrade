<template>
  <div class="main">
    <!-- ✅ 항상 맨 위에 결과 사진 표시 -->
    <div v-if="worstFrameUrl" class="result-photo">
      <img :src="worstFrameUrl" alt="거북목 사진" />
    </div>

    <!-- 제목과 측정 버튼 -->
    <h2>자세 측정</h2>
    <button @click="toggleMeasurement">
      {{ isCapturing ? '📴 측정 종료' : '📸 측정 시작' }}
    </button>

    <!-- 실시간 영상 + 캔버스 + 시간 -->
    <div v-if="showMeasurementArea" class="measurement-area">
      <div class="video-canvas">
        <video ref="video" autoplay muted playsinline></video>
        <canvas ref="canvas"></canvas>
      </div>
      <p>⏱ 측정 시간: {{ formattedTime }}</p>
    </div>

    <!-- 결과 정보 -->
    <div v-if="measurementFinished" class="result-info">
      <p>✏️ 평균 목 각도: {{ averageNeck.toFixed(2) }}°</p>
      <p>📏 최대 목 각도: {{ maxNeck.toFixed(2) }}°</p>
      <p>📸 거북목일 때 사진 저장 완료</p>
      <button @click="restartMeasurement">다시 측정하기</button>
    </div>
  </div>
</template>

<script>
import { nextTick } from "vue";

let pose = null;
let camera = null;

export default {
  data() {
    return {
      isCapturing: false,
      showMeasurementArea: false,
      measurementFinished: false,
      neckAngles: [],
      capturedFrames: [],
      averageNeck: 0,
      maxNeck: 0,
      worstFrameUrl: '',
      elapsedSeconds: 0,
      timerInterval: null
    };
  },
  computed: {
    formattedTime() {
      const minutes = Math.floor(this.elapsedSeconds / 60);
      const seconds = this.elapsedSeconds % 60;
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
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
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}`
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      pose.onResults((results) => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

        if (results.poseLandmarks) {
          const ear = results.poseLandmarks[7];        // LEFT_EAR
          const shoulder = results.poseLandmarks[11];  // LEFT_SHOULDER

          ctx.beginPath();
          ctx.strokeStyle = "deepskyblue";
          ctx.lineWidth = 4;
          ctx.moveTo(ear.x * canvas.width, ear.y * canvas.height);
          ctx.lineTo(shoulder.x * canvas.width, shoulder.y * canvas.height);
          ctx.stroke();

          const dx = (ear.x - shoulder.x) * canvas.width;
          const dy = (ear.y - shoulder.y) * canvas.height;
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          const neckAngle = Math.abs(angle);
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
      this.isCapturing = true;
    },

    async stopCamera() {
      clearInterval(this.timerInterval);
      this.timerInterval = null;

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
          max_neck_angle: max,
          duration: this.elapsedSeconds
        })
      });

      const worst = this.capturedFrames.reduce((max, frame) => frame.angle > max.angle ? frame : max, this.capturedFrames[0]);
      await this.uploadToServer(worst.dataUrl);
      this.worstFrameUrl = worst.dataUrl;
      this.isCapturing = false;
      this.measurementFinished = true;
    },

    async uploadToServer(dataUrl) {
      try {
        // ✅ Base64 → Blob 변환
        const byteString = atob(dataUrl.split(',')[1]);
        const mime = dataUrl.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mime });

        // ✅ FormData 구성
        const formData = new FormData();
        const user = JSON.parse(localStorage.getItem('user'));
        formData.append('user_id', user?.user_id);
        formData.append('photo', blob, 'turtle_neck.jpg');
        formData.append('neck_angle', this.averageNeck.toFixed(2));
        formData.append('shoulder_angle', 0); // shoulder_angle 없으면 0으로 대체

        // ✅ 업로드 요청
        const res = await fetch('http://210.101.236.158:5000/api/photos/upload', {
          method: 'POST',
          body: formData, // 🔥 Content-Type 생략해야 boundary 자동 생성됨
        });

        const data = await res.json();
        if (!data.success) {
          alert('업로드 실패: ' + data.message);
        } else {
          console.log("✅ 업로드 성공:", data.photo_url);
          this.$emit("handlePhotoUploaded");//  사진 업로드 후 컴포넌트에 알림 보내기
        }
      } catch (err) {
        console.error("❌ 업로드 실패", err);
        alert("사진 업로드 중 오류 발생");
      }
    },


    restartMeasurement() {
      this.measurementFinished = false;
      this.showMeasurementArea = false;
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
video, canvas {
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
</style>
