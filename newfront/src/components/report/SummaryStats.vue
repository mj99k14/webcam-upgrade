
<template>
  <div class="summary-box" v-if="dailyStats.length > 0">
    <h3 class="section-title">
      <span class="emoji">📊</span> 자세 분석 요약
    </h3>

    <!-- ✅ 한 줄에 나란히 정렬 -->
    <div class="charts-row">
      <!-- 목 자세 블럭 -->
      <div class="chart-wrapper">
        <h2 class="center-title">🐢 목 자세</h2>
        <div class="chart-container">
          <NeckDonut :photos="photos" />
          <div class="analysis-text">
            <p> 목 자세 분석: {{ dynamicNeckAnalysis }}</p>
          </div>
        </div>
      </div>

      <!-- 어깨 자세 블럭 -->
      <div class="chart-wrapper">
        <h2 class="center-title">🤷 어깨 자세</h2>
        <div class="chart-container">
          <ShoulderDonut :photos="photos" />
          <div class="analysis-text">
            <p> 어깨 분석: {{ dynamicShoulderAnalysis }}</p>
          </div>
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
    dynamicNeckAnalysis() {
      if (this.highAngleRatio >= 50) {
        return `${this.highAngleRatio}% 거북목 의심`;
      } else {
        return `${this.highAngleRatio}% 정상`;
      }
    },
    dynamicShoulderAnalysis() {
      if (this.overallShoulderAvg > 30) {
        return '어깨 기울기 심각';
      } else {
        return '어깨 기울기 정상';
      }
    }
  }
};
</script>

<style scoped>
.charts-row {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 32px;
  flex-wrap: wrap; /* 줄 넘침 방지 */
}

.chart-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.center-title {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #222;
}

.chart-container {
  width: 100%;
  min-width: 400px;
  max-width: 600px;
  background: #f8fbff;
  padding: 16px 20px;
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}

.analysis-text {
  margin-top: 24px;
  font-size: 18px;
  font-weight: 600;
  color: #222;
  text-align: center;
}

</style>
