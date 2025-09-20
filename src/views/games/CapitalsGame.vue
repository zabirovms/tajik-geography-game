<template>
  <main class="container">
    <div class="game-header">
      <button class="back-btn" @click="$router.go(-1)">← Бозгашт</button>
      <h1>Чолиши пойтахтҳо</h1>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-wrapper">
      <div class="loading-spinner"></div>
      <p>Маълумот бор мешавад...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-wrapper">
      <div class="error-content">
        <h3>❌ Хато рух дод</h3>
        <p>{{ error }}</p>
        <button class="retry-btn" @click="loadCountries">Аз нав кӯшиш кунед</button>
      </div>
    </div>

    <!-- Game Setup -->
    <div v-else-if="!gameStarted" class="game-setup">
      <!-- Game Scope Selection -->
      <div class="type-switch">
        <h3>Доираи бозӣ:</h3>
        <div class="switch-buttons">
          <button 
            :class="['type-btn', { active: gameType === 'world' }]"
            @click="switchType('world')"
          >
            🌍 Ҷаҳонӣ
          </button>
          <button 
            :class="['type-btn', { active: gameType === 'regional' }]"
            @click="switchType('regional')"
          >
            🗺️ Минтақавӣ (Осиё, Аврупо)
          </button>
        </div>
      </div>

      <!-- Game Mode Selection -->
      <div class="mode-switch">
        <h3>Режими бозӣ:</h3>
        <div class="mode-buttons">
          <button 
            :class="['mode-btn', { active: gameMode === 'guessCapital' }]"
            @click="switchMode('guessCapital')"
          >
            🏛️ Мамлакат → Пойтахт
          </button>
          <button 
            :class="['mode-btn', { active: gameMode === 'guessName' }]"
            @click="switchMode('guessName')"
          >
            🔄 Пойтахт → Мамлакат
          </button>
        </div>
      </div>

      <!-- Difficulty Selection -->
      <div class="difficulty-switch">
        <h3>Дараҷаи душворӣ:</h3>
        <div class="difficulty-buttons">
          <button 
            :class="['difficulty-btn', { active: difficulty === 'easy' }]"
            @click="setDifficulty('easy')"
          >
            ⭐ Осон (10 савол)
          </button>
          <button 
            :class="['difficulty-btn', { active: difficulty === 'medium' }]"
            @click="setDifficulty('medium')"
          >
            ⭐⭐ Миёна (15 савол)
          </button>
          <button 
            :class="['difficulty-btn', { active: difficulty === 'hard' }]"
            @click="setDifficulty('hard')"
          >
            ⭐⭐⭐ Душвор (20 савол)
          </button>
        </div>
      </div>

      <!-- Start Game Button -->
      <div class="start-section">
        <div class="game-preview">
          <h4>Омодаи бозӣ:</h4>
          <p>{{ getGameDescription() }}</p>
          <div class="stats-preview">
            <span>🎯 {{ getQuestionCount() }} савол</span>
            <span>⏱️ Бе маҳдудияти вақт</span>
          </div>
        </div>
        <button class="start-game-btn" @click="startGame" :disabled="!countries.length">
          🎮 Шуруъ кардани бозӣ
        </button>
      </div>
    </div>

    <!-- Game Play -->
    <GameContainer
      v-else
      :questions="questions"
      :time-limit="0"
      @game-complete="handleGameComplete"
      @restart="restartGame"
      @go-home="goHome"
    />
  </main>
</template>

<script>
import GameContainer from '@/components/GameContainer.vue'
import apiService from '@/utils/api.js'
import { generateCapitalQuestions } from '@/utils/gameUtils.js'

export default {
  name: 'CapitalsGame',
  components: {
    GameContainer
  },
  data() {
    return {
      isLoading: true,
      error: null,
      countries: [],
      gameStarted: false,
      gameType: 'world', // 'world' or 'regional'
      gameMode: 'guessCapital', // 'guessCapital' or 'guessName'
      difficulty: 'medium', // 'easy', 'medium', 'hard'
      questions: []
    }
  },
  async mounted() {
    await this.loadCountries()
  },
  methods: {
    async loadCountries() {
      this.isLoading = true
      this.error = null
      
      try {
        this.countries = await apiService.getAllCountries()
        
        // Track localization success rate
        const localizationStats = this.countries.reduce((stats, country) => {
          stats.total++
          stats[country.localizationSource] = (stats[country.localizationSource] || 0) + 1
          return stats
        }, { total: 0, persian: 0, russian: 0, english: 0, none: 0 })
        
        const cyrillicCount = localizationStats.persian + localizationStats.russian + localizationStats.english
        const cyrillicPercentage = Math.round((cyrillicCount / localizationStats.total) * 100)
        
        console.log(`Loaded ${this.countries.length} countries for capitals game`)
        console.log(`Localization stats:`, localizationStats)
        console.log(`${cyrillicPercentage}% of countries localized to Cyrillic script`)
        
      } catch (error) {
        console.error('Failed to load countries:', error)
        this.error = 'Хато дар боркунии маълумот. Лутфан интернет пайвастагии худро санҷед.'
      } finally {
        this.isLoading = false
      }
    },

    switchType(type) {
      this.gameType = type
    },

    switchMode(mode) {
      this.gameMode = mode
    },

    setDifficulty(level) {
      this.difficulty = level
    },

    getGameDescription() {
      const scopeText = this.gameType === 'world' ? 'ҷаҳонӣ' : 'минтақавӣ (Осиё ва Аврупо)'
      const modeText = this.gameMode === 'guessCapital' 
        ? `Пойтахти мамлакатҳои ${scopeText}-ро пешбинӣ кунед`
        : `Мамлакатҳоро аз руи пойтахти онҳо пешбинӣ кунед (${scopeText})`
      
      return modeText
    },

    getQuestionCount() {
      const counts = { easy: 10, medium: 15, hard: 20 }
      return counts[this.difficulty]
    },

    startGame() {
      if (!this.countries.length) return
      
      // Filter countries based on game type
      let gameCountries = this.countries
      
      if (this.gameType === 'regional') {
        // Focus on Asia and Europe for regional mode (relevant to Tajik speakers)
        const targetRegions = ['Europe', 'Asia']
        gameCountries = this.countries.filter(country => 
          targetRegions.includes(country.region)
        )
      }

      // Generate questions
      const questionCount = this.getQuestionCount()
      this.questions = generateCapitalQuestions(gameCountries, this.gameMode, questionCount)
      
      if (this.questions.length === 0) {
        this.error = 'Хато дар тайёркунии саволҳо. Лутфан аз нав кӯшиш кунед.'
        return
      }

      this.gameStarted = true
    },

    handleGameComplete(results) {
      console.log('Game completed:', results)
      // Could save results to local storage or send to backend
    },

    restartGame() {
      this.gameStarted = false
      this.questions = []
    },

    goHome() {
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.game-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.back-btn {
  background: none;
  border: 1px solid #ddd;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: #f5f5f5;
  border-color: #2979FF;
}

.loading-wrapper, .error-wrapper {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2979FF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-content {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  max-width: 400px;
  margin: 0 auto;
}

.retry-btn {
  background: #2979FF;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: #1976D2;
}

.game-setup {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
}

.type-switch, .mode-switch, .difficulty-switch {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 1.5rem;
}

.type-switch h3, .mode-switch h3, .difficulty-switch h3 {
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.1rem;
}

.switch-buttons, .mode-buttons, .difficulty-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.type-btn, .mode-btn, .difficulty-btn {
  flex: 1;
  min-width: 140px;
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 0.75rem;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  text-align: center;
}

.type-btn:hover, .mode-btn:hover, .difficulty-btn:hover {
  border-color: #2979FF;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(41, 121, 255, 0.2);
}

.type-btn.active, .mode-btn.active, .difficulty-btn.active {
  border-color: #2979FF;
  background: #E3F2FD;
  color: #1976D2;
  font-weight: 600;
}

.start-section {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
}

.game-preview {
  margin-bottom: 1.5rem;
}

.game-preview h4 {
  color: #333;
  margin-bottom: 0.5rem;
}

.game-preview p {
  color: #666;
  margin-bottom: 1rem;
}

.stats-preview {
  display: flex;
  gap: 1rem;
  justify-content: center;
  font-size: 0.9rem;
  color: #2979FF;
}

.start-game-btn {
  background: linear-gradient(135deg, #4CAF50, #45A049);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.start-game-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.start-game-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

@media (max-width: 768px) {
  .switch-buttons, .mode-buttons, .difficulty-buttons {
    flex-direction: column;
  }
  
  .type-btn, .mode-btn, .difficulty-btn {
    min-width: auto;
  }
  
  .stats-preview {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .game-setup {
    padding: 0.5rem;
  }
}
</style>