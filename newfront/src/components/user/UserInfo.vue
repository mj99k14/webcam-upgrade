<template>
<div class="section-header">
  <h2 class="section-title"><span class="emoji">🧑‍💻</span> 마이 페이지</h2>
</div>
  <div class="left">
    <h3>{{ user.name }} 님 환영합니다</h3>

    <!-- 프로필 -->
    <div class="avatar-circle" v-if="!user.profile_image">
      {{ user.name?.slice(0, 2) || '유저' }}
    </div>
    <img
      v-else
      :src="user.profile_image"
      alt="프로필 사진"
      class="profile-img"
    />

    <p><strong>이름:</strong> {{ user.name || '정보 없음' }}</p>
    <p><strong>이메일:</strong> {{ user.email || '정보 없음' }}</p>

    <!-- 버튼 한 줄 -->
    <div class="button-group">
      <button class="logout" @click="$emit('logout')">로그아웃</button>
      <button class="delete" @click="$emit('deleteAccount')">회원 탈퇴</button>
    </div>

    <!-- 📅 미니 캘린더 -->
    <div class="calendar-section">
      <p class="calendar-title"><strong>📅 이번달 자세</strong></p>
      <MiniCalendar :stats="calendarStats" />
    </div>
  </div>
</template>

<script>
// ✅ 이렇게 되어 있어야 정상
import MiniCalendar from '../calendar/MiniCalendar.vue';

export default {
  components: { MiniCalendar },
  props: {
    user: { type: Object, required: true },
    calendarStats: { type: Array, required: false, default: () => [] }
  }
};
</script>

<style scoped>
.left {
  flex: 1;
  background-color: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  text-align: center;
  font-family: 'Segoe UI', sans-serif;
}

.avatar-circle {
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


.calendar-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* ✅ 4칸씩 */
  gap: 6px;
  margin-top: 10px;
}
.day {
  padding: 6px;
  text-align: center;
  border-radius: 6px;
  font-weight: bold;
  font-size: 12px;
  line-height: 1.4;
}
.calendar-section {
  margin-top: 30px; /* 캘린더 위 간격 */
  text-align: center;
}

.calendar-title {
  margin-bottom: 10px; /* 제목과 캘린더 사이 여백 */
  font-size: 15px;
}


</style>
