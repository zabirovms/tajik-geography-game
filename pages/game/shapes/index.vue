<template>
  <view class="game-page">
    <!-- 游戏类型切换 -->
    <view class="type-switch">
      <view 
        class="type-item" 
        :class="{ active: gameType === 'country' }"
        @tap="switchType('country')"
      >
        <text>国家轮廓</text>
      </view>
      <view 
        class="type-item" 
        :class="{ active: gameType === 'state' }"
        @tap="switchType('state')"
      >
        <text>州轮廓</text>
      </view>
    </view>

    <!-- 游戏模式切换 -->
    <view class="mode-switch">
      <view 
        class="mode-item" 
        :class="{ active: gameMode === 'guessCountryOutline' }"
        @tap="switchMode('guessCountryOutline')"
      >
        <text>{{ gameType === 'country' ? '看轮廓猜国家' : '看轮廓猜州' }}</text>
      </view>
      <view 
        class="mode-item" 
        :class="{ active: gameMode === 'guessOutlineCountry' }"
        @tap="switchMode('guessOutlineCountry')"
      >
        <text>{{ gameType === 'country' ? '看国家猜轮廓' : '看州猜轮廓' }}</text>
      </view>
    </view>

    <!-- 游戏容器 -->
    <view class="game-container">
      <game-container
        gameIcon="map"
        :gameTitle="gameTitles[gameType][gameMode]"
        :questions="questions"
        :totalQuestions="gameType === 'country' ? 196 : 50"
        :timeLimit="0"
        :isImageOptions="gameMode === 'guessOutlineCountry'"
        :gameType="gameType"
      />
    </view>
  </view>
</template>

<script>
import request from '@/utils/request.js'; // 导入请求工具类
import GameContainer from '@/components/game-container/game-container.vue'
import { generateShapeQuestions } from '@/utils/gameUtils.js'

export default {
  components: {
    GameContainer
  },
  
  data() {
    return {
      questions: [],
      gameType: 'country', // 默认类型
      gameMode: 'guessCountryOutline', // 默认模式
      gameTitles: {
        country: {
          guessCountryOutline: '看轮廓猜国家',
          guessOutlineCountry: '看国家猜轮廓'
        },
        state: {
          guessCountryOutline: '看轮廓猜州',
          guessOutlineCountry: '看州猜轮廓'
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
        const url = this.gameType === 'country' ? '/shape/shapeToCountry/getAllShapeToCountry' : '/shape/shapeToState/getAllShapeToState'; // 根据类型选择API
        const response = await request(url, 'GET'); // 使用请求工具类发送请求

        this.questions = generateShapeQuestions(
          response.data,
          this.gameType,
          this.gameMode
        );

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