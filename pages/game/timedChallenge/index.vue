<template>
  <view class="game-page">
    <!-- 游戏描述 -->
    <view class="game-description" style="text-align: center; margin: 30px; padding: 15px; background-color: #f9f9f9; border-radius: 10px;">
      <text style="font-size: 24px; color: #2c3e50; font-weight: bold;">欢迎来到限时挑战游戏！</text>
      <text style="font-size: 18px; color: #34495e;">在规定时间内完成挑战，展现你的智慧与速度！</text>
    </view>
    <!-- 游戏类型切换 -->
    <view class="type-switch">
      <view 
        class="type-item" 
        :class="{ active: gameType === 'country' }"
        @tap="switchType('country')"
      >
        <text>国旗挑战</text>
      </view>
      <view 
        class="type-item" 
        :class="{ active: gameType === 'state' }"
        @tap="switchType('state')"
      >
        <text>州旗挑战</text>
      </view>
    </view>

    <!-- 游戏模式切换 -->
    <view class="mode-switch">
      <view 
        class="mode-item" 
        :class="{ active: gameMode === 'guessName' }"
        @tap="switchMode('guessName')"
      >
        <text>{{ gameType === 'country' ? '看图猜国家' : '看图猜州名' }}</text>
      </view>
      <view 
        class="mode-item" 
        :class="{ active: gameMode === 'guessFlag' }"
        @tap="switchMode('guessFlag')"
      >
        <text>{{ gameType === 'country' ? '看名猜国旗' : '看名猜州旗' }}</text>
      </view>
    </view>

    <!-- 游戏容器 -->
    <view class="game-container">
      <game-container
        :gameIcon="gameType === 'country' ? 'flag' : 'star'"
        :gameTitle="gameTitles[gameType][gameMode]"
        :questions="questions"
        :totalQuestions="gameType === 'country' ? 196 : 50"
        :timeLimit="15"
        :isImageOptions="gameMode === 'guessFlag'"
        :gameType="gameType"
      />
    </view>
  </view>
</template>

<script>
import request from '@/utils/request.js'; // 导入请求工具类
import GameContainer from '@/components/game-container/game-container.vue'
import { generateFlagQuestions } from '@/utils/gameUtils.js'

export default {
  components: {
    GameContainer
  },
  
  data() {
    return {
      questions: [],
      gameType: 'country',
      gameMode: 'guessName',
      gameTitles: {
        country: {
          guessName: '看图猜国家',
          guessFlag: '看名猜国旗'
        },
        state: {
          guessName: '看图猜州名',
          guessFlag: '看名猜州旗'
        }
      }
    }
  },
  
  onLoad() {
    this.loadQuestions()
  },
  
  methods: {
    async loadQuestions() {
      try {
        const url = this.gameType === 'country' ? '/flag/flagToCountry/getAllFlagToCountry' : '/flag/flagToUsState/getAllFlagToUsState';
        const response = await request(url, 'GET'); // 使用请求工具类发送请求
        
        this.questions = generateFlagQuestions(
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
        this.gameType = type
        this.loadQuestions()
      }
    },

    switchMode(mode) {
      if (this.gameMode !== mode) {
        this.gameMode = mode
        this.loadQuestions()
      }
    }
  }
}
</script>

<style lang="scss">
@import '@/styles/game.scss';
</style>