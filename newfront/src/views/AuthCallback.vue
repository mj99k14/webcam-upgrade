<template>
  <div class="loading-container">
    <div class="loader"></div>
    <h2>로그인 처리 중입니다...</h2>
    <p>잠시만 기다려 주세요 😊</p>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from "vue-router";
import { onMounted } from "vue";

const router = useRouter();
const route = useRoute();

// ✅ 로그인 후 인증 코드 처리
onMounted(async () => { //페이지가 열렸을떄 실행되는 코드
  const code = route.query.code;

  if (!code) {
    alert("인증 코드가 없습니다.");
    router.push("/login");
    return;
  }

  try {
    const response = await fetch("http://210.101.236.158:5000/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    const data = await response.json();

    if (data.success) {
      alert("로그인 성공!");
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      router.push("/myprofile");
    } else if (data.message === "회원가입이 필요합니다.") {
      const confirmRegister = confirm("등록된 정보가 없습니다. 회원가입 하시겠습니까?");
      if (confirmRegister) {
        router.push({
          path: "/register",
          query: { email: data.email, name: data.name, picture: data.picture },
        });
      } else {
        router.push("/login");
      }
    } else {
      alert("로그인 실패: " + data.message);
      router.push("/login");
    }
  } catch (error) {
    console.error("❌ Google 로그인 처리 오류:", error);
    alert("로그인 처리 중 오류가 발생했습니다.");
    router.push("/login");
  }
});
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  font-family: "Segoe UI", sans-serif;
  background-color: #f5f8fb;
  color: #333;
}

.loader {
  border: 6px solid #f3f3f3;
  border-top: 6px solid #4285f4;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
