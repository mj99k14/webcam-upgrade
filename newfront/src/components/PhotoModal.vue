<!-- src/components/PhotoModal.vue -->
<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <img :src="photoUrl" alt="확대 사진" />
      <button class="close-btn" @click="$emit('close')">닫기</button>
    </div>
  </div>
</template>

<script>
export default {
  props: ['photoUrl']
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  max-width: 90%;
  max-height: 90%;
}
.modal-content img {
  max-width: 100%;
  border-radius: 8px;
}
.close-btn {
  margin-top: 12px;
  padding: 6px 12px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>
