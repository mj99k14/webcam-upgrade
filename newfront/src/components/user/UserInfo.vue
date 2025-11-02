<template>
  <div class="outer-wrapper">
    <!--  마이페이지 카드 -->
    <div class="card-box">
      <div class="section-title-wrapper">
        <h2 class="section-title">
          <span class="emoji">🧑‍💻</span> 마이 페이지
        </h2>
      </div>

      <h3 class="welcome">{{ user.name }} 님 환영합니다</h3>

      <!-- 프로필 이미지 -->
      <div v-if="!user.profile_image" class="user-avatar">
        {{ user.name?.slice(0, 2) || '유저' }}
      </div>
      <img
        v-else
        :src="user.profile_image"
        alt="프로필 사진"
        class="profile-img"
      />

      <!-- 사용자 정보 -->
      <div class="info-text">
        <p><strong>이름:</strong> {{ user.name || '정보 없음' }}</p>
        <p><strong>이메일:</strong> {{ user.email || '정보 없음' }}</p>
      </div>

      <!-- 버튼 -->
      <div class="button-group">
        <button class="logout" @click="$emit('logout')">로그아웃</button>
        <button class="delete" @click="$emit('deleteAccount')">회원 탈퇴</button>
      </div>
    </div>
  </div>
</template>

<script setup>

const props = defineProps({
  user: Object,
  calendarStats: {
    type: Array,
    default: () => []
  }
})
const emit = defineEmits(['logout', 'deleteAccount', 'selectDate'])
</script>

<style scoped>
.outer-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  
}

/*  공통 카드 스타일 */
.card-box,
.calendar-card,
.health-report-card {
  background: #ffffff;
  padding: 24px;  /* 기존 padding 20px에서 증가 */
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  width: 100%;
  max-width: 1200px;  /* 더 넓은 max-width 설정 */
  box-sizing: border-box;
  font-family: 'Noto Sans KR', sans-serif;
}

/* 마이페이지 타이틀 */
.section-title-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 18px;
}

.section-title {
  font-size: 22px;
  font-weight: 800;
  color: #1976d2;
  border-bottom: 2px solid #42a5f5;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 4px;
}

/*  마이페이지 사용자 정보 */
.user-avatar,
.profile-img {
  width: 120px;  /* 프로필 이미지 크기 확대 */
  height: 120px;
  margin: 12px auto;
  border-radius: 50%;
  font-size: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar {
  background-color: #2e7d32;
  color: white;
}

.profile-img {
  object-fit: cover;
}

/* 버튼 스타일 */
.button-group {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.logout, .delete {
  padding: 10px 18px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  text-align: center;
  width: 100%;
  max-width: 180px;
  transition: all 0.3s ease;
}

.logout {
  background-color: #1976d2;
  color: white;
}

.logout:hover {
  background-color: #1565c0;
}

.delete {
  background-color: #e53935;
  color: white;
}

.delete:hover {
  background-color: #c62828;
}


</style>