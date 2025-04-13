<template>
  <!-- ✅ 카드 전체 -->
  <div class="white-card">
    <div class="section-title-wrapper">
      <h2 class="section-title"><span class="emoji">🧑‍💻</span> 마이 페이지</h2>
    </div>

    <h3>{{ user.name }} 님 환영합니다</h3>

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

    <div class="button-group">
      <button class="logout" @click="$emit('logout')">로그아웃</button>
      <button class="delete" @click="$emit('deleteAccount')">회원 탈퇴</button>
    </div>

    <div class="calendar-section">
      <p class="calendar-title"><strong>📅 이번달 자세</strong></p>
      <MiniCalendar :stats="calendarStats" />
    </div>
  </div>
</template>


<script>
import MiniCalendar from '../calendar/MiniCalendar.vue';

export default {
  components: { MiniCalendar },
  props: {
    user: { type: Object, required: true },
    calendarStats: { type: Array, default: () => [] }
  }
};
</script>

<style scoped>
.white-card {
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

/* ✅ 제목 스타일 (공통화) */
.section-title-wrapper {
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 22px;
  font-weight: 700;
  color: #1976d2;
  padding-left: 4px;
  border-bottom: 3px solid #42a5f5;
}

.section-title .emoji {
  font-size: 22px;
  margin-bottom: 2px;
}

/* ✅ 사용자 정보 */
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
