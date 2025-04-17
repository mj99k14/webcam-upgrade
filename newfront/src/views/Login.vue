<template>
  <div class="login-wrapper">
    <div class="login-card">
      <h1 class="program-title">🏃 Yarimasu 신체 측정 프로그램</h1>
      <div class="subtitle">Google 계정으로 간편하게 시작하세요</div>

      <button class="google-btn" @click="redirectToGoogle">
        <img
          src="https://developers.google.com/identity/images/g-logo.png"
          alt="Google logo"
          class="google-icon"
        />
        <span>Google로 로그인</span>
      </button>
    </div>
  </div>
</template>

<script setup>
const redirectToGoogle = () => {
  const clientId = "446715005253-c6g8ue0ibnj7s7gusshngdjloe36dn5v.apps.googleusercontent.com";
  const redirectUri = "http://localhost:5173/auth/callback";
  const scope = "profile email";
  const responseType = "code";
  const accessType = "offline";

  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&access_type=${accessType}`;
  window.location.href = url;
};
</script>
<style scoped>
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

.login-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(145deg, #dbeafe, #e0f2fe);
}

.login-card {
  background: white;
  padding: 48px 40px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 100%;
  max-width: 480px;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(24px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.program-title {
  font-size: 30px;
  font-weight: 800;
  color: #1d4ed8;
  margin-bottom: 12px;
}

.subtitle {
  font-size: 15px;
  color: #6b7280;
  margin-bottom: 28px;
}

.google-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background-color: #4285f4;
  color: white;
  padding: 14px 20px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  width: 100%;
}

.google-btn:hover {
  background-color: #357ae8;
  transform: translateY(-2px);
}

.google-icon {
  width: 20px;
  height: 20px;
}
</style>


