<template>
  <div class="loading-container">
    <div class="loader"></div>
    <h2>로그인 처리 중입니다...</h2>
    <p>잠시만 기다려 주세요 </p>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from "vue-router";
import { onMounted } from "vue";

const router = useRouter();
const route = useRoute();

onMounted(async () => {
  const code = route.query.code;

  if (!code) {
    alert(" 인증 코드가 없습니다.");
    router.push("/login");
    return;
  }

  try {
    const res = await fetch("http://210.101.236.158:5000/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      alert(" 로그인 성공!");
      router.push("/myprofile");
    } else if (data.message === "회원가입이 필요합니다.") {
      const confirmJoin = confirm("등록된 정보가 없습니다. 회원가입 하시겠습니까?");
      if (confirmJoin) {
        router.push({
          path: "/register",
          query: {
            email: data.email,
            name: data.name,
            picture: data.picture,
          },
        });
      } else {
        router.push("/login");
      }
    } else {
      alert(" 로그인 실패: " + data.message);
      router.push("/login");
    }
  } catch (err) {
    console.error(" 로그인 처리 중 오류:", err);
    alert("서버와의 통신 중 오류가 발생했습니다.");
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
  width: 100vw;
  padding: 24px;
  text-align: center;

  background-color: #eaf4ff;
  font-family: "Segoe UI", sans-serif;
  color: #2c3e50;
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

h2 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 12px;
}

p {
  font-size: 16px;
  color: #555;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
