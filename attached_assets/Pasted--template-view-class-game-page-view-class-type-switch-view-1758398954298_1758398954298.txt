<template>
  <view class="game-page">
    <!-- 游戏类型切换 -->
    <view class="type-switch">
      <view 
        class="type-item" 
        :class="{ active: gameType === 'country' }"
        @tap="switchType('country')"
      >
        <text>国家</text>
      </view>
      <view 
        class="type-item" 
        :class="{ active: gameType === 'state' }"
        @tap="switchType('state')"
      >
        <text>州</text>
      </view>
    </view>

    <!-- 游戏模式切换 -->
    <view class="mode-switch">
      <view 
        class="mode-item" 
        :class="{ active: gameMode === 'guessCapital' }"
        @tap="switchMode('guessCapital')"
      >
        <text>{{ gameType === 'country' ? '国家猜首都' : '州猜首府' }}</text>
      </view>
      <view 
        class="mode-item" 
        :class="{ active: gameMode === 'guessName' }"
        @tap="switchMode('guessName')"
      >
        <text>{{ gameType === 'country' ? '看首都猜国家' : '看首府猜州' }}</text>
      </view>
    </view>

    <!-- 游戏容器 -->
    <view class="game-container">
      <game-container
        :gameIcon="gameType === 'country' ? 'location' : 'star'"
        :gameTitle="gameTitles[gameType][gameMode]"
        :questions="questions"
        :totalQuestions="gameType === 'country' ? 196 : 50"
        :timeLimit="0"
        :isImageOptions="false"
	     gameType="capital"
      />
    </view>
  </view>
</template>

<script>
import GameContainer from '@/components/game-container/game-container.vue'
import { generateCapitalQuestions } from '@/utils/gameUtils.js'
import request from '@/utils/request.js'; // 导入请求工具类

export default {
  components: {
    GameContainer
  },
  
  data() {
    return {
      questions: [],
      gameType: 'country', // 默认类型
      gameMode: 'guessCapital', // 默认模式
      gameTitles: {
        country: {
          guessCapital: '国家猜首都',
          guessName: '看首都猜国家'
        },
        state: {
          guessCapital: '州猜首府',
          guessName: '看首府猜州'
        }
      }
    }
  },
  
  onLoad() {
    this.loadQuestions();
  },
  
  methods: {
    async loadQuestions() {
      try {
        const url = this.gameType === 'country' ? '/capital/capitalToCountry/getAllCapitalToCountry' : '/capital/capitalToUsState/getAllCapitalToUsState'; // 根据类型选择API
        const response = await request(url, 'GET'); // 使用请求工具类发送请求
        
        if (response.code === 200) {
          this.questions = generateCapitalQuestions(
            response.data,
            this.gameType,
            this.gameMode
          );
        } else {
          throw new Error('加载失败');
        }
      } catch (error) {
        console.error('加载题目失败:', error);
        uni.showToast({
          title: '加载题目失败',
          icon: 'none'
        });
      }
    },

    switchType(type) {
      if (this.gameType !== type) {
        this.gameType = type;
        this.loadQuestions(); // 切换类型时重新加载题目
      }
    },

    switchMode(mode) {
      if (this.gameMode !== mode) {
        this.gameMode = mode;
        this.loadQuestions(); // 切换模式时重新加载题目
      }
    }
  }
}
</script>

<style lang="scss">
@import '@/styles/game.scss';
</style> 