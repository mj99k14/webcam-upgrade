<template>
  <div class="summary-box" v-if="safePhotos.length > 0">
    <h3 class="section-title">
      <span class="emoji">📊</span> 자세 분석 요약
    </h3>

    <div class="charts">
      <div class="chart-container">
        <NeckDonut :photos="safePhotos" />
      </div>
      <div class="chart-container">
        <ShoulderDonut :photos="safePhotos" />
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
      :maxNeckAngle="maxNeckAngle"
      :shoulderRatio="shoulderRatio"
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
  props: {
    photos: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    safePhotos() {
      return Array.isArray(this.photos) ? this.photos : [];
    },
    dailyStats() {
      const grouped = {};
      this.safePhotos.forEach(p => {
        const date = new Date(p.measured_at || p.uploaded_at).toISOString().split('T')[0];
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(p.average_neck_angle || p.neck_angle);
      });
      return Object.entries(grouped).map(([date, angles]) => {
        const avg = angles.reduce((sum, a) => sum + a, 0) / angles.length;
        return { date, avg: avg, count: angles.length };
      });
    },
    overallAverage() {
      const total = this.safePhotos.reduce((sum, p) => sum + (p.average_neck_angle || p.neck_angle), 0);
      return this.safePhotos.length ? total / this.safePhotos.length : 0;
    },
    overallShoulderAvg() {
      const diffs = this.safePhotos.map(p => p.shoulder_diff).filter(d => d !== undefined && d !== null);
      const total = diffs.reduce((sum, d) => sum + d, 0);
      return diffs.length ? total / diffs.length : 0;
    },
    highAngleRatio() {
      const high = this.safePhotos.filter(p => (p.average_neck_angle || p.neck_angle) >= 135).length;
      return this.safePhotos.length ? (high / this.safePhotos.length) * 100 : 0;
    },
    lastTaken() {
      if (this.safePhotos.length === 0) return '없음';
      const last = new Date(this.safePhotos[this.safePhotos.length - 1].measured_at || this.safePhotos[this.safePhotos.length - 1].uploaded_at);
      return `${last.getMonth() + 1}월 ${last.getDate()}일 ${last.getHours()}:${last.getMinutes().toString().padStart(2, '0')}`;
    },
    maxNeckAngle() {
      const angles = this.safePhotos.map(p => p.average_neck_angle || p.neck_angle).filter(Boolean);
      return angles.length ? Math.max(...angles) : 0;
    },
    shoulderRatio() {
      const left = this.safePhotos.filter(p =>
        p.shoulder_status === 'left_high' || p.shoulder_status === '왼쪽 어깨가 높음'
      ).length;
      const right = this.safePhotos.filter(p =>
        p.shoulder_status === 'right_high' || p.shoulder_status === '오른쪽 어깨가 높음'
      ).length;
      const total = left + right;
      if (total === 0) return { left: 0, right: 0 };
      return {
        left: Math.round((left / total) * 100),
        right: Math.round((right / total) * 100)
      };
    }
  }
};
</script>

<style scoped>
.summary-box {
  width: 100%;
}
.section-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
}
.emoji {
  margin-right: 8px;
}
.charts {
  display: flex;
  justify-content: space-around;
  gap: 40px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}
.chart-container {
  flex: 1;
  min-width: 400px;
  max-width: 600px;
  background: #f8fbff;
  padding: 16px 20px;
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}
</style>
