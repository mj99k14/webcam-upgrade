<template>
  <div>
    <!-- ⏳ 로딩 중일 때는 아무것도 안 보임 -->
    <div v-if="!loaded">
      <!-- 로딩 인디케이터가 필요하다면 여기에 추가 가능 -->
    </div>

    <!-- 🔴 데이터가 없을 때 -->
    <div v-else-if="!todayData" class="no-data-box">
      <p>📷 오늘 측정된 사진이 없습니다. 사진을 촬영해주세요.</p>
    </div>

    <!-- ✅ 데이터 있을 때 -->
    <div v-else class="feedback-box">
      <h4>📅 오늘의 자세 피드백 ({{ formattedDate }})</h4>
      <ul>
        <li>• 평균 목 각도: {{ todayData.average_neck_angle.toFixed(1) }}°</li>
        <li>• 최대 목 각도: {{ todayData.max_neck_angle.toFixed(1) }}°</li>
        <li>• 어깨 상태: {{ shoulderText }}</li>
      </ul>
      <div class="feedback-tag" :class="feedbackClass">
        <span>✔ {{ feedbackMessage }}</span>
      </div>
    </div>
  </div>
</template>


<script>
import axios from 'axios';
import { watch, ref, computed } from 'vue';

export default {
  name: 'TodayFeedback',
  props: {
    userId: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const todayData = ref(null);
    const loaded = ref(false);

    const fetchTodayData = async () => {
      if (!props.userId) {
        console.warn("⚠ userId 없음");
        return;
      }

      const url = `${import.meta.env.VITE_API_BASE_URL}/api/posture/latest/${props.userId}`;
      if (!import.meta.env.VITE_API_BASE_URL) {
        console.warn("⚠️ VITE_API_BASE_URL이 정의되지 않았습니다.");
      }
      console.log("📡 호출 URL:", url);


      try {
        const res = await axios.get(url);
        console.log("📡 응답:", res.data);

        if (res.data.success && res.data.data) {
          todayData.value = res.data.data;
        } else {
          todayData.value = null;
        }
      } catch (err) {
        console.error("🔥 최신 데이터 요청 실패:", err);
      } finally {
        loaded.value = true;
      }
    };


    watch(() => props.userId, (newVal) => {
      if (newVal) fetchTodayData();
    }, { immediate: true });

    const shoulderText = computed(() => {
      const diff = todayData.value?.shoulder_diff;
      if (diff == null) return '정보 없음';
      return diff < 10
        ? `어깨 수평 (정상) (${diff.toFixed(1)}px)`
        : `어깨 불균형 (${diff.toFixed(1)}px)`;
    });

    const feedbackMessage = computed(() =>
      todayData.value?.average_neck_angle > 135
        ? '현재 자세가 전체적으로 좋지 않습니다!'
        : '현재 자세가 전반적으로 양호합니다!'
    );

    const feedbackClass = computed(() =>
      todayData.value?.average_neck_angle > 135 ? 'bad' : 'good'
    );

    const formattedDate = computed(() => {
      const now = new Date();
      return `${now.getFullYear()}. ${String(now.getMonth() + 1).padStart(2, '0')}. ${String(now.getDate()).padStart(2, '0')}.`;
    });

    return {
      todayData,
      loaded,
      shoulderText,
      feedbackMessage,
      feedbackClass,
      formattedDate
    };
  }
};
</script>
<style scoped>
.feedback-box {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  max-width: 480px;
  margin: 20px auto;
  font-family: 'Segoe UI', sans-serif;
  border: 1px solid #dfefff;
  text-align: center; /* ✅ 전체 텍스트 중앙 정렬 */
}

.feedback-box h4 {
  font-size: 18px;
  font-weight: bold;
  color: #1565c0;
  margin-bottom: 12px;
  border-bottom: 1px solid #eee;
  padding-bottom: 6px;
}

.feedback-box ul {
  list-style: none;
  padding: 0;
  margin-bottom: 12px;
}

.feedback-box li {
  margin-bottom: 8px;
  font-size: 15px;
  color: #333;
}

.feedback-tag {
  background-color: #fff8e1;
  color: #ff6f00;
  padding: 12px 16px;
  font-weight: bold;
  text-align: center;
  border-radius: 8px;
  border: 1px dashed #ffd54f;
  font-size: 15px;
  box-shadow: 0 0 0 1px rgba(255, 193, 7, 0.1) inset;
}


.feedback-tag.good {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.feedback-tag.bad {
  background-color: #ffebee;
  color: #c62828;
}

.no-data-box {
  text-align: center;
  padding: 16px;
  background-color: #fff3cd;
  border: 1px solid #ffeeba;
  border-radius: 10px;
  color: #856404;
  font-size: 14px;
  font-weight: 500;
}

</style>