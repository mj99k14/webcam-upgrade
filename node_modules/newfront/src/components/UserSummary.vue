<template>
    <div class="user-summary">
    <h3>📝 오늘의 요약</h3>
      <hr />
      <p>📸 <strong>최근 업로드:</strong> {{ latestUpload }}</p>
      <p>📈 <strong>이번 주 업로드:</strong> {{ weeklyCount }}회</p>
      <p>👍 <strong>자세 피드백:</strong> {{ feedback }}</p>
      <p>🕒 <strong>다음 측정 추천:</strong> {{ nextCheck }}</p>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      photos: {
        type: Array,
        required: true
      }
    },
    computed: {
      latestUpload() {
        if (!this.photos.length) return '없음';
        const latest = new Date(this.photos[0].uploaded_at);
        return latest.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
      },
      weeklyCount() {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return this.photos.filter(p => new Date(p.uploaded_at) > oneWeekAgo).length;
      },
      feedback() {
        // TODO: 실제 분석 값 기반으로 바꾸기
        return this.photos.length > 0 ? '정상 자세' : '측정 필요';
      },
      nextCheck() {
        if (!this.photos.length) return '측정 필요';
        const last = new Date(this.photos[0].uploaded_at);
        last.setDate(last.getDate() + 3);
        return last.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
      }
    }
  };
  </script>
  
  <style scoped>
  .user-summary {
    min-height: 180px;
    margin-top: 20px;
    font-size: 14px;
    color: #333;
    line-height: 1.6;
    background-color: #f8fbff;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid #ddeeff;
  }
  .user-summary hr {
    margin-bottom: 12px;
    border: none;
    border-top: 1px solid #ccc;
  }
  </style>
  