<template>
  <div id="app" class="outer-wrapper">
    <router-view />
  </div>
</template>

<script setup>
</script>

<!-- ❌ scoped 제거 -->
<style>
/* ✅ 전체 바탕 파란색 배경 */
body, #app {
  margin: 0;
  padding: 0;
  background-color: #eaf4ff;
  font-family: 'Segoe UI', sans-serif;
}

/* ✅ 전체를 감싸는 파란색 영역 (중앙 정렬) */
.outer-wrapper {
  display: flex;
  justify-content: center;
  padding: 40px 20px;
  box-sizing: border-box;
}

/* ✅ 안쪽 하얀 카드 박스 (전체 레이아웃 통일용) */
.card-wrapper {
  background-color: #ffffff;
  border-radius: 24px;
  padding: 48px;
  width: 100%;
  max-width: 1400px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
}

/* ✅ 공통 제목 영역 */
.section-title-wrapper {
  margin-bottom: 16px;
}

.section-title {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 12px;
  padding-left: 4px;
}

/* ✅ 흰색 카드 레이아웃 (각 컴포넌트 내부 카드 용) */
.white-card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  max-width: 1000px; /* ✅ 넓게 보이게 변경 */
  width: 100%;
  margin: 0 auto 24px;
}

</style>
