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
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

/* 확대된 이미지 스타일 */
.modal-image {
  max-width: 95%;
  max-height: 95%;
  border-radius: 10px;
  object-fit: contain; /* 이미지 비율 유지하며 크기 조정 */
  transition: transform 0.3s ease-in-out; /* 부드러운 확대 애니메이션 */
}

/* 클릭 시 이미지 확대 */
.modal-image:hover {
  transform: scale(1.1); /* 클릭 시 이미지 크기를 10% 확대 */
}

/* 닫기 버튼 스타일 */
.close-btn {
  position: absolute;
  top: 10px; /* 이미지 상단에서 조금 내려놓기 */
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
