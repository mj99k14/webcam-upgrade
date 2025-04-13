<template>
  <p :class="['summary-remark', colorClass]">{{ message }}</p>
</template>

<script>
export default {
  name: 'AnalysisComment',
  props: {
    highAngleRatio: {
      type: [String, Number],
      required: true
    },
    shoulderAvg: {
      type: Number,
      required: true
    }
  },
  computed: {
    message() {
      const angle = parseFloat(this.highAngleRatio) || 0;
      const shoulder = this.shoulderAvg || 0;

      // 범위 기준
      const angleBad = angle >= 50;
      const angleNeedsAttention = angle >= 20;
      const shoulderBad = shoulder >= 20;
      const shoulderNeedsAttention = shoulder >= 10;

      if (angleBad && shoulderBad) {
        return '🔴 분석 결과: 거북목과 어깨 모두 개선이 시급한 상태입니다.';
      } else if (angleBad) {
        return '🔴 분석 결과: 거북목 자세가 시급히 개선되어야 합니다.';
      } else if (shoulderBad) {
        return '🔴 분석 결과: 어깨 균형이 심각하게 틀어져 있습니다.';
      } else if (angleNeedsAttention && shoulderNeedsAttention) {
        return '🟡 분석 결과: 거북목과 어깨 모두 개선이 필요합니다.';
      } else if (angleNeedsAttention) {
        return '🟡 분석 결과: 거북목 자세가 다소 관찰됩니다.';
      } else if (shoulderNeedsAttention) {
        return '🟡 분석 결과: 어깨가 다소 틀어져 있습니다.';
      } else {
        return '🟢 분석 결과: 현재 자세가 양호한 편입니다.';
      }
    },
    colorClass() {
      const angle = parseFloat(this.highAngleRatio) || 0;
      const shoulder = this.shoulderAvg || 0;

      if (angle >= 50 || shoulder >= 20) {
        return 'danger';
      } else if (angle >= 20 || shoulder >= 10) {
        return 'warning';
      } else {
        return 'safe';
      }
    }
  }
};
</script>

<style scoped>
.summary-remark {
  text-align: center;
  font-size: 18px;
  margin: 20px 0;
  font-weight: 600;
}

/* 상태별 색상 강조 */
.danger {
  color: #d32f2f;
}

.warning {
  color: #f9a825;
}

.safe {
  color: #388e3c;
}
</style>
