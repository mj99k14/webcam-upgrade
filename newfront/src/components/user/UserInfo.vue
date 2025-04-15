<template>
  <div class="card-wrapper">
    <div class="section-title-wrapper">
      <h2 class="section-title"><span class="emoji">🧑‍💻</span> 마이 페이지</h2>
    </div>

    <h3>{{ user.name }} 님 환영합니다</h3>

    <!-- ✅ 프로필 사진 or 이니셜 -->
    <div class="user-avatar" v-if="!user.profile_image">
      {{ user.name?.slice(0, 2) || '유저' }}
    </div>
    <img
      v-else
      :src="user.profile_image"
      alt="프로필 사진"
      class="profile-img"
    />

    <!-- ✅ 사용자 정보 -->
    <p><strong>이름:</strong> {{ user.name || '정보 없음' }}</p>
    <p><strong>이메일:</strong> {{ user.email || '정보 없음' }}</p>

    <!-- ✅ 버튼 -->
    <div class="button-group">
      <button class="logout" @click="$emit('logout')">로그아웃</button>
      <button class="delete" @click="$emit('deleteAccount')">회원 탈퇴</button>
    </div>

    <!-- ✅ 캘린더 -->
    <div class="calendar-section">
      <p class="calendar-title"><strong>📅 이번달 자세</strong></p>
      <MiniCalendar
        :stats="calendarStats"
        @dateSelected="$emit('selectDate', $event)" />
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
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  max-width: 600px;
  margin: 0 auto 32px;
  box-sizing: border-box;
  font-family: 'Segoe UI', sans-serif;
  text-align: center;
}

/* ✅ 제목 */
.section-title-wrapper {
  display: flex;
  justify-content: center;
  margin: 4px 0 20px;
}

.section-title {
  font-size: 30px;
  font-weight: 800;
  color: #1976d2;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border-bottom: 3px solid #42a5f5;
  padding-bottom: 4px;
}

.section-title .emoji {
  font-size: 24px;
  margin-bottom: 2px;
}

/* ✅ 아바타 */
.user-avatar {
  width: 100px;
  height: 100px;
  margin: 10px auto;
  background-color: #2e7d32;
  color: white;
  border-radius: 50%;
  font-size: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 50%;
  margin: 10px 0;
}

/* ✅ 버튼 */
.button-group {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 16px 0;
}

.logout {
  background-color: #1976d2;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.delete {
  background-color: #e53935;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

/* ✅ 캘린더 */
.calendar-section {
  margin-top: 30px;
  text-align: center;
}

.calendar-title {
  margin-bottom: 10px;
  font-size: 15px;
}
</style>
