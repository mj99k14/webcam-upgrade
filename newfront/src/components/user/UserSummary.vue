<template>
  <div class="user-summary-card">
    <h3 class="section-title">📝 오늘의 건강 리포트</h3>
    <div class="divider" />

    <div class="summary-item">
      <span>📸 <strong>최근 업로드:</strong></span>
      <span>{{ latestUpload }}</span>
    </div>
    <div class="summary-item">
      <span>📈 <strong>이번 주 업로드:</strong></span>
      <span>{{ weeklyCount }}회</span>
    </div>
    <div class="summary-item">
      <span>👍 <strong>자세 피드백:</strong></span>
      <span>{{ feedback }}</span>
    </div>
    <div class="summary-item">
      <span>🕒 <strong>다음 측정 추천:</strong></span>
      <span>{{ nextCheck }}</span>
    </div>

    <div class="posture-summary">
      <h4>📊 목 & 어깨 분석 결과</h4>
      <div class="posture-item">
        <strong>평균 목 각도:</strong> {{ averageNeckAngle }}°
      </div>
      <div class="posture-item">
        <strong>거북목 비율:</strong> {{ turtleNeckPercentage }}%
      </div>
      <div class="posture-item">
        <strong>평균 어깨 기울기:</strong> {{ averageShoulderDiff }}px
      </div>
      <div class="posture-item">
        <strong>어깨 불균형 비율:</strong> {{ shoulderUnevenPercentage }}%
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    photos: {
      type: Array,
      required: true
    }
  },
  computed: {
    // photos 배열 확인
    sortedPhotos() {
      console.log('Photos:', this.photos);  // photos 데이터 확인
      return this.photos.slice().sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));
    },
    // 최근 업로드 확인
    latestUpload() {
      const latest = this.sortedPhotos[0];
      console.log('Latest Upload:', latest);  // 가장 최신 업로드 데이터 확인
      return latest ? new Date(latest.uploaded_at).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }) : '없음';
    },
    // 이번 주 업로드 확인
    weeklyCount() {
      const today = new Date();
      const day = today.getDay();
      const monday = new Date(today.setDate(today.getDate() - (today.getDay() || 7)));
      monday.setHours(0, 0, 0, 0);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      const count = this.photos.filter(p => {
        const uploaded = new Date(p.uploaded_at);
        return uploaded >= monday && uploaded <= sunday;
      }).length;

      console.log('Weekly Count:', count);  // 이번 주 업로드 횟수 확인
      return count;
    },
    // 피드백 값 확인
    feedback() {
      console.log('Feedback:', this.photos.length > 0 ? '정상 자세' : '측정 필요');  // 피드백 값 확인
      return this.photos.length > 0 ? '정상 자세' : '측정 필요';
    },
    // 다음 측정 추천 확인
    nextCheck() {
      const lastUpload = this.sortedPhotos[0];
      console.log('Next Check:', lastUpload ? new Date(lastUpload.uploaded_at).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }) : '측정 필요');  // 다음 측정일 확인
      if (!lastUpload) return '측정 필요';
      const nextMeasurement = new Date(lastUpload.uploaded_at);
      nextMeasurement.setDate(nextMeasurement.getDate() + 3);  // 3일 후로 설정
      return nextMeasurement.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
    },
    // 평균 목 각도 확인
    averageNeckAngle() {
      const neckAngles = this.photos.map(p => p.neck_angle).filter(Boolean);
      console.log('Neck Angles:', neckAngles);  // 각도 값 확인
      const total = neckAngles.reduce((acc, angle) => acc + angle, 0);
      return neckAngles.length ? (total / neckAngles.length).toFixed(2) : 0;
    },
    // 거북목 비율 확인
    turtleNeckPercentage() {
      const total = this.photos.length;
      const turtleNeckCount = this.photos.filter(p => p.neck_angle && p.neck_angle >= 135).length;
      console.log('Turtle Neck Percentage:', total ? ((turtleNeckCount / total) * 100).toFixed(2) : 0);  // 비율 확인
      return total ? ((turtleNeckCount / total) * 100).toFixed(2) : 0;
    },
    // 평균 어깨 기울기 확인
    averageShoulderDiff() {
      const diffs = this.photos.map(p => parseFloat(p.shoulder_diff)).filter(diff => !isNaN(diff));
      console.log('Shoulder Differences:', diffs);  // 어깨 기울기 값 확인
      const total = diffs.reduce((sum, val) => sum + val, 0);
      return diffs.length ? (total / diffs.length).toFixed(2) : 0;
    },
    // 어깨 불균형 비율 확인
    shoulderUnevenPercentage() {
      const uneven = this.photos.filter(p => parseFloat(p.shoulder_diff) >= 10).length;
      console.log('Shoulder Uneven Percentage:', this.photos.length ? ((uneven / this.photos.length) * 100).toFixed(2) : 0);  // 어깨 불균형 비율 확인
      return this.photos.length ? ((uneven / this.photos.length) * 100).toFixed(2) : 0;
    }
  }
};
</script>

<style scoped>
.user-summary-card {
  background: #ffffff;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  color: #1976d2;
  margin-bottom: 10px;
}

.divider {
  border-top: 1px solid #e0e0e0;
  margin: 12px 0;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
}

.posture-summary {
  margin-top: 20px;
  border-top: 1px dashed #ccc;
  padding-top: 12px;
}

.posture-summary h4 {
  margin-bottom: 10px;
  font-size: 15px;
  font-weight: bold;
  color: #333;
}

.posture-item {
  margin: 4px 0;
}
</style>
