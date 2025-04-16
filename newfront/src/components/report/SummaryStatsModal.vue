<template>
    <div v-if="visible" class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <!-- 닫기 버튼 -->
        <button class="close-button" @click="close">×</button>
  
        <!-- 분석 요약 컴포넌트 -->
        <SummaryStats :photos="photos" />
      </div>
    </div>
  </template>
  
  <script setup>
  import SummaryStats from './SummaryStats.vue';
  const props = defineProps({
    visible: Boolean,
    photos: Array
  });
  const emit = defineEmits(['close']);
  const close = () => emit('close');
  </script>
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    position: relative;
    background: white;
    padding: 24px;
    border-radius: 16px;
    max-width: 1000px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }
  
  /* ❌ 닫기 버튼 스타일 */
  .close-button {
  position: absolute;
  top: 16px;
  right: 20px;
  background: transparent;
  border: none;
  font-size: 36px; /* 👈 크기 키움 */
  font-weight: bold;
  color: #333; /* 더 진한 회색 */
  cursor: pointer;
  transition: transform 0.2s ease, color 0.2s ease;
}

.close-button:hover {
  color: #e53935; /* hover 시 빨간색 강조 */
  transform: scale(1.2); /* 살짝 확대 효과 */
}

  </style>
  