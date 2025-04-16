<template>
  <div class="outer-wrapper">
    <!-- 🔵 마이페이지 카드 -->
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

    <!-- 🔵 캘린더 카드 -->
    <div class="card-box">
      <div class="section-title-wrapper">
        <h2 class="section-title">
          <span class="emoji">📅</span> 이번달 자세
        </h2>
      </div>
      <MiniCalendar
        :stats="calendarStats"
        @dateSelected="$emit('selectDate', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import MiniCalendar from '../calendar/MiniCalendar.vue'

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

/* 📦 공통 카드 박스 */
.card-box {
  background: #ffffff;
  padding: 24px 20px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 360px;
  box-sizing: border-box;
  font-family: 'Noto Sans KR', sans-serif;
  text-align: center;
}

/* 🔵 섹션 제목 */
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

.section-title .emoji {
  font-size: 20px;
}

/* 👋 환영 메시지 */
.welcome {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 14px;
}

/* 🧑 프로필 */
.user-avatar,
.profile-img {
  width: 88px;
  height: 88px;
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

/* ℹ️ 사용자 정보 */
.info-text p {
  margin: 4px 0;
  font-size: 15px;
  color: #333;
}

/* 🔘 버튼 */
.button-group {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 16px 0 8px;
}

.logout, .delete {
  padding: 6px 14px;
  min-width: 88px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  text-align: center;
}

.logout {
  background-color: #1976d2;
  color: white;
}

.delete {
  background-color: #e53935;
  color: white;
}






</style>