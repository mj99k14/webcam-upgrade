<template>
    <div class="left">
      <h2>{{ user.name }} 님 환영합니다</h2>
      <img :src="user.profile_image" alt="프로필 사진" class="profile-img" v-if="user.profile_image" />
      <p>이름: {{ user.name || '정보 없음' }}</p>
      <p>이메일: {{ user.email || '정보 없음' }}</p>
      <button @click="$emit('logout')">로그아웃</button>
      <button @click="$emit('deleteAccount')">회원 탈퇴</button>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      user: {
        type: Object,
        required: true
      }
    }
  };
  </script>
  
  <style scoped>
  .left {
    flex: 1;
    background-color: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    text-align: center;
  }
  .profile-img {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    margin: 10px 0;
  }
  </style>