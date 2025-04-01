<template>
    <div>
      <h1>회원가입</h1>
      <form @submit.prevent="handleRegister">
        <label>이메일</label>
        <input v-model="user.email" type="email" readonly />
  
        <label>이름</label>
        <input v-model="user.name" type="text" required />
  
        <label>프로필 사진</label>
        <img :src="user.picture" alt="Profile" width="100" />
        
        <button type="submit">회원가입</button>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from "vue";
  import { useRouter, useRoute } from "vue-router";
  
  const router = useRouter();
  const route = useRoute();
  const user = ref({
    email: "",
    name: "",
    picture: ""
  });
  
  // ✅ 로그인 후 회원가입 정보 채우기
  onMounted(() => {
    user.value.email = route.query.email || "";
    user.value.name = route.query.name || "";
    user.value.picture = route.query.picture || "";
  });
  
  // ✅ 회원가입 처리
  const handleRegister = async () => {
    try {
      const response = await fetch("http://210.101.236.158:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user.value)
      });
  
      const data = await response.json();
      
      if (data.success) {
        alert("회원가입 성공! 이제 로그인하세요.");
        router.push("/login");
      } else {
        alert("회원가입 실패: " + data.message);
      }
    } catch (error) {
      console.error("회원가입 오류:", error);
    }
  };
  </script>
  
  