<template>
  <div class="shapes-game">
    <!-- Game Header -->
    <div class="game-header">
      <button @click="goHome" class="back-btn">← Бозгашт</button>
      <h1>🗺️ Шаклҳои кишварҳо</h1>
      <div class="game-stats" v-if="gameState === 'playing'">
        <span class="score">Балл: {{ score }}</span>
        <span class="question-count">{{ currentQuestionIndex + 1 }}/{{ totalQuestions }}</span>
        <span class="timer" v-if="timeLeft > 0">⏱️ {{ timeLeft }}с</span>
      </div>
    </div>

    <!-- Game Setup -->
    <div v-if="gameState === 'setup'" class="game-setup">
      <div class="setup-card">
        <div class="setup-icon">🗺️</div>
        <h2>Шаклҳои кишварҳо</h2>
        <p>Кишварҳоро дар харита ё глобус пайдо кунед!</p>
        
        <div class="setup-options">
          <div class="option-group">
            <label>Сатҳи мушкилӣ:</label>
            <select v-model="difficulty" class="setup-select">
              <option value="easy">Осон</option>
              <option value="medium">Миёна</option>
              <option value="hard">Душвор</option>
            </select>
          </div>
        </div>
        
        <div class="game-description">
          <p>Дар ин бозӣ шумо бояд кишварҳоро дар харита ё глобус пайдо кунед. Рӯи кишвари дуруст клик кунед!</p>
        </div>
        
        <button @click="startGame" class="start-btn" :disabled="isLoading || countries.length === 0">
          {{ isLoading ? 'Бор мешавад...' : countries.length === 0 ? 'Маълумот бор мешавад...' : 'Оғози бозӣ' }}
        </button>
      </div>
    </div>

    <!-- Playing State -->
    <div v-if="gameState === 'playing'" class="game-playing">
      <!-- Question Display -->
      <div v-if="currentQuestion" class="question-card">
        <h2 class="question-text">Кишвари {{ currentQuestion.localizedName }}-ро пайдо кунед</h2>
        <div class="question-info">
          <span class="continent">{{ currentQuestion.continent }}</span>
          <span class="hint">Рӯи кишвар клик кунед</span>
        </div>
      </div>

      <!-- Game Map Container -->
      <div class="game-map-container">
        <WorldMapViewer 
          mode="game"
          :show-controls="true"
          loading-text="Харита бор мешавад..."
          :initial-globe-view="isGlobeView"
          :initial-color-mode="colorMode"
          @country-click="handleCountryClick"
          @map-ready="onMapReady"
          @view-toggle="onViewToggle"
          @color-mode-change="onColorModeChange"
          ref="mapViewer"
        />
      </div>
    </div>

    <!-- Feedback Modal -->
    <div v-if="feedback" class="feedback-modal" :class="feedback.type">
      <div class="feedback-content">
        <div class="feedback-icon">{{ feedback.type === 'correct' ? '✅' : '❌' }}</div>
        <p>{{ feedback.message }}</p>
      </div>
    </div>

    <!-- Game Complete -->
    <div v-if="gameState === 'finished'" class="game-complete">
      <div class="complete-card">
        <div class="complete-icon">🏆</div>
        <h2>Бозӣ тамом!</h2>
        <p class="final-score">Натиҷаи шумо: {{ score }} холл</p>
        <div class="complete-actions">
          <button @click="restartGame" class="restart-btn">Дубора бозӣ кардан</button>
          <button @click="goHome" class="home-btn">Баргашт ба саҳифаи асосӣ</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import WorldMapViewer from '@/components/WorldMapViewer.vue'
import { countryNamesTajik, continentNamesTajik } from '@/utils/mapData.js'
import apiService from '@/utils/api.js'


export default {
  name: 'ShapesGame',
  components: {
    WorldMapViewer
  },
  setup() {
    const router = useRouter()
    
    // Game state
    const gameState = ref('setup')
    const difficulty = ref('medium')
    const score = ref(0)
    const timeLeft = ref(0)
    const currentQuestionIndex = ref(0)
    const totalQuestions = ref(10)
    const currentQuestion = ref(null)
    const feedback = ref(null)
    const isLoading = ref(false)
    const countries = ref([])
    
    // Map settings and reference
    const mapViewer = ref(null)
    const isGlobeView = ref(false)
    const colorMode = ref('continents')
    
    let gameTimer = null
    
    // WorldMapViewer event handlers
    const onMapReady = () => {
      console.log('Game map is ready')
    }
    
    const onViewToggle = (globeView) => {
      isGlobeView.value = globeView
    }
    
    const onColorModeChange = (mode) => {
      colorMode.value = mode
    }


    // Game logic methods
    const loadCountries = async () => {
      isLoading.value = true
      try {
        countries.value = await apiService.getAllCountries()
        console.log(`Loaded ${countries.value.length} countries for shapes game`)
      } catch (error) {
        console.error('Failed to load countries:', error)
      } finally {
        isLoading.value = false
      }
    }

    const generateQuestion = () => {
      return generateMapQuestion()
    }

    const generateMapQuestion = () => {
      const filteredCountries = apiService.getCountriesByDifficulty(countries.value, difficulty.value)
      if (filteredCountries.length === 0) return null
      
      const randomIndex = Math.floor(Math.random() * filteredCountries.length)
      const selectedCountry = filteredCountries[randomIndex]
      
      return {
        cca2: selectedCountry.cca2,
        localizedName: countryNamesTajik[selectedCountry.cca2] || selectedCountry.localizedName,
        continent: continentNamesTajik[selectedCountry.region] || selectedCountry.region
      }
    }

    // No other question types needed - only map shapes

    const startGame = () => {
      if (countries.value.length === 0) return
      
      gameState.value = 'playing'
      score.value = 0
      currentQuestionIndex.value = 0
      feedback.value = null
      
      currentQuestion.value = generateQuestion()
      if (!currentQuestion.value) {
        feedback.value = { type: 'error', message: 'Мушкилӣ дар тайёр кардани савол. Лутфан дубора кӯшиш кунед.' }
        gameState.value = 'setup'
        return
      }
      
      // Initialize timer
      timeLeft.value = difficulty.value === 'easy' ? 45 : difficulty.value === 'medium' ? 30 : 20
      startTimer()
      
      // Map is handled by WorldMapViewer component
    }

    // Game uses WorldMapViewer component for map display and interaction

    const startTimer = () => {
      if (gameTimer) clearInterval(gameTimer)
      
      gameTimer = setInterval(() => {
        timeLeft.value--
        if (timeLeft.value <= 0) {
          handleTimeUp()
        }
      }, 1000)
    }

    const handleTimeUp = () => {
      if (gameTimer) clearInterval(gameTimer)
      
      feedback.value = {
        type: 'incorrect',
        message: `Вақт тамом! Ҷавоби дуруст: ${currentQuestion.value.localizedName}`
      }
      
      setTimeout(() => {
        nextQuestion()
      }, 2500)
    }

    const handleCountryClick = (countryCode) => {
      if (!currentQuestion.value) return
      
      if (gameTimer) clearInterval(gameTimer)
      
      const isCorrect = currentQuestion.value.cca2 === countryCode
      const clickedCountry = countries.value.find(c => c.cca2 === countryCode)
      
      if (isCorrect) {
        const points = 10 + timeLeft.value * 2
        score.value += points
        
        feedback.value = {
          type: 'correct',
          message: `Офарин! +${points} балл`
        }
      } else {
        feedback.value = {
          type: 'incorrect',
          message: `Нодуруст! Ин ${clickedCountry?.localizedName || countryCode} аст. Ҷавоби дуруст: ${currentQuestion.value.localizedName}`
        }
      }
      
      setTimeout(() => {
        nextQuestion()
      }, 2500)
    }

    const nextQuestion = () => {
      currentQuestionIndex.value++
      
      if (currentQuestionIndex.value >= totalQuestions.value) {
        endGame()
        return
      }
      
      currentQuestion.value = generateQuestion()
      feedback.value = null
      timeLeft.value = difficulty.value === 'easy' ? 45 : difficulty.value === 'medium' ? 30 : 20
      
      startTimer()
    }

    const endGame = () => {
      gameState.value = 'finished'
      if (gameTimer) clearInterval(gameTimer)
    }

    const restartGame = () => {
      gameState.value = 'setup'
      if (gameTimer) clearInterval(gameTimer)
    }

    const goHome = () => {
      router.push('/')
    }

    // Sample data for chart games
    const sampleData = {
      population: {
        'CN': { name: 'Чин', value: 1439323776, continent: 'Осиё' },
        'IN': { name: 'Ҳиндустон', value: 1380004385, continent: 'Осиё' },
        'US': { name: 'ИМА', value: 331002651, continent: 'Амрикои Шимолӣ' },
        'ID': { name: 'Индонезия', value: 273523615, continent: 'Осиё' },
        'PK': { name: 'Покистон', value: 220892340, continent: 'Осиё' },
        'BR': { name: 'Бразилия', value: 212559417, continent: 'Амрикои Ҷанубӣ' },
        'NG': { name: 'Нигерия', value: 206139589, continent: 'Африқо' },
        'BD': { name: 'Бангладеш', value: 164689383, continent: 'Осиё' },
        'RU': { name: 'Русия', value: 145934462, continent: 'Аврупо' },
        'MX': { name: 'Мексика', value: 128932753, continent: 'Амрикои Шимолӣ' }
      },
      gdp: {
        'US': { name: 'ИМА', value: 21427700, continent: 'Амрикои Шимолӣ' },
        'CN': { name: 'Чин', value: 14342300, continent: 'Осиё' },
        'JP': { name: 'Япония', value: 4937400, continent: 'Осиё' },
        'DE': { name: 'Олмон', value: 3846400, continent: 'Аврупо' },
        'IN': { name: 'Ҳиндустон', value: 2875100, continent: 'Осиё' },
        'GB': { name: 'Британияи Кабир', value: 2829100, continent: 'Аврупо' },
        'FR': { name: 'Фаронса', value: 2716000, continent: 'Аврупо' },
        'IT': { name: 'Италия', value: 2001200, continent: 'Аврупо' },
        'BR': { name: 'Бразилия', value: 1869200, continent: 'Амрикои Ҷанубӣ' },
        'CA': { name: 'Канада', value: 1736400, continent: 'Амрикои Шимолӣ' }
      }
    }

    // Game mode descriptions
    const getGameDescription = () => {
      const descriptions = {
        'map-shapes': 'Кишварҳоро дар харитаи интерактивӣ пайдо кунед ва зер кунед!',
        'population-bars': 'Кишварҳоро аз рӯи шумораи аҳолӣ муқоиса кунед!',
        'area-pie': 'Андозаи минтақаҳои кишварҳоро дар диаграммаи доираӣ бинед!',
        'gdp-lines': 'Иқтисодиёти кишварҳоро дар намуди хатӣ муқоиса кунед!',
        'capital-distance': 'Масофаи байни пойтахтҳоро дар диаграмма пайдо кунед!'
      }
      return descriptions['map-shapes']
    }

    const getQuestionText = () => {
      if (!currentQuestion.value) return ''
      
      return `${currentQuestion.value.localizedName}-ро дар харита пайдо кунед`
    }

    const getLoadingText = () => {
      const loadingTexts = {
        'map-shapes': 'Харита бор мешавад...',
        'population-bars': 'Диаграммаи аҳолӣ бор мешавад...',
        'area-pie': 'Диаграммаи минтақаҳо бор мешавад...',
        'gdp-lines': 'Диаграммаи иқтисодӣ бор мешавад...',
        'capital-distance': 'Диаграммаи масофа бор мешавад...'
      }
      return loadingTexts['map-shapes']
    }

    // Lifecycle
    onMounted(() => {
      loadCountries()
    })

    onUnmounted(() => {
      if (gameTimer) clearInterval(gameTimer)
    })

    return {
      // Game state
      gameState, difficulty, score, timeLeft, currentQuestionIndex, totalQuestions,
      currentQuestion, feedback, isLoading, countries,
      
      // Map state  
      mapViewer, isGlobeView, colorMode,
      
      // Methods
      startGame, restartGame, goHome, getGameDescription,
      getQuestionText, getLoadingText, handleCountryClick,
      onMapReady, onViewToggle, onColorModeChange
    }
  }
}
</script>

<style scoped>
.shapes-game {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.game-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.9);
  padding: 16px 20px;
  border-radius: 12px;
}

.back-btn {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-weight: 500;
}

.back-btn:hover {
  background: #f9fafb;
}

.game-header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #1e293b;
}

.game-stats {
  display: flex;
  gap: 16px;
  font-weight: 500;
  color: #374151;
}

.game-setup {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.setup-card {
  background: rgba(255, 255, 255, 0.95);
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  backdrop-filter: blur(10px);
}

.setup-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.setup-card h2 {
  font-size: 2rem;
  margin: 0 0 16px 0;
  color: #1e293b;
}

.setup-card p {
  color: #64748b;
  margin: 0 0 32px 0;
  font-size: 1.1rem;
}

.setup-options {
  margin-bottom: 32px;
}

.option-group {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
}

.option-group label {
  font-weight: 500;
  color: #374151;
}

.setup-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.start-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.start-btn:hover:not(:disabled) {
  background: #2563eb;
}

.start-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.game-playing {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.question-card {
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  backdrop-filter: blur(10px);
}

.question-text {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.question-info {
  color: #64748b;
}

.continent {
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
}

.map-controls {
  display: flex;
  gap: 12px;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  padding: 12px 16px;
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.control-btn {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 14px;
}

.control-btn:hover {
  background: #f0f0f0;
}

.control-select {
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-size: 14px;
}

.chart-container {
  flex: 1;
  background: #f8fafc;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  position: relative;
  min-height: 400px;
}

.chart-container.map-shapes {
  /* Map-specific styles */
}

.chart-container.population-bars,
.chart-container.gdp-lines,
.chart-container.capital-distance {
  min-height: 350px;
}

.chart-container.area-pie {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-loading, .map-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 18px;
  color: #666;
  font-weight: 500;
}

.chart-options {
  margin-bottom: 16px;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  max-width: 600px;
  margin: 0 auto;
}

.option-btn {
  padding: 12px 20px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s;
  text-align: center;
}

.option-btn:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.option-btn.correct {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.option-btn.incorrect {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.options-hint {
  background: #e0f2fe;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #0369a1;
  margin-left: 8px;
}

.game-description {
  margin: 16px 0;
  padding: 12px;
  background: #f0f9ff;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.game-description p {
  margin: 0;
  color: #1e40af;
  font-weight: 500;
}

.feedback-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  text-align: center;
  min-width: 300px;
}

.feedback-modal.correct {
  border-left: 4px solid #10b981;
}

.feedback-modal.incorrect {
  border-left: 4px solid #ef4444;
}

.feedback-icon {
  font-size: 2rem;
  margin-bottom: 12px;
}

.feedback-content p {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
}

.game-complete {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.complete-card {
  background: rgba(255, 255, 255, 0.95);
  padding: 40px;
  border-radius: 16px;
  text-align: center;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.complete-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.complete-card h2 {
  font-size: 2rem;
  margin: 0 0 16px 0;
  color: #1e293b;
}

.final-score {
  font-size: 1.5rem;
  font-weight: 600;
  color: #3b82f6;
  margin: 0 0 32px 0;
}

.complete-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.restart-btn, .home-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.restart-btn {
  background: #3b82f6;
  color: white;
}

.restart-btn:hover {
  background: #2563eb;
}

.home-btn {
  background: #6b7280;
  color: white;
}

.home-btn:hover {
  background: #4b5563;
}

@media (max-width: 768px) {
  .game-header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .game-stats {
    justify-content: center;
  }
  
  .setup-card {
    margin: 20px;
    padding: 24px;
  }
  
  .complete-actions {
    flex-direction: column;
  }
}
</style>