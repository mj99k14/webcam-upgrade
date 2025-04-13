<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="title">Google 로그인</div>
      <button class="google-btn" @click="redirectToGoogle">
        <img
          src="https://developers.google.com/identity/images/g-logo.png"
          alt="Google logo"
          class="google-icon"
        />
        Google로 로그인
      </button>
    </div>
  </div>
</template>

<script setup>
// ✅ 구글 로그인으로 직접 이동 (프론트 → 구글)
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
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  padding: 0 20px;
}

.login-card {
  background: white;
  padding: 40px 50px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  text-align: center;

  width: 600px;         /* ✅ 넓이 고정 */
  max-width: none;      /* ✅ 제한 해제 */
}

.title {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 24px;
}

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
</style>
