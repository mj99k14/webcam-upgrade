<template>
  <div class="summary-box" v-if="dailyStats.length > 0">
    <h3>📊 자세 분석 요약</h3>

    <div class="charts">
      <div class="chart-container">
        <NeckDonut :photos="photos" />
        <!-- 목 자세 분석 결과 텍스트 -->
        <div class="analysis-text">
          <p>🐢 목 자세 분석: {{ dynamicNeckAnalysis }}</p>
        </div>
      </div>

      <div class="chart-container">
        <ShoulderDonut :photos="photos" />
        <!-- 어깨 분석 결과 텍스트 -->
        <div class="analysis-text">
          <p>🤷 어깨 분석: {{ dynamicShoulderAnalysis }}</p>
        </div>
      </div>
    </div>

    <AnalysisComment
      :highAngleRatio="highAngleRatio"
      :shoulderAvg="overallShoulderAvg"
    />

    <SummaryCards
      :dailyStats="dailyStats"
      :overallAverage="overallAverage"
      :highAngleRatio="highAngleRatio"
      :shoulderAvg="overallShoulderAvg"
      :lastTaken="lastTaken"
    />
  </div>
</template>

<script>
import NeckDonut from './NeckDonut.vue';
import ShoulderDonut from './ShoulderDonut.vue';
import AnalysisComment from './AnalysisComment.vue';
import SummaryCards from './SummaryCards.vue';

export default {
  name: 'SummaryStats',
  components: {
    NeckDonut,
    ShoulderDonut,
    AnalysisComment,
    SummaryCards
  },
  props: ['photos'],
  computed: {
    dailyStats() {
      const grouped = {};
      this.photos.forEach(p => {
        const date = new Date(p.measured_at || p.uploaded_at).toISOString().split('T')[0];
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(p.average_neck_angle || p.neck_angle);
      });
      return Object.entries(grouped).map(([date, angles]) => {
        const avg = angles.reduce((sum, a) => sum + a, 0) / angles.length;
        return { date, avg: avg.toFixed(1), count: angles.length };
      });
    },
    overallAverage() {
      const total = this.photos.reduce((sum, p) => sum + (p.average_neck_angle || p.neck_angle), 0);
      return total / this.photos.length;
    },
    overallShoulderAvg() {
      const diffs = this.photos.map(p => p.shoulder_diff).filter(Boolean);
      const total = diffs.reduce((sum, d) => sum + d, 0);
      return diffs.length ? total / diffs.length : 0;
    },
    highAngleRatio() {
      const high = this.photos.filter(p => (p.average_neck_angle || p.neck_angle) >= 135).length;
      return ((high / this.photos.length) * 100).toFixed(1);
    },
    lastTaken() {
      if (this.photos.length === 0) return '없음';
      const last = new Date(this.photos[this.photos.length - 1].measured_at || this.photos[this.photos.length - 1].uploaded_at);
      return `${last.getMonth() + 1}월 ${last.getDate()}일 ${last.getHours()}:${last.getMinutes().toString().padStart(2, '0')}`;
    },
    // 동적 목 자세 분석 텍스트
    dynamicNeckAnalysis() {
      if (this.highAngleRatio >= 50) {
        return `${this.highAngleRatio}% 거북목 의심`;
      } else {
        return `${this.highAngleRatio}% 정상`;
      }
    },
    // 동적 어깨 분석 텍스트
    dynamicShoulderAnalysis() {
      if (this.shoulderAvg > 30) {
        return '어깨 기울기 심각';
      } else {
        return '어깨 기울기 정상';
      }
    }
  }
};
</script>

<style scoped>
.charts {
  display: flex;
  justify-content: space-around; /* 차트들 사이에 여백을 자동으로 배치 */
  gap: 40px; /* 차트들 간의 간격 */
  margin-bottom: 24px;
}

.summary-box {
  background: #fefefe;
  border: 1px solid #d1e7dd;
  padding: 24px;
  border-radius: 14px;
  margin-top: 20px;
  width: 90%;
  max-width: 1200px; /* 최대 크기 제한 */
  margin: 0 auto;
}

.summary-info {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-top: 24px;
}

.timer-text {
  font-size: 16px;
  margin-top: 12px;
  color: #333;
}

.result-text {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
}

.result-text div {
  font-size: 14px;
  color: #666;
}

.result-text .highlight {
  font-weight: bold;
  color: #d9534f; /* 경고 색상 */
}

.button-group {
  display: flex;
  justify-content: space-around;
  gap: 16px;
  margin-top: 24px;
}

.analysis-text {
  margin-top: 16px;
  font-size: 14px;
  color: #333;
}
</style>