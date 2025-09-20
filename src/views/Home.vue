<template>
  <main class="container">
    <!-- Welcome Section -->
    <div class="welcome-section">
      <h1 class="title">Chālish-i Dānish-i Jughrāfiyā</h1>
      <p class="subtitle">Dānish-i jughrāfiyāi khudro sanjiyed, ball-i bālāro ba dast ovarid!</p>
      
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
        placeholder="Justujūi regime-hāi bāzī"
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
        <p>Dar in qism bāzī-hā mavjud nestand</p>
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
              Darajah: {{ "★".repeat(game.modes[0].difficulty) }}{{ "☆".repeat(3 - game.modes[0].difficulty) }}
            </div>
          </div>
          <p class="game-bonus">Mukofoti yakumin guzarish: {{ game.rewards.firstWin }} ball</p>
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
            Shurū kardan-i bāzī
          </button>
          <button class="btn" @click="closeDetails">Pūshidan</button>
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
      currentCategory: 'Hama',
      categories: ['Hama', 'Shoroqatī', 'Pīshrafta', 'Chālish', 'Chandin nafara'],
      statsData: [
        { value: '6', label: 'Regime-hāi bāzī' },
        { value: '200+', label: 'Miqdāri masalahā' },
        { value: '10K+', label: 'Shūmāri chālish-hā' }
      ],
      games: {
        flags: {
          title: 'Chālish-i Bayraqa',
          description: 'Farhang-i bayraqa-hāi mamlakatho-yī jahānro mukshif sāzed, az shinokht-i soda-yi bayraqa-hā to fahm-i ‘amiq-i tārīkh va ma‘nī-yi ānhā.',
          modes: [
            { name: 'Regime-i ibtidoī', desc: 'Shinokht-i bayraqa-hāi asosi-yi mamlakatho', difficulty: 1 },
            { name: 'Regime-i ‘olī', desc: 'Chālish-i bayraqa-hāi nodīr va shabeh', difficulty: 2 }
          ],
          rewards: { firstWin: 100 },
          path: '/games/flags'
        },
        shapes: {
          title: 'Chālish-i Shaklhā',
          description: 'Bā shaklhāi hudud-i mamlakatho dānish-i jughrāfiyāi khudro sānjed va qobililyat-i tashkhis-i fazāīro inkishāf dihed.',
          modes: [
            { name: 'Shinokht-i payā', desc: 'Âmukht-i shaklhāi mumtoz-i mamlakatho', difficulty: 2 },
            { name: 'Chālish-i sur‘at', desc: 'Dar vaqt-i moilayn tashkhis-i shaklhāi mamlakatho', difficulty: 3 }
          ],
          rewards: { firstWin: 150 },
          path: '/games/shapes'
        },
        capitals: {
          title: 'Chālish-i Poytakhtho',
          description: 'Shinokht-i shumā nisbat ba poytakhtho-yi mamlakatho-yi jahānro sānjed, az tanosub-i soda-yi poytakhtho to dānish-i ‘amiq-i tārīkhī va farhangī.',
          modes: [
            { name: 'Tanosub-i poytakhtho', desc: 'Mamlakatho v poytakhtho-yi ānhāro durus mutanosibsāzed', difficulty: 2 },
            { name: 'Kashf-i farhangī', desc: 'Shenokht-i khūsusiyathāi tārīkhī va farhang-i poytakhtho', difficulty: 3 }
          ],
          rewards: { firstWin: 120 },
          path: '/games/capitals'
        },
        timedChallenge: {
          title: 'Chālish-i Vaqdor',
          description: 'Dar vaqt-i mahdud ba miqdori zyodi masalahāi jughrāfī javob dihed, anborashī va sur‘at-i javobdihīi khudro sānjed.',
          modes: [
            { name: 'Javobdihīi sare‘', desc: 'Dar 60 sāniya javobāt-i zyād ball-i zyād', difficulty: 2 },
            { name: 'Regime-i zindamoni', desc: 'Javob-i nādurust khatm meshavad, ball-i maksimalīro koyosh kun', difficulty: 3 }
          ],
          rewards: { firstWin: 150 },
          path: '/games/timed-challenge'
        },
        multiplayer: {
          title: 'Muqoyisa-i Chandin Nafara',
          description: 'Dūstoni khudro ba musobaqa-yi dānish-i jughrāfī da‘vat kun, regime-i muqoyisa dar vaqt-i haqīqī āmukhtanro shavīqtar mesāzad.',
          modes: [
            { name: 'Muqoyisa-i dūstān', desc: 'Bā dūstontān muqoyisa-yi 1v1 dar vaqt-i haqīqī', difficulty: 2 },
            { name: 'Musobaqa-yi guruhi', desc: 'Guruhsāzi va musobaqa-yi chandin nafara', difficulty: 2 }
          ],
          rewards: { firstWin: 200 },
          path: '/games/multiplayer'
        },
        randomMode: {
          title: 'Regime-i Tasodufī',
          description: 'Chālish-i tasodufī-yi hama naw‘-i masalahā, har bār tajriba-yi nav, dānish-i mukhtalifu jughrāfiyāi umumīro takmīl kun.',
          modes: [
            { name: 'Guzarish-i tasodufī', desc: 'Tarkib-i tasodufī-yi anvā‘-i masalahā barāi chālish', difficulty: 3 },
            { name: 'Chālish-i hār rūza', desc: 'Tarkib-i sābit-i masalahā hār rūz', difficulty: 2 }
          ],
          rewards: { firstWin: 180 },
          path: '/games/random'
        }
      },
      gameCategories: {
        flags: ['Shoroqatī', 'Pīshrafta'],
        shapes: ['Pīshrafta', 'Chālish'],
        capitals: ['Shoroqatī', 'Pīshrafta'],
        timedChallenge: ['Chālish'],
        multiplayer: ['Chandin nafara'],
        randomMode: ['Chālish', 'Chandin nafara']
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
      if (category === 'Hama') {
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