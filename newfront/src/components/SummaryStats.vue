<template>
  <div class="summary-box" v-if="dailyStats.length > 0">
    <h3>📊 자세 분석 요약</h3>

    <div class="charts">
      <!-- 목 자세 분석 -->
      <div class="chart-box">
        <h4 class="chart-title">🦒 목 자세 분석</h4>
        <Doughnut :data="donutData" :options="donutOptions" />
        <div class="legend">
          <span class="legend-item"><span class="dot red"></span> 거북목 의심</span>
          <span class="legend-item"><span class="dot blue"></span> 정상 자세</span>
        </div>
      </div>

      <!-- 어깨 균형 분석 -->
      <div class="chart-box">
        <h4 class="chart-title">💪 어깨 균형 분석</h4>
        <Doughnut :data="donutDataShoulder" :options="donutOptions" />
        <div class="legend">
          <span class="legend-item"><span class="dot orange"></span> 어깨 불균형</span>
          <span class="legend-item"><span class="dot blue"></span> 어깨 수평</span>
        </div>
      </div>
    </div>

    <!-- 분석 요약 문구 -->
    <p class="summary-remark">💬 {{ analysisComment }}</p>

    <!-- 요약 카드 -->
    <div class="summary-cards">
      <div class="card">📸 총 촬영일 <strong>{{ dailyStats.length }}</strong>일</div>
      <div class="card">⚠️ 평균 목 각도 <strong>{{ overallAverage.toFixed(1) }}°</strong></div>
      <div class="card">⚠️ 거북목 비율 <strong>{{ highAngleRatio }}%</strong></div>
      <div class="card">↔️ 평균 어깨 기울기 <strong>{{ overallShoulderAvg.toFixed(1) }}px</strong></div>
      <div class="card">🕒 최근 촬영일 <strong>{{ lastTaken }}</strong></div>
    </div>
  </div>
</template>

<script>
import { Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS, Title, Tooltip, Legend, ArcElement,
  CategoryScale, LinearScale, PointElement, LineElement
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, PointElement, LineElement);

export default {
  name: 'SummaryStats',
  components: { Doughnut },
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
    donutData() {
      const total = this.photos.length;
      const bad = this.photos.filter(p => (p.average_neck_angle || p.neck_angle) >= 135).length;
      const good = total - bad;
      return {
        labels: ['거북목 의심', '정상 자세'],
        datasets: [{
          data: [bad, good],
          backgroundColor: ['#ff6b6b', '#1e90ff'],
        }]
      };
    },
    donutDataShoulder() {
      const total = this.photos.length;
      const unbalanced = this.photos.filter(p => p.shoulder_diff && p.shoulder_diff > 10).length;
      const balanced = total - unbalanced;
      return {
        labels: ['어깨 불균형', '어깨 수평'],
        datasets: [{
          data: [unbalanced, balanced],
          backgroundColor: ['#ffa726', '#42a5f5']
        }]
      };
    },
    donutOptions() {
      return {
        cutout: '65%',
        responsive: true,
        plugins: {
          legend: { display: false }
        }
      };
    },
    analysisComment() {
  const angle = parseFloat(this.highAngleRatio); // 거북목 비율
  const shoulder = this.overallShoulderAvg;      // 어깨 기울기

  const angleBad = angle >= 50;
  const angleMid = angle >= 20;
  const shoulderBad = shoulder >= 20;
  const shoulderMid = shoulder >= 10;

    if (angleBad && shoulderBad) {
      return '🔴 분석 결과: 거북목과 어깨 모두 개선이 시급한 상태입니다.';
    } else if (angleBad) {
      return '🔴 분석 결과: 거북목 자세가 시급히 개선되어야 합니다.';
    } else if (shoulderBad) {
      return '🔴 분석 결과: 어깨 균형이 심각하게 틀어져 있습니다.';

    } else if (angleMid && shoulderMid) {
      return '🟡 분석 결과: 거북목과 어깨 모두 개선이 필요합니다.';
    } else if (angleMid) {
      return '🟡 분석 결과: 거북목 자세가 다소 관찰됩니다.';
    } else if (shoulderMid) {
      return '🟡 분석 결과: 어깨가 다소 틀어져 있습니다.';

    } else {
      return '🟢 분석 결과: 현재 자세가 양호한 편입니다.';
    }
  }
  }
};
</script>

<style scoped>
.summary-box {
  background: #fefefe;
  border: 1px solid #d1e7dd;
  padding: 24px;
  border-radius: 14px;
  margin-top: 20px;
}
.chart-title {
  text-align: center;
  font-size: 17px;
  margin-bottom: 10px;
}
.charts {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  gap: 20px;
  margin-bottom: 24px;
}
.chart-box {
  flex: 1;
  min-width: 280px;
  max-width: 360px;
}
.legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  font-size: 13px;
  margin-top: 8px;
}
.legend-item {
  display: flex;
  align-items: center;
}
.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 6px;
}
.red { background: #ff6b6b; }
.blue { background: #1e90ff; }
.orange { background: #ffa726; }
.summary-remark {
  text-align: center;
  font-size: 16px;
  margin: 10px 0;
  font-weight: 500;
}
.summary-cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
}
.card {
  background: #f8f9fa;
  border: 1px solid #ccc;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 15px;
  min-width: 160px;
  text-align: center;
}
</style>