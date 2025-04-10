<template>
  <div class="user-summary">
    <h3>📝 오늘의 요조</h3>
    <hr />
    <p>📸 <strong>최근 업로드:</strong> {{ latestUpload }}</p>
    <p>📈 <strong>이번 주 업로드:</strong> {{ weeklyCount }}회</p>
    <p>👍 <strong>자세 피드백:</strong> {{ feedback }}</p>
    <p>🕒 <strong>다음 치정 추천:</strong> {{ nextCheck }}</p>

    <!-- 📊 자세 분석 요조 -->
    <div class="posture-summary">
      <h4>📊 자세 분석 요조</h4>
      <p><strong>평균 목 각도:</strong> {{ averageNeckAngle }}°</p>
      <p><strong>거부목 비율:</strong> {{ turtleNeckPercentage }}%</p>
      <p><strong>평균 어깨 기울기:</strong> {{ averageShoulderDiff }}px</p>
      <p><strong>어깨 불균형 비율:</strong> {{ shoulderUnevenPercentage }}%</p>
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
    sortedPhotos() {
      return [...this.photos].sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));
    },
    latestUpload() {
      if (!this.sortedPhotos.length) return '없음';
      const latest = new Date(this.sortedPhotos[0].uploaded_at);
      return latest.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
    },
    weeklyCount() {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return this.photos.filter(p => new Date(p.uploaded_at) > oneWeekAgo).length;
    },
    feedback() {
      return this.photos.length > 0 ? '정상 자세' : '측정 필요';
    },
    nextCheck() {
      if (!this.sortedPhotos.length) return '측정 필요';
      const last = new Date(this.sortedPhotos[0].uploaded_at);
      last.setDate(last.getDate() + 3);
      return last.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
    },
    averageNeckAngle() {
      const neckAngles = this.photos.map(p => p.neck_angle).filter(Boolean);
      const total = neckAngles.reduce((acc, angle) => acc + angle, 0);
      return neckAngles.length ? (total / neckAngles.length).toFixed(2) : 0;
    },
    turtleNeckPercentage() {
      const total = this.photos.length;
      const turtleNeckCount = this.photos.filter(p => p.neck_angle && p.neck_angle >= 135).length;
      return total ? ((turtleNeckCount / total) * 100).toFixed(2) : 0;
    },
    averageShoulderDiff() {
      const diffs = this.photos.map(p => parseFloat(p.shoulder_diff)).filter(diff => !isNaN(diff));
      const total = diffs.reduce((sum, val) => sum + val, 0);
      return diffs.length ? (total / diffs.length).toFixed(2) : 0;
    },
    shoulderUnevenPercentage() {
      const uneven = this.photos.filter(p => parseFloat(p.shoulder_diff) >= 10).length;
      const total = this.photos.length;
      return total ? ((uneven / total) * 100).toFixed(2) : 0;
    }
  }
};
</script>

<style scoped>
.user-summary {
  min-height: 180px;
  margin-top: 20px;
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  background-color: #f8fbff;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ddeeff;
}

.user-summary hr {
  margin-bottom: 12px;
  border: none;
  border-top: 1px solid #ccc;
}

.posture-summary {
  margin-top: 20px;
  padding-top: 12px;
  border-top: 1px solid #ccc;
  font-size: 14px;
  color: #333;
}

.posture-summary h4 {
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: bold;
}
</style>
