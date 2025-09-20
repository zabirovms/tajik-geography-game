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
        <div class="setup-icon">🌍</div>
        <h2>Шаклҳои кишварҳо</h2>
        <p>Кишварҳоро дар харитаи интерактивӣ пайдо кунед!</p>
        
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
        
        <button @click="startGame" class="start-btn" :disabled="isLoading">
          {{ isLoading ? 'Бор мешавад...' : 'Оғози бозӣ' }}
        </button>
      </div>
    </div>

    <!-- Playing State -->
    <div v-if="gameState === 'playing'" class="game-playing">
      <!-- Question Display -->
      <div v-if="currentQuestion" class="question-card">
        <h2 class="question-text">{{ currentQuestion.localizedName }}-ро дар харита пайдо кунед</h2>
        <div class="question-info">
          <span class="continent">{{ currentQuestion.continent }}</span>
        </div>
      </div>

      <!-- Map Controls -->
      <div class="map-controls">
        <button @click="toggleView" class="control-btn">
          {{ isGlobeView ? '🗺️ Харитаи ҳамвор' : '🌍 Глобус' }}
        </button>
        <select v-model="colorMode" @change="updateColors" class="control-select">
          <option value="continents">Қитъаҳо</option>
          <option value="unique">Кишварҳои алоҳида</option>
          <option value="plain">Оддӣ</option>
        </select>
      </div>

      <!-- Interactive Map -->
      <div ref="chartContainer" class="map-container">
        <div v-if="mapLoading" class="map-loading">Харита бор мешавад...</div>
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
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as am5 from '@amcharts/amcharts5'
import * as am5map from '@amcharts/amcharts5/map'
import am5geodata_worldLow from '@amcharts/amcharts5-geodata/worldLow'
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated'
import apiService from '@/utils/api.js'

// Your exact Tajik country names from the React code
const countryNamesTajik = {
  "AF": "Афғонистон", "AL": "Албания", "DZ": "Алҷазоир", "AD": "Андорра", "AO": "Ангола",
  "AR": "Аргентина", "AM": "Арманистон", "AU": "Австралия", "AT": "Австрия", "AZ": "Озарбойҷон",
  "BS": "Багама", "BH": "Баҳрайн", "BD": "Бангладеш", "BB": "Барбадос", "BY": "Белорус",
  "BE": "Белгия", "BZ": "Белиз", "BJ": "Бенин", "BT": "Бутан", "BO": "Боливия",
  "BA": "Босния ва Ҳерсеговина", "BW": "Ботсвана", "BR": "Бразилия", "BN": "Бруней", "BG": "Болгария",
  "BF": "Буркина-Фасо", "BI": "Бурунди", "KH": "Камбоҷа", "CM": "Камерун", "CA": "Канада",
  "CV": "Кабо-Верде", "KY": "Кайман", "CF": "Ҷумҳурии Африқои Марказӣ", "TD": "Чад", "CL": "Чилӣ",
  "CN": "Чин", "CO": "Колумбия", "KM": "Комор", "CG": "Конго", "CD": "Ҷумҳурии Демократии Конго",
  "CK": "Ҷазираҳои Кук", "CR": "Коста-Рика", "HR": "Хорватия", "CU": "Куба", "CY": "Кипр",
  "CZ": "Чехия", "DK": "Дания", "DJ": "Ҷибутӣ", "DM": "Доминика", "DO": "Ҷумҳурии Доминика",
  "EC": "Эквадор", "EG": "Миср", "SV": "Салвадор", "GQ": "Гвинеяи Экваторӣ", "ER": "Эритрея",
  "EE": "Эстония", "SZ": "Эсватини", "ET": "Эфиопия", "FJ": "Фиҷӣ", "FI": "Финландия",
  "FR": "Фаронса", "GA": "Габон", "GM": "Гамбия", "GE": "Гурҷистон", "DE": "Олмон",
  "GH": "Гана", "GR": "Юнон", "GD": "Гренада", "GT": "Гватемала", "GN": "Гвинея",
  "GW": "Гвинея-Бисау", "GY": "Гайана", "HT": "Ҳаитӣ", "HN": "Ҳондурас", "HU": "Маҷористон",
  "IS": "Исландия", "IN": "Ҳиндустон", "ID": "Индонезия", "IR": "Эрон", "IQ": "Ироқ",
  "IE": "Ирландия", "IL": "Фаластин", "IT": "Италия", "CI": "Кот-д'Ивуар", "JM": "Ямайка",
  "JP": "Япония", "JO": "Урдун", "KZ": "Қазоқистон", "KE": "Кения", "KI": "Кирибати",
  "KP": "Кореяи Шимолӣ", "KR": "Кореяи Ҷанубӣ", "KW": "Кувайт", "KG": "Қирғизистон", "LA": "Лаос",
  "LV": "Латвия", "LB": "Лубнон", "LS": "Лесото", "LR": "Либерия", "LY": "Либия",
  "LI": "Лихтенштейн", "LT": "Литва", "LU": "Люксембург", "MO": "Макао", "MK": "Македонияи Шимолӣ",
  "MG": "Мадагаскар", "MW": "Малавӣ", "MY": "Малайзия", "ML": "Мали", "MT": "Малта",
  "MH": "Ҷазираҳои Маршалл", "MQ": "Мартиника", "MR": "Мавритания", "MU": "Маврикий", "YT": "Майот",
  "MX": "Мексика", "FM": "Микронезия", "MD": "Молдова", "MC": "Монако", "MN": "Муғулистон",
  "ME": "Монтенегро", "MS": "Монтсеррат", "MA": "Марокаш", "MZ": "Мозамбик", "MM": "Мянмар",
  "NA": "Намибия", "NR": "Нору", "NP": "Непал", "NL": "Нидерланд", "NZ": "Зеландияи Нав",
  "NI": "Никарагуа", "NE": "Нигер", "NG": "Нигерия", "NO": "Норвегия", "OM": "Уммон",
  "PK": "Покистон", "PW": "Палау", "PA": "Панама", "PG": "Папуа-Гвинеяи Нав", "PY": "Парагвай",
  "PE": "Перу", "PH": "Филиппин", "PL": "Полша", "PT": "Португалия", "QA": "Қатар",
  "RO": "Руминия", "RU": "Русия", "RW": "Руанда", "KN": "Сент-Китс ва Невис", "LC": "Сент-Люсия",
  "VC": "Сент-Винсент ва Гренадин", "WS": "Самоа", "SM": "Сан-Марино", "ST": "Сао Томе ва Принсипе",
  "SA": "Арабистони Саудӣ", "SN": "Сенегал", "RS": "Сербия", "SC": "Сейшелҳо", "SL": "Серра-Леоне",
  "SG": "Сингапур", "SK": "Словакия", "SI": "Словения", "SO": "Сомалӣ", "ZA": "Африқои Ҷанубӣ",
  "SS": "Судани Ҷанубӣ", "ES": "Испания", "LK": "Шри-Ланка", "SD": "Судан", "SR": "Суринам",
  "SJ": "Свалбард ва Ян Майен", "SE": "Шветсия", "SY": "Сурия", "TW": "Тайван", "TJ": "Тоҷикистон",
  "TZ": "Танзания", "TH": "Таиланд", "TL": "Тимор-Лесте", "TG": "Того", "TK": "Токелау",
  "TO": "Тонга", "TT": "Тринтидад ва Тобаго", "TN": "Тунис", "TR": "Туркия", "TM": "Туркманистон",
  "TC": "Ҷазираҳои Турк ва Кайкос", "TV": "Тувалу", "UG": "Уганда", "UA": "Украина",
  "AE": "Имороти Муттаҳидаи Араб", "GB": "Британияи Кабир", "US": "Иёлоти Муттаҳидаи Амрико", "UY": "Уругвай",
  "UZ": "Узбекистон", "VU": "Вануату", "VA": "Ватикан", "VE": "Венесуэла", "VN": "Ветнам",
  "WF": "Уолис ва Футуна", "EH": "Сахараи Ғарбӣ", "YE": "Йемен", "ZM": "Замбия", "ZW": "Зимбабве",
  "AQ": "Антарктика", "GL": "Гринландия"
}

const continents = [
  {
    id: "africa", name: "Africa", nameTajik: "Африқо", color: "#10B981",
    countries: ["DZ", "AO", "BJ", "BW", "BF", "BI", "CM", "CV", "CF", "TD", "KM", "CG", "CD", "CI", "DJ", "EG", "GQ", "ER", "ET", "GA", "GM", "GH", "GN", "GW", "KE", "LS", "LR", "LY", "MG", "MW", "ML", "MR", "MU", "MA", "MZ", "NA", "NE", "NG", "RW", "ST", "SN", "SC", "SL", "SO", "ZA", "SS", "SD", "SZ", "TZ", "TG", "TN", "UG", "ZM", "ZW"]
  },
  {
    id: "asia", name: "Asia", nameTajik: "Осиё", color: "#F59E0B",
    countries: ["AF", "AM", "AZ", "BH", "BD", "BT", "BN", "KH", "CN", "CY", "GE", "IN", "ID", "IR", "IQ", "IL", "JP", "JO", "KZ", "KW", "KG", "LA", "LB", "MY", "MV", "MN", "MM", "NP", "KP", "OM", "PK", "PS", "PH", "QA", "SA", "SG", "KR", "LK", "SY", "TW", "TJ", "TH", "TL", "TR", "TM", "AE", "UZ", "VN", "YE"]
  },
  {
    id: "europe", name: "Europe", nameTajik: "Аврупо", color: "#8B5CF6",
    countries: ["AL", "AD", "AT", "BY", "BE", "BA", "BG", "HR", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IS", "IE", "IT", "XK", "LV", "LI", "LT", "LU", "MK", "MT", "MD", "MC", "ME", "NL", "NO", "PL", "PT", "RO", "RU", "SM", "RS", "SK", "SI", "ES", "SE", "CH", "UA", "GB", "VA"]
  },
  {
    id: "north-america", name: "North America", nameTajik: "Амрикои Шимолӣ", color: "#EF4444",
    countries: ["AG", "BS", "BB", "BZ", "CA", "CR", "CU", "DM", "DO", "SV", "GD", "GT", "HT", "HN", "JM", "MX", "NI", "PA", "KN", "LC", "VC", "TT", "US"]
  },
  {
    id: "south-america", name: "South America", nameTajik: "Амрикои Ҷанубӣ", color: "#06B6D4",
    countries: ["AR", "BO", "BR", "CL", "CO", "EC", "FK", "GF", "GY", "PY", "PE", "SR", "UY", "VE"]
  },
  {
    id: "australia", name: "Australia & Oceania", nameTajik: "Австралия ва Уқёнусия", color: "#F97316",
    countries: ["AU", "FJ", "KI", "MH", "FM", "NR", "NZ", "PW", "PG", "WS", "SB", "TO", "TV", "VU"]
  },
  {
    id: "antarctica", name: "Antarctica", nameTajik: "Антарктида", color: "#64748B",
    countries: ["AQ"]
  }
]

export default {
  name: 'ShapesGame',
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
    
    // Map state - using working code from MapTest
    const chartContainer = ref(null)
    const isGlobeView = ref(false)
    const mapLoading = ref(true)
    const colorMode = ref('continents')
    
    let root = null
    let chart = null
    let polygonSeries = null
    let gameTimer = null
    
    // Helper functions from your React code
    const getContinentByCountry = (countryCode) => {
      return continents.find(continent => 
        continent.countries.includes(countryCode)
      )
    }

    const getUniqueCountryColor = (countryCode) => {
      let hash = 0
      for (let i = 0; i < countryCode.length; i++) {
        hash = countryCode.charCodeAt(i) + ((hash << 5) - hash)
      }
      
      const hue = Math.abs(hash) % 360
      const saturation = 0.7 + (Math.abs(hash) % 100) / 500
      const lightness = 0.5 + (Math.abs(hash) % 100) / 500
      
      const c = (1 - Math.abs(2 * lightness - 1)) * saturation
      const x = c * (1 - Math.abs(((hue / 60) % 2) - 1))
      const m = lightness - c / 2
      
      let r = 0, g = 0, b = 0
      if (0 <= hue && hue < 60) { r = c; g = x; b = 0 }
      else if (60 <= hue && hue < 120) { r = x; g = c; b = 0 }
      else if (120 <= hue && hue < 180) { r = 0; g = c; b = x }
      else if (180 <= hue && hue < 240) { r = 0; g = x; b = c }
      else if (240 <= hue && hue < 300) { r = x; g = 0; b = c }
      else if (300 <= hue && hue < 360) { r = c; g = 0; b = x }
      
      const toHex = (n) => Math.round((n + m) * 255).toString(16).padStart(2, '0')
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`
    }

    // Map methods - working code from MapTest
    const updateColors = () => {
      if (!polygonSeries) return
      
      polygonSeries.mapPolygons.each((polygon) => {
        const countryCode = polygon.dataItem?.get("id")
        if (!countryCode) return
        
        let color = "#E5E7EB"
        
        if (colorMode.value === "continents") {
          const continent = getContinentByCountry(countryCode)
          if (continent) color = continent.color
        } else if (colorMode.value === "unique") {
          color = getUniqueCountryColor(countryCode)
        }
        
        polygon.set("fill", am5.color(color))
      })
    }

    const initializeMap = () => {
      if (!chartContainer.value) return
      
      // Dispose existing
      if (root) root.dispose()
      
      // Create root exactly like your React code
      root = am5.Root.new(chartContainer.value)
      root.setThemes([am5themes_Animated.new(root)])
      
      // Create chart with projection
      const projection = isGlobeView.value ? 
        am5map.geoOrthographic() : 
        am5map.geoNaturalEarth1()
      
      chart = root.container.children.push(
        am5map.MapChart.new(root, {
          panX: "rotateX",
          panY: isGlobeView.value ? "rotateY" : "translateY",
          projection: projection,
          paddingBottom: 20,
          paddingTop: 20,
          paddingLeft: 20,
          paddingRight: 20
        })
      )
      
      // Create polygon series
      polygonSeries = chart.series.push(
        am5map.MapPolygonSeries.new(root, {
          geoJSON: am5geodata_worldLow
        })
      )
      
      // Configure polygons exactly like your React code
      polygonSeries.mapPolygons.template.setAll({
        tooltipText: "{name}",
        fill: am5.color("#E5E7EB"),
        stroke: am5.color("#FFFFFF"),
        strokeWidth: 0.5,
        interactive: true
      })
      
      // Add Tajik tooltips
      polygonSeries.mapPolygons.template.adapters.add("tooltipText", (text, target) => {
        const countryCode = target.dataItem?.get("id")
        if (countryCode && countryNamesTajik[countryCode]) {
          return countryNamesTajik[countryCode]
        }
        return text
      })
      
      // Add country click handler for the game
      polygonSeries.mapPolygons.template.on("click", (ev) => {
        const countryCode = ev.target.dataItem?.get("id")
        if (countryCode && gameState.value === 'playing') {
          handleCountryClick(countryCode)
        }
      })
      
      // When map loads, apply colors and hide loading
      polygonSeries.onPrivate("geoJSON", () => {
        updateColors()
        mapLoading.value = false
      })
      
      // Globe rotation like your React code
      if (isGlobeView.value) {
        chart.animate({
          key: "rotationX",
          to: 360,
          duration: 20000,
          loops: Infinity
        })
      }
      
      console.log('Shapes game map initialized:', { isGlobeView: isGlobeView.value, colorMode: colorMode.value })
    }

    const toggleView = async () => {
      mapLoading.value = true
      isGlobeView.value = !isGlobeView.value
      await nextTick()
      initializeMap()
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
      const filteredCountries = apiService.getCountriesByDifficulty(countries.value, difficulty.value)
      if (filteredCountries.length === 0) {
        console.warn('No countries found for difficulty:', difficulty.value)
        return null
      }
      const randomIndex = Math.floor(Math.random() * filteredCountries.length)
      const selectedCountry = filteredCountries[randomIndex]
      
      const continentNamesTajik = {
        'Africa': 'Африқо', 'Asia': 'Осиё', 'Europe': 'Аврупо',
        'North America': 'Амрикои Шимолӣ', 'South America': 'Амрикои Ҷанубӣ',
        'Americas': 'Амрикаҳо', 'Australia': 'Австралия ва Уқёнусия',
        'Oceania': 'Австралия ва Уқёнусия', 'Antarctica': 'Антарктида'
      }
      
      return {
        cca2: selectedCountry.cca2,
        localizedName: countryNamesTajik[selectedCountry.cca2] || selectedCountry.localizedName,
        continent: continentNamesTajik[selectedCountry.region] || selectedCountry.region
      }
    }

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
      
      // Initialize map
      nextTick(() => {
        initializeMap()
      })
    }

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

    // Lifecycle
    onMounted(() => {
      loadCountries()
    })

    onUnmounted(() => {
      if (root) root.dispose()
      if (gameTimer) clearInterval(gameTimer)
    })

    return {
      // Game state
      gameState, difficulty, score, timeLeft, currentQuestionIndex, totalQuestions,
      currentQuestion, feedback, isLoading,
      
      // Map state
      chartContainer, isGlobeView, mapLoading, colorMode,
      
      // Methods
      startGame, restartGame, goHome, toggleView, updateColors
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

.map-container {
  flex: 1;
  background: #f8fafc;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  position: relative;
  min-height: 400px;
}

.map-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 18px;
  color: #666;
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