<template>
  <div id="app" class="outer-wrapper">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(() => {
  const token = localStorage.getItem("token");

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const exp = payload.exp * 1000;
      const now = Date.now();

      if (now > exp) {
        alert(" 로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
      } else {
        // 남은 시간 후 자동 로그아웃 예약
        setTimeout(() => {
          alert(" 세션이 만료되어 로그아웃되었습니다.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/login");
        }, exp - now);
      }
    } catch (err) {
      console.error(" JWT 토큰 파싱 오류:", err);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
    }
  }
});
</script>

<style>
body,
#app {
  margin: 0;
  padding: 0;
  background-color: #eaf4ff;
  font-family: 'Segoe UI', sans-serif;
}

.outer-wrapper {
  display: flex;
  justify-content: center;
  padding: 40px 20px;
  box-sizing: border-box;
}

.card-wrapper {
  background-color: #ffffff;
  border-radius: 24px;
  padding: 48px;
  width: 100%;
  max-width: 1400px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
}

.section-title-wrapper {
  margin-bottom: 16px;
}

.section-title {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 12px;
  padding-left: 4px;
}

.white-card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  max-width: 1000px;
  width: 100%;
  margin: 0 auto 24px;
}
</style>
