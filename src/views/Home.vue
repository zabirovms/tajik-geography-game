<template>
  <main class="container">
    <!-- Welcome Section -->
    <div class="welcome-section">
      <h1 class="title">地理知识挑战</h1>
      <p class="subtitle">测试你的地理知识，挑战高分！</p>
      
      <div class="stats-bar">
        <div class="stats-item" v-for="(stat, index) in statsData" :key="index">
          <div class="stats-num">{{ stat.value }}</div>
          <div class="stats-label">{{ stat.label }}</div>
        </div>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="search-section">
      <input 
        type="text" 
        v-model="searchKey" 
        placeholder="搜索游戏模式"
        class="search-input"
        @input="searchGames"
      />
    </div>

    <!-- Category Filter -->
    <div class="category-section">
      <div class="category-tags">
        <button 
          v-for="tag in categories" 
          :key="tag"
          :class="['category-tag', { active: currentCategory === tag }]"
          @click="filterByCategory(tag)"
        >
          {{ tag }}
        </button>
      </div>
    </div>

    <!-- Game List -->
    <div class="game-list">
      <div v-if="filteredGames.length === 0" class="no-games">
        <p>当前分类暂无游戏</p>
      </div>

      <div 
        v-for="game in filteredGames" 
        :key="game.key"
        class="game-card"
        @click="showGameDetails(game.key)"
      >
        <div class="card-left">
          <div :class="['icon-wrapper', getIconColor(game.key)]">
            <span class="game-icon">{{ getGameIcon(game.key) }}</span>
          </div>
        </div>
        <div class="card-right">
          <h3 class="game-title">{{ game.title }}</h3>
          <p class="game-desc">{{ game.description }}</p>
          <div class="game-modes">
            <span class="mode-tag" v-for="mode in game.modes" :key="mode.name">
              {{ mode.name }}
            </span>
            <div :class="['difficulty-tag', getDifficultyClass(game.modes[0].difficulty)]">
              难度: {{ "★".repeat(game.modes[0].difficulty) }}{{ "☆".repeat(3 - game.modes[0].difficulty) }}
            </div>
          </div>
          <p class="game-bonus">首次通关奖励：{{ game.rewards.firstWin }}积分</p>
        </div>
      </div>
    </div>

    <!-- Game Details Modal -->
    <div v-if="showDetails" class="modal-overlay" @click="closeDetails">
      <div class="modal-content" @click.stop>
        <h2 class="modal-title">{{ selectedGame.title }}</h2>
        <p class="modal-description">{{ selectedGame.description }}</p>
        <div class="modal-buttons">
          <button class="btn btn-primary" @click="startGame(selectedGame.path)">
            开始游戏
          </button>
          <button class="btn" @click="closeDetails">关闭</button>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      showDetails: false,
      selectedGame: {},
      searchKey: '',
      currentCategory: '全部',
      categories: ['全部', '入门', '进阶', '挑战', '多人'],
      statsData: [
        { value: '6', label: '游戏模式' },
        { value: '200+', label: '题目数量' },
        { value: '10K+', label: '挑战次数' }
      ],
      games: {
        flags: {
          title: '旗帜挑战',
          description: '探索世界各国的旗帜文化，从简单的国旗识别到深入了解旗帜的历史和含义。',
          modes: [
            { name: '初级模式', desc: '认识基本的国家旗帜', difficulty: 1 },
            { name: '高级模式', desc: '挑战稀有和相似的旗帜', difficulty: 2 }
          ],
          rewards: { firstWin: 100 },
          path: '/games/flags'
        },
        shapes: {
          title: '轮廓挑战',
          description: '通过国家轮廓形状测试你的地理知识，培养空间识别能力。',
          modes: [
            { name: '基础认知', desc: '学习典型国家轮廓', difficulty: 2 },
            { name: '速度挑战', desc: '限时识别国家形状', difficulty: 3 }
          ],
          rewards: { firstWin: 150 },
          path: '/games/shapes'
        },
        capitals: {
          title: '首都挑战',
          description: '测试你对世界各国首都的认知，从基础的首都匹配到深入的历史文化知识。',
          modes: [
            { name: '首都配对', desc: '将国家与其首都正确匹配', difficulty: 2 },
            { name: '文化探索', desc: '了解首都的历史和文化特色', difficulty: 3 }
          ],
          rewards: { firstWin: 120 },
          path: '/games/capitals'
        },
        timedChallenge: {
          title: '限时挑战',
          description: '在限定时间内回答尽可能多的地理问题，考验你的知识储备和反应速度。',
          modes: [
            { name: '快速答题', desc: '60秒内答题越多分数越高', difficulty: 2 },
            { name: '生存模式', desc: '答错即结束，争取最高分', difficulty: 3 }
          ],
          rewards: { firstWin: 150 },
          path: '/games/timed-challenge'
        },
        multiplayer: {
          title: '多人对战',
          description: '邀请好友一起参与地理知识竞赛，实时对战模式让学习更有趣。',
          modes: [
            { name: '好友对战', desc: '与好友进行1v1实时对战', difficulty: 2 },
            { name: '团队竞赛', desc: '组队进行多人竞赛', difficulty: 2 }
          ],
          rewards: { firstWin: 200 },
          path: '/games/multiplayer'
        },
        randomMode: {
          title: '随机模式',
          description: '融合所有题型的随机挑战，每次体验都不同，提升综合地理知识。',
          modes: [
            { name: '随机闯关', desc: '随机组合各类题型进行挑战', difficulty: 3 },
            { name: '每日挑战', desc: '每天固定题目组合', difficulty: 2 }
          ],
          rewards: { firstWin: 180 },
          path: '/games/random'
        }
      },
      gameCategories: {
        flags: ['入门', '进阶'],
        shapes: ['进阶', '挑战'],
        capitals: ['入门', '进阶'],
        timedChallenge: ['挑战'],
        multiplayer: ['多人'],
        randomMode: ['挑战', '多人']
      },
      filteredGames: []
    }
  },
  created() {
    this.initGamesList()
  },
  methods: {
    initGamesList() {
      this.filteredGames = Object.entries(this.games).map(([key, game]) => ({
        key,
        ...game
      }))
    },
    searchGames() {
      if (!this.searchKey.trim()) {
        this.filterByCategory(this.currentCategory)
        return
      }
      
      this.filteredGames = Object.entries(this.games)
        .filter(([key, game]) => 
          game.title.toLowerCase().includes(this.searchKey.toLowerCase()) ||
          game.description.toLowerCase().includes(this.searchKey.toLowerCase())
        )
        .map(([key, game]) => ({ key, ...game }))
    },
    filterByCategory(category) {
      this.currentCategory = category
      if (category === '全部') {
        this.initGamesList()
        return
      }
      
      this.filteredGames = Object.entries(this.games)
        .filter(([key, game]) => 
          this.gameCategories[key] && this.gameCategories[key].includes(category)
        )
        .map(([key, game]) => ({ key, ...game }))
    },
    showGameDetails(gameKey) {
      this.selectedGame = this.games[gameKey]
      this.showDetails = true
    },
    closeDetails() {
      this.showDetails = false
    },
    startGame(path) {
      this.closeDetails()
      this.$router.push(path)
    },
    getGameIcon(gameKey) {
      const icons = {
        flags: '🏳️',
        shapes: '🗺️',
        capitals: '🏛️',
        timedChallenge: '⏱️',
        multiplayer: '👥',
        randomMode: '🎲'
      }
      return icons[gameKey] || '🎯'
    },
    getIconColor(gameKey) {
      const colors = {
        flags: 'icon-blue',
        shapes: 'icon-green',
        capitals: 'icon-orange',
        timedChallenge: 'icon-red',
        multiplayer: 'icon-purple',
        randomMode: 'icon-pink'
      }
      return colors[gameKey] || 'icon-blue'
    },
    getDifficultyClass(difficulty) {
      return `difficulty-${difficulty}`
    }
  }
}
</script>

<style scoped>
.welcome-section {
  text-align: center;
  padding: 2rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 1rem;
  margin-bottom: 2rem;
}

.title {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 2rem;
}

.stats-bar {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.stats-item {
  text-align: center;
}

.stats-num {
  font-size: 1.5rem;
  font-weight: bold;
}

.stats-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

.search-section {
  margin-bottom: 1.5rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;
}

.category-section {
  margin-bottom: 2rem;
}

.category-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.category-tag {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-tag.active {
  background: #2979FF;
  color: white;
  border-color: #2979FF;
}

.game-list {
  display: grid;
  gap: 1rem;
}

.game-card {
  background: white;
  border-radius: 1rem;
  padding: 1rem;
  display: flex;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.game-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.card-left {
  flex-shrink: 0;
}

.icon-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-blue { background: #2979FF; }
.icon-green { background: #4CAF50; }
.icon-orange { background: #FF9800; }
.icon-red { background: #F44336; }
.icon-purple { background: #9C27B0; }
.icon-pink { background: #E91E63; }

.game-icon {
  font-size: 1.5rem;
}

.card-right {
  flex-grow: 1;
}

.game-title {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.game-desc {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.game-modes {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

.mode-tag {
  background: #f0f0f0;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
}

.difficulty-tag {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  color: white;
}

.difficulty-1 { background: #4CAF50; }
.difficulty-2 { background: #FF9800; }
.difficulty-3 { background: #F44336; }

.game-bonus {
  color: #2979FF;
  font-weight: 500;
  font-size: 0.9rem;
}

.no-games {
  text-align: center;
  color: #666;
  padding: 2rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
}

.modal-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.modal-buttons {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .stats-bar {
    gap: 1rem;
  }
  
  .game-card {
    flex-direction: column;
    text-align: center;
  }
  
  .modal-buttons {
    flex-direction: column;
  }
}
</style>