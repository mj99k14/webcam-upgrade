<template>
    <div class="feedback-card">
      <h3>
        📅 오늘의 자세 피드백
         <span v-if="formattedDate">({{ formattedDate }})</span>
      </h3>
  
      <div v-if="posture">
        <ul>
          <li>
             평균 목 각도: {{ posture.average_neck_angle?.toFixed(1) || '정보 없음' }}°
          </li>
          <li>
            최대 목 각도: {{ posture.max_neck_angle?.toFixed(1) || '정보 없음' }}°
            <span v-if="posture.max_neck_angle >= 135">⚠️ (높음)</span>
          </li>
          <li>
            어깨 상태: {{ posture.shoulder_status || '정보 없음' }}
            ({{ posture.shoulder_diff?.toFixed(1) || '0.0' }}px)
          </li>
        </ul>
        <p class="feedback-msg">{{ feedbackMessage }}</p>
      </div>
  
      <div v-else class="no-data-msg">
        😴 최근 측정 데이터가 없습니다. 먼저 측정해보세요!
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: ['userId'],
    data() {
      return {
        posture: null,
      };
    },
    watch: {
      userId(newVal) {
        if (newVal) {
          console.log('🟢 userId 감지됨:', newVal);
          this.fetchLatestPosture();
        }
      }
    },
    computed: {
      formattedDate() {
        const measured = this.posture?.measured_at;
        if (!measured) return '';
        try {
          const date = new Date(measured);
          return new Intl.DateTimeFormat('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }).format(date);
        } catch (err) {
          console.warn('⚠️ 날짜 포맷 에러:', err);
          return '';
        }
      },
      feedbackMessage() {
        if (!this.posture) return '';
        const { max_neck_angle, shoulder_status } = this.posture;
  
        let msg = '';
        if (max_neck_angle >= 135) {
          msg += '👉 최대 목 각도가 높습니다. 거북목에 유의하세요.\n';
        }
        if (shoulder_status?.includes('높음')) {
          msg += '👉 어깨 균형이 맞지 않습니다. 교정 운동을 추천드립니다.';
        }
        return msg || '✔️ 현재 자세가 전반적으로 양호합니다!';
      }
    },
    mounted() {
      console.log('📥 TodayFeedback mounted. userId:', this.userId);
      // fetch는 watch에서 처리
      if (this.userId) {
        this.fetchLatestPosture(); 
      }
    },
    methods: {
      async fetchLatestPosture() {
        if (!this.userId) return;
        try {
          const url = `http://210.101.236.158:5000/api/posture/latest/${this.userId}`;
          console.log('📡 API 호출 주소:', url);
  
          const res = await fetch(url);
          const json = await res.json();
  
          console.log('📦 API 응답:', json);
          if (json.success && json.data) {
            this.posture = json.data;
            console.log('✅ posture 저장됨:', this.posture);
          } else {
            console.warn('⚠️ posture 데이터 없음 또는 실패');
          }
        } catch (err) {
          console.error('❌ posture 불러오기 실패:', err);
        }
      },
    },
  };
  </script>
  
  <style scoped>
.feedback-card {
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-left: 6px solid #42a5f5; /* 강조색 줄 */
  padding: 20px 24px;
  margin-bottom: 24px;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  text-align: center;
  font-size: 1.05rem;
  transition: all 0.2s ease-in-out;
}

.feedback-card:hover {
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
}

.feedback-card h3 {
  margin-bottom: 16px;
  font-size: 1.2rem;
  color: #1565c0;
  font-weight: 600;
}

.feedback-card ul {
  list-style: none;
  padding: 0;
  margin: 0 auto;
  display: inline-block;
  text-align: left;
  font-size: 1.02rem;
}

.feedback-card li {
  margin-bottom: 10px;
  padding-left: 8px;
  position: relative;
}

.feedback-card li::before {
  content: '•';
  color: #1976d2;
  font-weight: bold;
  position: absolute;
  left: -12px;
}

.feedback-msg {
  margin-top: 14px;
  padding: 10px 14px;
  border-radius: 8px;
  font-weight: bold;
  color: #b71c1c;
  background-color: #ffebee;
  border: 1px solid #ffcdd2;
  white-space: pre-wrap;
  line-height: 1.5;
  text-align: center;
}

.no-data-msg {
  margin-top: 16px;
  font-style: italic;
  color: #9e9e9e;
  font-size: 0.95rem;
}

  </style>
  