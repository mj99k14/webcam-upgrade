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
    <!-- <div class="summary-item">
      <span>👍 <strong>자세 피드백:</strong></span>
      <span>{{ todaySummary?.shoulderStatus || '불러오는 중...' }}</span>
    </div> -->
    <div class="summary-item">
      <span>🕒 <strong>다음 측정 추천:</strong></span>
      <span>{{ nextCheck }}</span>
    </div>

    <div class="posture-summary" v-if="todaySummary">
      <h4>📊 목 & 어깨 분석 결과</h4>
      <div class="posture-item">
        <strong>평균 목 각도:</strong> {{ todaySummary.averageNeckAngle?.toFixed(2) }}°
      </div>
      <div class="posture-item">
        <strong>최대 목 각도:</strong> {{ todaySummary.maxNeckAngle?.toFixed(2) }}°
      </div>
      <div class="posture-item">
        <strong>측정 횟수:</strong> {{ todaySummary.measurementCount }}회
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ref, computed, onMounted } from 'vue';

export default {
  props: {
    photos: {
      type: Array,
      required: true
    },
    userId: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const todaySummary = ref(null);

    const fetchTodaySummary = async () => {
      try {
        const res = await axios.get(`/api/posture/summary/today?user_id=${props.userId}`);
        todaySummary.value = res.data.data;
        console.log("📊 오늘 요약:", todaySummary.value);
      } catch (err) {
        console.error("❌ 오늘 요약 오류", err);
      }
    };

    const sortedPhotos = computed(() => {
      return props.photos.slice().sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));
    });

    const latestUpload = computed(() => {
      const latest = sortedPhotos.value[0];
      return latest ? new Date(latest.uploaded_at).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }) : '없음';
    });

    const weeklyCount = computed(() => {
      const today = new Date();
      const monday = new Date(today.setDate(today.getDate() - (today.getDay() || 7)));
      monday.setHours(0, 0, 0, 0);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      return props.photos.filter(p => {
        const uploaded = new Date(p.uploaded_at);
        return uploaded >= monday && uploaded <= sunday;
      }).length;
    });

    const nextCheck = computed(() => {
      const latest = sortedPhotos.value[0];
      if (!latest) return '측정 필요';
      const next = new Date(latest.uploaded_at);
      next.setDate(next.getDate() + 3);
      return next.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
    });

    //onMounted(() => {
      //fetchTodaySummary();
    //});

    return {
      todaySummary,
      latestUpload,
      weeklyCount,
      nextCheck
    };
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
