<template>
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

    <!-- 캘린더 삽입 -->
    <MiniCalendar :stats="calendarStats" />
  </div>
</template>

<script>
import MiniCalendar from './MiniCalendar.vue';

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
</style>
