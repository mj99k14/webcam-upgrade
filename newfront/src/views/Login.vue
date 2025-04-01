<template>
  <div class="container">
    <h1>Google login</h1>
    <button @click="handleGoogleLogin">Google 로그인</button>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const errorMessage = ref("");
const googleLoaded = ref(false);

// ✅ Google API 로드 함수
const loadGoogleAPI = async () => {
  if (window.google) {
    console.log("✅ Google API 이미 로드됨");
    googleLoaded.value = true;
    return;
  }

  return new Promise((resolve, reject) => { //비동기 작업 처리리
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log("Google API 로드 성공!");
      googleLoaded.value = true;
      resolve();// 성공했을때
    };
    script.onerror = () => {
      console.error("❌ Google API 로드 실패");
      reject();//실패했을때
    };

    document.head.appendChild(script); //html에 붙침
  });
};

//  페이지 로드 시 Google API 로드
onMounted(() => { //맨처음으로 뜸
  loadGoogleAPI();
});

// ✅ Google 로그인 처리
const handleGoogleLogin = () => {
  if (!googleLoaded.value) {
    alert("Google API가 로드되지 않았습니다. 페이지를 새로고침하세요.");
    return;
  }

  const client = google.accounts.oauth2.initCodeClient({
    client_id: "446715005253-c6g8ue0ibnj7s7gusshngdjloe36dn5v.apps.googleusercontent.com",
    scope: "email profile", // 구글에서 접근할 범위위
    redirect_uri: "http://localhost:5173/auth/callback",
    ux_mode: "redirect", // 자동으로 페이지 (주소) 보냄
    callback: (response) => {
      if (!response.code) {
        alert("Google 로그인 실패: 인증 코드를 받지 못했습니다.");
        return;
      }

      //  인증 코드를 백엔드로 전송하여 액세스 토큰 교환
      fetch("http://210.101.236.158:5000/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: response.code }),
      })
        .then(res => res.json()) //성공했을때
        .then(data => { //성공했을떄 
          if (data.success) {
            alert("로그인 성공!");
            localStorage.setItem("token", data.token); //  토큰 저장
            localStorage.setItem("user", JSON.stringify(data.user));
            router.push("/myprofile"); // 마이페이지로 이동
          } else if (data.message === "회원가입이 필요합니다.") {
            router.push({
              path: "/register",
              query: { email: data.email, name: data.name, picture: data.picture }
            });
          } else {
            alert("로그인 실패: " + data.message);
          }
        })
        .catch(error => {   //실패
          console.error("Google 로그인 요청 실패:", error);
          errorMessage.value = "Google 로그인 요청 실패!";
        });
    }
  });

  client.requestCode(); // Google 로그인 요청
};
</script>

<style scoped>
/* ✅ 중앙 정렬을 위한 스타일 추가 */
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh; /* 화면 전체 높이 */
  text-align: center;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  background-color: #4285F4;
  color: white;
  border: none;
  border-radius: 5px;
  margin-top: 10px;
}

button:hover {
  background-color: #357ae8;
}

.error {
  color: red;
  margin-top: 10px;
}
</style>
