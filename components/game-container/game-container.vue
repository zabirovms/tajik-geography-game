<template>
  <view class="container">
    <!-- 游戏说明 -->
    <view class="game-instructions" v-if="!isGameReady">
      <text class="instructions-title">游戏说明</text>
      <text class="instructions-content">在这个游戏中，您将根据题目猜测正确的国旗。每答对一题，您将获得分数。祝您好运！</text>
    </view>

    <!-- 状态栏 -->
    <view class="status-bar" v-if="isGameReady">
      <view class="status-item">
        <uni-icons :type="scoreIcon" size="20" color="#FFC107"></uni-icons>
        <text>{{ score }}分</text>
      </view>
      <view class="status-item">
        <uni-icons :type="gameIcon" size="20" color="#4CAF50"></uni-icons>
        <text>{{ currentQuestionIndex + 1 }}/{{ totalQuestions }}</text>
      </view>
      <view class="status-item">
        <text>{{ remainingTime }}s</text>
      </view>
    </view>

    <!-- 成就系统 -->
    <view class="achievements" v-if="isGameReady">
      <text class="achievements-title">成就</text>
      <text class="achievements-content">最高分: {{ highScore }}分</text>
    </view>

    <!-- 游戏内容区域 -->
    <view class="game-content" v-if="isGameReady && !isLoading">
      <view class="game-type">
        <text>{{ gameTitle }}</text>
      </view>

      <!-- 题目展示区 -->
      <view class="question-area">
        <template v-if="isCapitalGame && !isImageOptions">
            <text class="question-text">{{ currentQuestion.questionText }}</text> <!-- 仅显示题目文字 -->
        </template>
		<template v-else-if="!isCapitalGame && isImageOptions">
		    <text class="question-text">{{ currentQuestion.questionText }}</text> <!-- 仅显示题目文字 -->
		</template>
        <template v-else>
            <image
                v-if="currentQuestion" 
                :src="currentQuestion.imageUrl" 
                mode="aspectFit" 
                class="question-image"
            />
        </template>
      </view>

      <!-- 选项区域 -->
      <view class="options-area" :class="{ 'image-options': isImageOptions }">
        <view 
          class="option-item"
          v-for="(option, index) in currentQuestion?.options"
          :key="index"
          :class="{
            'correct': showAnswer && option === currentQuestion.answer,
            'wrong': showAnswer && option === selectedAnswer && option !== currentQuestion.answer,
            'disabled': showAnswer
          }"
          @tap="!showAnswer && handleAnswer(option)"
        >
          <template v-if="isImageOptions">
            <image :src="option" mode="aspectFit" class="option-image" />
          </template>
          <template v-else>
            <text>{{ option }}</text>
          </template>
        </view>
      </view>
    </view>

    <!-- 加载动画 -->
    <view v-if="isLoading" class="loading">
      <uni-load-more status="loading" :iconSize="24" />
    </view>

    <!-- 结果弹窗 -->
    <uni-popup ref="resultPopup" type="center">
      <view class="result-box">
        <view class="result-header">
          <uni-icons type="medal-filled" size="50" color="#FFC107"></uni-icons>
          <text class="result-title">游戏结束</text>
        </view>
        <view class="result-content">
          <view class="result-item">
            <text>得分</text>
            <text class="score">{{ score }}</text>
          </view>
          <view class="result-item">
            <text>正确率</text>
            <text class="percent">{{ accuracy }}%</text>
          </view>
          <view class="result-item">
            <text>建议</text>
            <text class="feedback">{{ feedbackMessage }}</text>
          </view>
        </view>
        <view class="result-buttons">
          <button class="btn-share" @tap="shareScore">
            <uni-icons type="share" size="16" color="#fff"></uni-icons>
            分享成绩
          </button>
          <button class="btn-restart" @tap="restart">
            <uni-icons type="refresh" size="16" color="#fff"></uni-icons>
            重新开始
          </button>
          <button class="btn-home" @tap="goHome">
            <uni-icons type="home" size="16" color="#666"></uni-icons>
            返回首页
          </button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
export default {
  name: 'GameContainer',
  
  props: {
    gameIcon: {
      type: String,
      default: 'flag'
    },
    scoreIcon: {
      type: String,
      default: 'medal'
    },
    gameTitle: {
      type: String,
      required: true
    },
    questions: {
      type: Array,
      required: true
    },
    totalQuestions: {
      type: Number,
      default: 10
    },
    timeLimit: {
      type: Number,
      default: 0
    },
    isImageOptions: {
      type: Boolean,
      default: false
    },
	gameType: {
	   type: String,
	   required: true
	}
  },

  data() {
    return {
      isGameReady: false,
      isLoading: false,
      score: 0,
      currentQuestionIndex: 0,
      remainingTime: this.timeLimit > 0 ? this.timeLimit : 0,
      timer: null,
      showAnswer: false,
      selectedAnswer: '',
      currentQuestion: null,
      accuracy: 0,
      highScore: 0,
      feedbackMessage: ''
    }
  },

  watch: {
    questions: {
      immediate: true,
      handler(newQuestions) {
        this.isLoading = true;
        if (newQuestions && newQuestions.length > 0) {
          this.isGameReady = true;
          this.initGame();
        }
        this.isLoading = false;
      }
    }
  },
 computed: {
    isCapitalGame() {
      return this.gameType === 'capital';
    }
  },
  methods: {
    initGame() {
      this.isGameReady = true;
      this.score = 0;
      this.currentQuestionIndex = 0;
      this.showAnswer = false;
      this.nextQuestion();
      this.highScore = Math.max(this.highScore, this.score);
    },

    nextQuestion() {
      if (this.currentQuestionIndex >= this.totalQuestions) {
        this.endGame();
        return;
      }

      this.currentQuestion = this.questions[this.currentQuestionIndex];
      if (!this.currentQuestion) {
        this.endGame();
        return;
      }

      this.showAnswer = false;
      this.selectedAnswer = '';
      this.startTimer();
    },

    startTimer() {
      this.clearTimer();
      if (this.timeLimit > 0) {
        this.remainingTime = this.timeLimit;
        this.timer = setInterval(() => {
          this.remainingTime--;
          if (this.remainingTime <= 0) {
            this.handleAnswer(null);
          }
        }, 1000);
      }
    },

    clearTimer() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },

    handleAnswer(selected) {
      this.clearTimer();
      this.showAnswer = true;
      this.selectedAnswer = selected;

      if (selected === this.currentQuestion.answer) {
        this.score += this.remainingTime;
        uni.vibrateShort();
      } else {
        uni.vibrateLong();
      }

      setTimeout(() => {
        this.currentQuestionIndex++;
        this.nextQuestion();
      }, 1500);
    },

    endGame() {
      this.isGameReady = false;
      this.accuracy = Math.round((this.score / (this.totalQuestions * this.timeLimit)) * 100);
      this.feedbackMessage = this.generateFeedbackMessage(this.accuracy);
      this.$refs.resultPopup.open();
    },

    generateFeedbackMessage(correctRate) {
      if (correctRate >= 80) {
        return "表现优秀！继续保持！";
      } else if (correctRate >= 50) {
        return "不错，但还有提升空间。";
      } else {
        return "建议多练习，提升你的技能！";
      }
    },

    restart() {
      this.$refs.resultPopup.close();
      this.isGameReady = false;
      this.initGame();
    },

    goHome() {
      uni.navigateBack();
    },

    loadQuestions() {
      this.isLoading = true;
      // 加载题目数据的逻辑
      // 如果加载失败
      this.isGameReady = false; // 设置为 false
      this.isLoading = false; // 加载完成
    },

    shareScore() {
        const shareMessage = `我在游戏中获得了 ${this.score} 分，正确率为 ${this.accuracy}%。快来挑战一下吧！`;

        // 使用小程序的分享功能
        uni.share({
            title: '我的游戏成绩',
            content: shareMessage,
            // 小程序的路径可以根据需要设置
            path: '/pages/index/index', // 替换为你的页面路径
            success: () => {
                uni.showToast({
                    title: '分享成功！',
                    icon: 'success'
                });
            },
            fail: () => {
                uni.showToast({
                    title: '分享失败，请重试。',
                    icon: 'none'
                });
            }
        });
    },
  },
  
  beforeDestroy() {
    this.clearTimer();
  },

  mounted() {

  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%);
  padding: 30rpx;
}

/* 状态栏样式 */
.status-bar {
  display: flex;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.9);
  padding: 20rpx 30rpx;
  border-radius: 16rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
}

.status-item {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

/* 游戏内容区域样式 */
.game-content {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.08);
  margin-bottom: 40rpx;
}

.game-type {
  text-align: center;
  margin-bottom: 30rpx;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

/* 题目展示区域 */
.question-area {
  height: 400rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 40rpx;
  background: #f0f0f0;
  border-radius: 8rpx;
  padding: 20rpx;
}

.question-image {
  max-width: 100%;
  max-height: 100%;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
}

/* 选项区域样式 */
.options-area {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.option-item {
  background: #f8f9fa;
  padding: 30rpx;
  border-radius: 12rpx;
  text-align: center;
  font-size: 28rpx;
  color: #333;
  transition: all 0.3s;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.option-item:active {
  transform: scale(0.98);
}

.option-item.correct {
  background: #4CAF50;
  color: white;
}

.option-item.wrong {
  background: #FF5252;
  color: white;
}

.option-item.disabled {
  pointer-events: none;
}

/* 结果弹窗样式 */
.result-box {
  background: #ffffff; /* 背景颜色 */
  padding: 40rpx;
  border-radius: 20rpx;
  width: 600rpx;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1); /* 添加阴影 */
  text-align: center; /* 中心对齐 */
}

.result-header {
  text-align: center;
  margin-bottom: 30rpx;
}

.result-title {
  font-size: 36rpx;
  font-weight: bold;
  margin-top: 20rpx;
  display: block;
  color: #333; /* 标题颜色 */
}

.result-content {
  margin: 40rpx 0;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  font-size: 32rpx;
  color: #555; /* 结果项颜色 */
}

.result-item .score,
.result-item .percent {
  font-weight: bold;
  color: #2979FF; /* 分数和正确率颜色 */
}

/* 按钮样式 */
.result-buttons {
  display: grid;
  gap: 20rpx;
}

.btn-restart,
.btn-home {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  padding: 20rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  border: none;
  transition: background 0.3s; /* 添加过渡效果 */
}

.btn-restart {
  background: #2979FF; /* 重新开始按钮颜色 */
  color: white;
}

.btn-home {
  background: #f5f5f5; /* 返回首页按钮颜色 */
  color: #666;
}

.btn-restart:active,
.btn-home:active {
  transform: scale(0.98);
  opacity: 0.9;
}

/* 按钮悬停效果 */
.btn-restart:hover {
  background: #1e88e5; /* 悬停时颜色变化 */
}

.btn-home:hover {
  background: #e0e0e0; /* 悬停时颜色变化 */
}

/* 添加加载状态样式 */
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400rpx;
}

.image-options {
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.option-image {
  width: 100%;
  height: 200rpx;
  object-fit: contain;
}

.question-text {
  font-size: 24rpx;
  text-align: center;
  margin: 10rpx 0;
}

/* 响应式设计示例 */
@media (max-width: 600rpx) {
  .question-text {
    font-size: 20rpx; /* 小屏幕下更小的字体 */
  }
  .btn-restart, .btn-home {
    font-size: 24rpx; /* 按钮字体大小 */
  }
}

/* 按钮悬停效果 */
.btn-restart:hover,
.btn-home:hover {
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
}

/* 选项悬停效果 */
.option-item:hover {
  transform: scale(1.02); /* 悬停时放大 */
}

/* 动画效果 */
.option-item {
  transition: transform 0.2s;
}

.flag-question-text {
  font-size: 28rpx; /* 增加字体大小以适应国旗选项 */
  text-align: center;
  margin: 10rpx 0;
}

/* 统一字体样式 */
body {
  font-family: 'Arial', sans-serif; /* 统一字体 */
}

/* 增强可读性 */
.text {
  line-height: 1.5; /* 行高 */
  letter-spacing: 0.5px; /* 字间距 */
}

/* 状态栏图标的大小 */
.status-item uni-icons {
  size: 24; /* 调整图标大小 */
}

/* 选项的反馈效果 */
.option-item:active {
  background: #e0e0e0; /* 选中时的背景色 */
}

/* 结果弹窗的动画 */
.result-box {
  transition: opacity 0.3s ease; /* 添加淡入淡出效果 */
}

/* 背景色的对比度 */
.container {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%); /* 确保背景色与文本颜色对比 */
}

/* 游戏说明样式 */
.game-instructions {
  background: rgba(255, 255, 255, 0.9);
  padding: 20rpx;
  border-radius: 10rpx;
  margin-bottom: 20rpx;
}

.instructions-title {
  font-size: 24rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.instructions-content {
  font-size: 20rpx;
}

/* 成就样式 */
.achievements {
  background: rgba(255, 255, 255, 0.9);
  padding: 20rpx;
  border-radius: 10rpx;
  margin-bottom: 20rpx;
}

.achievements-title {
  font-size: 24rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.achievements-content {
  font-size: 20rpx;
}
</style>