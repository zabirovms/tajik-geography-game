<template>
  <div class="game-container">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Бор мешавад...</p>
    </div>

    <!-- Game State -->
    <div v-else-if="!gameComplete" class="game-active">
      <!-- Progress Header -->
      <div class="game-header">
        <div class="progress-info">
          <span class="question-counter">{{ currentQuestionIndex + 1 }} / {{ questions.length }}</span>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }"
            ></div>
          </div>
        </div>
        <div class="game-stats">
          <div class="score">Балл: {{ score }}</div>
          <div v-if="timeLimit > 0" class="timer">{{ formatTime(timeLeft) }}</div>
        </div>
      </div>

      <!-- Question Display -->
      <div class="question-section">
        <h2 class="question-text">{{ currentQuestion.question }}</h2>
        
        <!-- Flag image if present -->
        <div v-if="currentQuestion.flagImage" class="flag-display">
          <img 
            :src="currentQuestion.flagImage" 
            :alt="'Байрақи кишвар'"
            class="flag-image"
            @error="handleImageError"
          />
        </div>

        <!-- Answer Options -->
        <div class="options-container">
          <button
            v-for="(option, index) in currentQuestion.options"
            :key="index"
            :class="['option-btn', getOptionClass(index)]"
            :disabled="answered"
            @click="selectAnswer(index)"
          >
            <!-- Text option -->
            <span v-if="typeof option === 'string'">{{ option }}</span>
            
            <!-- Image option (for flag guessing) -->
            <div v-else-if="option.image" class="option-image">
              <img 
                :src="option.image" 
                :alt="option.alt"
                @error="handleImageError"
              />
            </div>
          </button>
        </div>
      </div>

      <!-- Next/Continue Button -->
      <div v-if="answered" class="continue-section">
        <div class="answer-feedback">
          <div v-if="selectedAnswer === currentQuestion.correctAnswer" class="correct-feedback">
            <span class="feedback-icon">✅</span>
            <span>Дуруст! +{{ lastScore }} балл</span>
          </div>
          <div v-else class="wrong-feedback">
            <span class="feedback-icon">❌</span>
            <span>Нодуруст. Ҷавоби дуруст: {{ getCorrectAnswerText() }}</span>
          </div>
        </div>
        <button class="next-btn" @click="nextQuestion">
          {{ currentQuestionIndex < questions.length - 1 ? 'Савол баъдӣ' : 'Хотима' }}
        </button>
      </div>
    </div>

    <!-- Results State -->
    <div v-else class="game-complete">
      <div class="results-container">
        <div class="achievement">
          <div class="achievement-emoji">{{ achievement.emoji }}</div>
          <h2 class="achievement-title">{{ achievement.title }}</h2>
        </div>
        
        <div class="final-stats">
          <div class="stat-item">
            <div class="stat-value">{{ score }}</div>
            <div class="stat-label">Балли умумӣ</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ correctAnswers }}</div>
            <div class="stat-label">Ҷавобҳои дуруст</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ Math.round((correctAnswers / questions.length) * 100) }}%</div>
            <div class="stat-label">Дақиқӣ</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ formatTime(totalTime) }}</div>
            <div class="stat-label">Вақти умумӣ</div>
          </div>
        </div>

        <div class="action-buttons">
          <button class="replay-btn" @click="restartGame">Аз нав бозӣ кардан</button>
          <button class="home-btn" @click="goHome">Бозгашт ба хона</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { calculateScore, getAchievement, formatTime } from '@/utils/gameUtils.js'

export default {
  name: 'GameContainer',
  props: {
    questions: {
      type: Array,
      required: true
    },
    timeLimit: {
      type: Number,
      default: 0 // 0 means no time limit
    }
  },
  emits: ['game-complete', 'restart', 'go-home'],
  data() {
    return {
      currentQuestionIndex: 0,
      selectedAnswer: null,
      answered: false,
      score: 0,
      correctAnswers: 0,
      gameComplete: false,
      isLoading: false,
      timeLeft: this.timeLimit,
      gameStartTime: null,
      questionStartTime: null,
      totalTime: 0,
      lastScore: 0,
      timer: null
    }
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentQuestionIndex] || {}
    },
    achievement() {
      return getAchievement(this.score, this.questions.length)
    }
  },
  mounted() {
    this.startGame()
  },
  beforeUnmount() {
    this.clearTimer()
  },
  methods: {
    startGame() {
      this.gameStartTime = Date.now()
      this.questionStartTime = Date.now()
      
      if (this.timeLimit > 0) {
        this.startTimer()
      }
    },

    startTimer() {
      this.timer = setInterval(() => {
        this.timeLeft--
        if (this.timeLeft <= 0) {
          this.timeUp()
        }
      }, 1000)
    },

    clearTimer() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },

    timeUp() {
      this.clearTimer()
      this.endGame()
    },

    selectAnswer(answerIndex) {
      if (this.answered) return

      this.selectedAnswer = answerIndex
      this.answered = true

      const timeSpent = Math.floor((Date.now() - this.questionStartTime) / 1000)
      const isCorrect = answerIndex === this.currentQuestion.correctAnswer

      if (isCorrect) {
        this.correctAnswers++
        this.lastScore = calculateScore(timeSpent, this.currentQuestion.difficulty, true)
        this.score += this.lastScore
      } else {
        this.lastScore = 0
      }
    },

    nextQuestion() {
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++
        this.selectedAnswer = null
        this.answered = false
        this.questionStartTime = Date.now()
      } else {
        this.endGame()
      }
    },

    endGame() {
      this.gameComplete = true
      this.totalTime = Math.floor((Date.now() - this.gameStartTime) / 1000)
      this.clearTimer()
      
      this.$emit('game-complete', {
        score: this.score,
        correctAnswers: this.correctAnswers,
        totalQuestions: this.questions.length,
        totalTime: this.totalTime,
        achievement: this.achievement
      })
    },

    restartGame() {
      this.currentQuestionIndex = 0
      this.selectedAnswer = null
      this.answered = false
      this.score = 0
      this.correctAnswers = 0
      this.gameComplete = false
      this.timeLeft = this.timeLimit
      this.totalTime = 0
      this.lastScore = 0
      
      this.$emit('restart')
      this.startGame()
    },

    goHome() {
      this.$emit('go-home')
      this.$router.push('/')
    },

    getOptionClass(index) {
      if (!this.answered) return ''
      
      if (index === this.currentQuestion.correctAnswer) {
        return 'correct'
      } else if (index === this.selectedAnswer) {
        return 'wrong'
      }
      return 'inactive'
    },

    getCorrectAnswerText() {
      const option = this.currentQuestion.options[this.currentQuestion.correctAnswer]
      return typeof option === 'string' ? option : option.alt || 'Номаълум'
    },

    handleImageError(event) {
      console.warn('Failed to load image:', event.target.src)
      event.target.style.display = 'none'
    },

    formatTime
  }
}
</script>

<style scoped>
.game-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.loading-state {
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

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.progress-info {
  flex: 1;
}

.question-counter {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  display: block;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #2979FF, #1976D2);
  transition: width 0.3s ease;
}

.game-stats {
  display: flex;
  gap: 1rem;
  font-weight: 600;
}

.score {
  color: #4CAF50;
}

.timer {
  color: #FF9800;
}

.question-section {
  text-align: center;
  margin-bottom: 2rem;
}

.question-text {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  color: #333;
  line-height: 1.4;
}

.flag-display {
  margin-bottom: 2rem;
}

.flag-image {
  max-width: 200px;
  height: auto;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.options-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto;
}

.option-btn {
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 0.75rem;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.option-btn:hover:not(:disabled) {
  border-color: #2979FF;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(41, 121, 255, 0.2);
}

.option-btn.correct {
  border-color: #4CAF50;
  background-color: #E8F5E8;
  color: #2E7D32;
}

.option-btn.wrong {
  border-color: #F44336;
  background-color: #FFEBEE;
  color: #C62828;
}

.option-btn.inactive {
  opacity: 0.6;
}

.option-image img {
  max-width: 80px;
  height: auto;
  border-radius: 0.25rem;
}

.continue-section {
  text-align: center;
}

.answer-feedback {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border-radius: 0.75rem;
  font-weight: 500;
}

.correct-feedback {
  background-color: #E8F5E8;
  color: #2E7D32;
}

.wrong-feedback {
  background-color: #FFEBEE;
  color: #C62828;
}

.feedback-icon {
  font-size: 1.2rem;
  margin-right: 0.5rem;
}

.next-btn {
  background: #2979FF;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.next-btn:hover {
  background: #1976D2;
  transform: translateY(-2px);
}

.game-complete {
  text-align: center;
  padding: 2rem;
}

.achievement {
  margin-bottom: 2rem;
}

.achievement-emoji {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.achievement-title {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #333;
}

.final-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-item {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #2979FF;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.replay-btn, .home-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.replay-btn {
  background: #4CAF50;
  color: white;
}

.replay-btn:hover {
  background: #45A049;
}

.home-btn {
  background: #666;
  color: white;
}

.home-btn:hover {
  background: #555;
}

@media (max-width: 768px) {
  .game-header {
    flex-direction: column;
    gap: 1rem;
  }

  .game-stats {
    justify-content: center;
  }

  .options-container {
    grid-template-columns: 1fr;
  }

  .question-text {
    font-size: 1.2rem;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>