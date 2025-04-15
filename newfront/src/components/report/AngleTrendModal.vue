<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <h2>{{ selectedDate }} 요약</h2>

      <template v-if="loading">
        <p class="loading-message">⏳ 데이터를 불러오는 중입니다...</p>
      </template>

      <template v-else-if="summary">
        <p>📸 총 {{ summary.count }}회 측정</p>
        <p>🦢 평균 목각도: <strong>{{ summary.avgNeck }}°</strong></p>
        <p>📈 최대 목각도: <strong>{{ summary.maxNeck }}°</strong></p>
        <p>📏 어깨 비대칭 평균: <strong>{{ summary.avgShoulder }}°</strong></p>
        <p>🗣️ 피드백: <strong>{{ summary.feedback }}</strong></p>
      </template>

      <template v-else>
        <p class="empty-message">📭 해당 날짜의 측정 데이터가 없습니다.</p>
      </template>

      <div class="button-container">
        <button class="close-btn" @click="$emit('close')">닫기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'

const props = defineProps(['selectedDate'])
const summary = ref(null)
const loading = ref(false)

watch(() => props.selectedDate, async (newDate) => {
  if (!newDate) return
  const user = JSON.parse(localStorage.getItem('user'))
  if (!user?.user_id) return

  loading.value = true
  summary.value = null

  try {
    const res = await axios.get('/api/posture/summary', {
      params: {
        user_id: user.user_id,
        date: newDate
      }
    })
    if (res.data.success && res.data.count > 0) {
      summary.value = res.data
    }
  } catch (err) {
    console.error('❌ 요약 데이터 에러:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background: white;
  padding: 32px;
  border-radius: 16px;
  min-width: 520px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.button-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.close-btn {
  background-color: #1976d2;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  font-weight: 600;
}

.empty-message,
.loading-message {
  margin-top: 24px;
  font-size: 16px;
  color: #666;
}
</style>
