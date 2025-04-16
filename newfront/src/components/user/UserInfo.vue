<template>
  <div class="card-wrapper">
    <!-- 🔵 마이페이지 제목 -->
    <div class="section-title-wrapper">
      <h2 class="section-title">
        <span class="emoji">🧑‍💻</span> 마이 페이지
      </h2>
    </div>

    <!-- 🔵 환영 메시지 -->
    <h3 class="welcome">{{ user.name }} 님 환영합니다</h3>

    <!-- 🔵 프로필 이미지 또는 이니셜 -->
    <div v-if="!user.profile_image" class="user-avatar">
      {{ user.name?.slice(0, 2) || '유저' }}
    </div>
    <img
      v-else
      :src="user.profile_image"
      alt="프로필 사진"
      class="profile-img"
    />

    <!-- 🔵 사용자 정보 -->
    <div class="info-text">
      <p><strong>이름:</strong> {{ user.name || '정보 없음' }}</p>
      <p><strong>이메일:</strong> {{ user.email || '정보 없음' }}</p>
    </div>

    <!-- 🔵 버튼 그룹 -->
    <div class="button-group">
      <button class="logout" @click="$emit('logout')">로그아웃</button>
      <button class="delete" @click="$emit('deleteAccount')">회원 탈퇴</button>
    </div>

    <!-- 🔵 캘린더 -->
    <div class="calendar-section">
      <p class="calendar-title"><strong>📅 이번달 자세</strong></p>
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
.card-wrapper {
  background-color: white;
  padding: 28px 20px;
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  width: 100%;
  min-width: 260px;
  max-width: 320px;
  box-sizing: border-box;
  font-family: 'Segoe UI', sans-serif;
  text-align: center;
}

.section-title-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 24px;
  font-weight: 800;
  color: #1976d2;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border-bottom: 3px solid #42a5f5;
  padding-bottom: 4px;
}

.section-title .emoji {
  font-size: 22px;
  margin-bottom: 2px;
}

.welcome {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 14px;
}

/* ✅ 프로필 */
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

/* ✅ 정보 텍스트 */
.info-text p {
  margin: 4px 0;
  font-size: 14px;
  color: #333;
}

/* ✅ 버튼 */
.button-group {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 18px 0 22px;
}

.logout, .delete {
  padding: 6px 14px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}

.logout {
  background-color: #1976d2;
  color: white;
}

.delete {
  background-color: #e53935;
  color: white;
}

/* ✅ 캘린더 */
.calendar-section {
  text-align: center;
  margin-top: 12px;
}

.calendar-title {
  margin-bottom: 10px;
  font-size: 15px;
}
</style>
