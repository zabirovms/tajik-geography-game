<template>
  <div class="shapes-game">
    <GameContainer
      :game-state="gameState"
      :score="score"
      :question="currentQuestion"
      :questions="questions"
      :feedback="feedback"
      :time-left="timeLeft"
      :game-mode="gameMode"
      :difficulty="difficulty"
      @start-game="startGame"
      @restart-game="restartGame"
      @go-home="goHome"
      @answer="handleAnswer"
      @set-game-mode="setGameMode"
      @set-difficulty="setDifficulty"
    >
      <!-- Game Content Slot -->
      <template #game-content>
        <div class="map-game-container">
          <!-- Question Display -->
          <div v-if="currentQuestion" class="question-display">
            <h2 class="question-text">{{ getQuestionText() }}</h2>
            <div class="question-meta">
              <span class="question-number">Савол {{ currentQuestionIndex + 1 }} аз {{ totalQuestions }}</span>
              <span class="continent-info" v-if="currentQuestion.continent">
                {{ currentQuestion.continent }}
              </span>
            </div>
          </div>

          <!-- Interactive World Map -->
          <WorldMap
            v-if="gameState === 'playing'"
            :selected-country="selectedCountry"
            :country-feedback="countryFeedback"
            :is-find-country-mode="true"
            :color-mode="mapColorMode"
            @country-click="handleCountryClick"
            @continent-hover="handleContinentHover"
          />

          <!-- Game Instructions -->
          <div v-else class="game-instructions">
            <div class="instruction-card">
              <div class="instruction-icon">🗺️</div>
              <h3>Шаклҳои кишварҳо</h3>
              <p>Кишварҳоро дар харитаи интерактивӣ пайдо кунед ва зер кунед!</p>
              
              <div class="game-features">
                <div class="feature">
                  <span class="feature-icon">🌍</span>
                  <span>Харитаи интерактивии ҷаҳон</span>
                </div>
                <div class="feature">
                  <span class="feature-icon">🎯</span>
                  <span>Намоиши дақиқи кишварҳо</span>
                </div>
                <div class="feature">
                  <span class="feature-icon">📊</span>
                  <span>Сатҳҳои мушкилии гуногун</span>
                </div>
                <div class="feature">
                  <span class="feature-icon">⭐</span>
                  <span>Нишондиҳандаи пешрафт</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Map Controls -->
          <div v-if="gameState === 'playing'" class="map-controls">
            <div class="control-group">
              <label>Намоиши харита:</label>
              <select v-model="mapColorMode" class="control-select">
                <option value="continents">Қитъаҳо</option>
                <option value="unique">Кишварҳои алоҳида</option>
                <option value="plain">Оддӣ</option>
              </select>
            </div>
          </div>
        </div>
      </template>
    </GameContainer>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import GameContainer from '@/components/GameContainer.vue'
import WorldMap from '@/components/WorldMap.vue'
import apiService from '@/utils/api.js'
import { generateShapesQuestion, calculateMapScore } from '@/utils/gameUtils.js'

export default {
  name: 'ShapesGame',
  components: {
    GameContainer,
    WorldMap
  },
  setup() {
    const router = useRouter()
    
    // Game state
    const gameState = ref('setup')
    const gameMode = ref('country-to-shape')
    const difficulty = ref('medium')
    const score = ref(0)
    const timeLeft = ref(0)
    const currentQuestionIndex = ref(0)
    const totalQuestions = ref(10)
    const questions = ref([])
    const currentQuestion = ref(null)
    const feedback = ref(null)
    const isLoading = ref(false)
    const error = ref(null)
    const countries = ref([])
    
    // Map-specific state
    const selectedCountry = ref('')
    const countryFeedback = ref(null)
    const mapColorMode = ref('continents')
    
    // Computed properties
    const getQuestionText = () => {
      if (!currentQuestion.value) return ''
      
      if (gameMode.value === 'country-to-shape') {
        return `${currentQuestion.value.localizedName}-ро дар харита пайдо кунед`
      } else {
        return `Ин кишвар кадом аст?`
      }
    }
    
    // Game logic methods
    const loadCountries = async () => {
      isLoading.value = true
      error.value = null
      
      try {
        countries.value = await apiService.getAllCountries()
        console.log(`Loaded ${countries.value.length} countries for shapes game`)
      } catch (err) {
        console.error('Failed to load countries:', err)
        error.value = 'Хато дар боркунии маълумот. Лутфан интернет пайвастагии худро санҷед.'
      } finally {
        isLoading.value = false
      }
    }
    
    const generateQuestions = () => {
      const filteredCountries = apiService.getCountriesByDifficulty(countries.value, difficulty.value)
      questions.value = []
      
      for (let i = 0; i < totalQuestions.value; i++) {
        const question = generateShapesQuestion(filteredCountries, gameMode.value)
        if (question) {
          questions.value.push(question)
        }
      }
      
      if (questions.value.length === 0) {
        error.value = 'Хато дар тайёр кардани саволҳо. Лутфан дубора кӯшиш кунед.'
        return
      }
      
      currentQuestionIndex.value = 0
      currentQuestion.value = questions.value[0]
    }
    
    const startGame = () => {
      if (countries.value.length === 0) {
        error.value = 'Маълумот ҳанӯз бор нашудааст. Лутфан мунтазир шавед.'
        return
      }
      
      generateQuestions()
      if (questions.value.length === 0) return
      
      gameState.value = 'playing'
      score.value = 0
      timeLeft.value = difficulty.value === 'easy' ? 45 : difficulty.value === 'medium' ? 30 : 20
      feedback.value = null
      selectedCountry.value = ''
      countryFeedback.value = null
      
      startTimer()
    }
    
    const startTimer = () => {
      const timer = setInterval(() => {
        timeLeft.value--
        if (timeLeft.value <= 0) {
          clearInterval(timer)
          handleTimeUp()
        }
      }, 1000)
    }
    
    const handleTimeUp = () => {
      feedback.value = {
        type: 'incorrect',
        message: 'Вақт тамом! Ҷавоби дуруст: ' + currentQuestion.value.localizedName,
        isCorrect: false
      }
      
      setTimeout(() => {
        nextQuestion()
      }, 2000)
    }
    
    const handleCountryClick = (countryCode) => {
      if (gameState.value !== 'playing' || !currentQuestion.value) return
      
      selectedCountry.value = countryCode
      
      // Find country data for the clicked country
      const clickedCountry = countries.value.find(c => c.cca2 === countryCode)
      const isCorrect = currentQuestion.value.cca2 === countryCode
      
      countryFeedback.value = {
        countryCode,
        isCorrect
      }
      
      if (isCorrect) {
        const points = calculateMapScore(timeLeft.value, difficulty.value)
        score.value += points
        
        feedback.value = {
          type: 'correct',
          message: `Офарин! +${points} холл`,
          isCorrect: true
        }
      } else {
        feedback.value = {
          type: 'incorrect', 
          message: `Нодуруст! Ин ${clickedCountry?.localizedName || countryCode} аст. Ҷавоби дуруст: ${currentQuestion.value.localizedName}`,
          isCorrect: false
        }
      }
      
      setTimeout(() => {
        nextQuestion()
      }, 2500)
    }
    
    const nextQuestion = () => {
      currentQuestionIndex.value++
      
      if (currentQuestionIndex.value >= questions.value.length) {
        endGame()
        return
      }
      
      currentQuestion.value = questions.value[currentQuestionIndex.value]
      feedback.value = null
      selectedCountry.value = ''
      countryFeedback.value = null
      timeLeft.value = difficulty.value === 'easy' ? 45 : difficulty.value === 'medium' ? 30 : 20
      
      startTimer()
    }
    
    const endGame = () => {
      gameState.value = 'finished'
      feedback.value = {
        type: 'game-complete',
        message: `Бозӣ тамом! Натиҷаи шумо: ${score.value} холл`,
        isCorrect: true
      }
    }
    
    const restartGame = () => {
      gameState.value = 'setup'
      score.value = 0
      currentQuestionIndex.value = 0
      currentQuestion.value = null
      feedback.value = null
      selectedCountry.value = ''
      countryFeedback.value = null
      questions.value = []
    }
    
    const goHome = () => {
      router.push('/')
    }
    
    const setGameMode = (mode) => {
      gameMode.value = mode
    }
    
    const setDifficulty = (level) => {
      difficulty.value = level
    }
    
    const handleAnswer = (answer) => {
      // This method is kept for GameContainer compatibility
      // but shapes game uses direct country clicking
    }
    
    const handleContinentHover = (continentId) => {
      // Handle continent hover events if needed
    }
    
    // Lifecycle
    onMounted(() => {
      loadCountries()
    })
    
    return {
      // Game state
      gameState,
      gameMode,
      difficulty,
      score,
      timeLeft,
      currentQuestionIndex,
      totalQuestions,
      currentQuestion,
      feedback,
      isLoading,
      error,
      
      // Map state
      selectedCountry,
      countryFeedback,
      mapColorMode,
      
      // Methods
      getQuestionText,
      startGame,
      restartGame,
      goHome,
      handleAnswer,
      handleCountryClick,
      handleContinentHover,
      setGameMode,
      setDifficulty
    }
  }
}
</script>

<style scoped>
.shapes-game {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

.map-game-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 20px;
}

.question-display {
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.question-text {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
  text-align: center;
}

.question-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #64748b;
}

.question-number {
  font-weight: 500;
}

.continent-info {
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.game-instructions {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  padding: 40px;
}

.instruction-card {
  background: rgba(255, 255, 255, 0.95);
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  text-align: center;
  max-width: 500px;
}

.instruction-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.instruction-card h3 {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 16px 0;
}

.instruction-card p {
  font-size: 1.1rem;
  color: #64748b;
  margin: 0 0 32px 0;
  line-height: 1.6;
}

.game-features {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  text-align: left;
}

.feature {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.feature-icon {
  font-size: 1.2rem;
}

.feature span:last-child {
  font-size: 0.9rem;
  font-weight: 500;
  color: #1e293b;
}

.map-controls {
  background: rgba(255, 255, 255, 0.9);
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.control-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.control-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
}

.control-select {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
}

.control-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

@media (max-width: 768px) {
  .question-text {
    font-size: 1.2rem;
  }
  
  .instruction-card {
    padding: 24px;
    margin: 20px;
  }
  
  .instruction-card h3 {
    font-size: 1.5rem;
  }
  
  .game-features {
    grid-template-columns: 1fr;
  }
  
  .question-meta {
    flex-direction: column;
    gap: 8px;
    align-items: center;
  }
}
</style>