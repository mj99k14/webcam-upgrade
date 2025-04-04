<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="title">Google 로그인</div>
      <button class="google-btn" @click="handleGoogleLogin">
        <img
          src="https://developers.google.com/identity/images/g-logo.png"
          alt="Google logo"
          class="google-icon"
        />
        Google로 로그인
      </button>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const errorMessage = ref("");
const googleLoaded = ref(false);

// ✅ Google API 로드
const loadGoogleAPI = async () => {
  if (window.google) {
    googleLoaded.value = true;
    return;
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      googleLoaded.value = true;
      resolve();
    };
    script.onerror = () => {
      reject();
    };

    document.head.appendChild(script);
  });
};

onMounted(() => {
  loadGoogleAPI();
});

// ✅ Google 로그인 처리
const handleGoogleLogin = () => {
  if (!googleLoaded.value) {
    alert("Google API가 로드되지 않았습니다. 페이지를 새로고침하세요.");
    return;
  }

  const client = google.accounts.oauth2.initCodeClient({
    client_id:
      "446715005253-c6g8ue0ibnj7s7gusshngdjloe36dn5v.apps.googleusercontent.com",
    scope: "email profile",
    redirect_uri: "http://localhost:5173/auth/callback",
    ux_mode: "redirect",
    callback: (response) => {
      if (!response.code) {
        alert("Google 로그인 실패: 인증 코드를 받지 못했습니다.");
        return;
      }

      fetch("http://210.101.236.158:5000/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: response.code }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            alert("로그인 성공!");
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            router.push("/myprofile");
          } else if (data.message === "회원가입이 필요합니다.") {
            router.push({
              path: "/register",
              query: {
                email: data.email,
                name: data.name,
                picture: data.picture,
              },
            });
          } else {
            alert("로그인 실패: " + data.message);
          }
        })
        .catch((error) => {
          console.error("Google 로그인 요청 실패:", error);
          errorMessage.value = "Google 로그인 요청 실패!";
        });
    },
  });

  client.requestCode();
};
</script>

<style scoped>
/* 전체 배경 및 중앙 정렬 */
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  padding: 0 20px;
}

/* 카드 스타일 */
.login-card {
  background: white;
  padding: 40px 50px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  text-align: center;
  width: 100%;
  max-width: 400px;
}

/* 제목 글씨 크게 */
.title {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 24px;
}

/* Google 로그인 버튼 */
.google-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background-color: #4285f4;
  color: white;
  padding: 12px 24px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 100%;
  max-width: 260px;
  margin: 0 auto;
}

.google-btn:hover {
  background-color: #357ae8;
}

.google-icon {
  width: 20px;
  height: 20px;
}

/* 에러 메시지 */
.error {
  color: red;
  margin-top: 15px;
  font-size: 14px;
}
</style>
