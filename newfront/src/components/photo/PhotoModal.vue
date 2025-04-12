<template>
  <!-- 모달 배경 클릭 시 모달 닫기 -->
  <div class="modal" @click="$emit('close')">
    <!-- 모달 콘텐츠 클릭 시 모달 닫히지 않도록 방지 -->
    <div class="modal-content" @click.stop>
      <!-- 닫기 버튼 -->
      <button class="close-btn" @click="$emit('close')">❌</button>
      <!-- 이미지 표시 -->
      <img :src="photoUrl" class="modal-image" />
    </div>
  </div>
</template>

<script>
export default {
  props: ['photoUrl'], // 부모에서 받은 사진 URL을 props로 받음
};
</script>

<style scoped>
/* 모달 배경 스타일 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7); /* 어두운 배경 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* 다른 콘텐츠보다 위에 표시 */
}

/* 모달 내부 콘텐츠 스타일 */
.modal-content {
  position: relative;
  background-color: white;
  padding: 16px;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  width: 40vw;           /* ✅ 전체 너비의 50% */
  height: auto;
  max-height: 60vh;      /* ✅ 화면 세로 최대 70% */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.modal-image {
  width: 100%;
  height: auto;
  object-fit: contain;
  border-radius: 12px;
}


/* 클릭 시 이미지 확대 */
.modal-image:hover {
  transform: scale(1.1); /* 클릭 시 이미지 크기를 10% 확대 */
}

/* 닫기 버튼 스타일 */
.close-btn {
  position: absolute;
  top: 5px; /* 이미지 상단에서 조금 내려놓기 */
  right: 10px; /* 이미지 오른쪽 끝에 배치 */
  background-color: transparent;
  color: white;
  font-size: 24px;
  border: none;
  cursor: pointer;
  z-index: 100;
}

.close-btn:hover {
  color: red; /* 마우스 오버 시 빨간색으로 변경 */
}
</style>
