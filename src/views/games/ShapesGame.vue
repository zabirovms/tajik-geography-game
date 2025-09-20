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
        <h2>Бозиҳои интерактивии ҷуғрофия</h2>
        <p>Намуди бозӣ ва сатҳи мушкилиро интихоб кунед!</p>
        
        <div class="setup-options">
          <div class="option-group">
            <label>Намуди бозӣ:</label>
            <select v-model="gameMode" class="setup-select">
              <option value="map-shapes">🗺️ Шаклҳои кишварҳо</option>
              <option value="population-bars">📊 Муқоисаи аҳолӣ</option>
              <option value="area-pie">🥧 Андозаи минтақаҳо</option>
              <option value="gdp-lines">💰 Иқтисодиёти кишварҳо</option>
              <option value="capital-distance">📍 Масофаи пойтахтҳо</option>
            </select>
          </div>
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
          <p>{{ getGameDescription() }}</p>
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
        <h2 class="question-text">{{ getQuestionText() }}</h2>
        <div class="question-info">
          <span class="continent">{{ currentQuestion.continent }}</span>
          <span v-if="currentQuestion.options" class="options-hint">{{ currentQuestion.options.length }} варианта</span>
        </div>
      </div>

      <!-- Map Game Controls -->
      <div v-if="gameMode === 'map-shapes'" class="map-controls">
        <button @click="toggleView" class="control-btn">
          {{ isGlobeView ? '🗺️ Харитаи ҳамвор' : '🌍 Глобус' }}
        </button>
        <select v-model="colorMode" @change="updateColors" class="control-select">
          <option value="continents">Қитъаҳо</option>
          <option value="unique">Кишварҳои алоҳида</option>
          <option value="plain">Оддӣ</option>
        </select>
      </div>

      <!-- Chart Game Options -->
      <div v-if="gameMode !== 'map-shapes' && currentQuestion?.options" class="chart-options">
        <div class="options-grid">
          <button 
            v-for="(option, index) in currentQuestion.options" 
            :key="index"
            @click="handleOptionClick(option)"
            class="option-btn"
            :class="{ 'correct': option.isCorrect, 'incorrect': option.isWrong }"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <!-- Interactive Chart Container -->
      <div ref="chartContainer" class="chart-container" :class="gameMode">
        <div v-if="mapLoading" class="chart-loading">{{ getLoadingText() }}</div>
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
import * as am5xy from '@amcharts/amcharts5/xy'
import * as am5percent from '@amcharts/amcharts5/percent'
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
    const gameMode = ref('map-shapes')
    const difficulty = ref('medium')
    const score = ref(0)
    const timeLeft = ref(0)
    const currentQuestionIndex = ref(0)
    const totalQuestions = ref(10)
    const currentQuestion = ref(null)
    const feedback = ref(null)
    const isLoading = ref(false)
    const countries = ref([])
    
    // Chart containers for different game modes
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
      polygonSeries.mapPolygons.template.events.on("click", (ev) => {
        const countryCode = ev.target.dataItem?.get("id")
        if (countryCode && gameState.value === 'playing') {
          handleCountryClick(countryCode)
        }
      })
      
      // When map loads, apply colors and hide loading
      polygonSeries.events.on("datavalidated", () => {
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
      switch (gameMode.value) {
        case 'map-shapes':
          return generateMapQuestion()
        case 'population-bars':
          return generatePopulationQuestion()
        case 'area-pie':
          return generateAreaQuestion()
        case 'gdp-lines':
          return generateGDPQuestion()
        case 'capital-distance':
          return generateDistanceQuestion()
        default:
          return generateMapQuestion()
      }
    }

    const generateMapQuestion = () => {
      const filteredCountries = apiService.getCountriesByDifficulty(countries.value, difficulty.value)
      if (filteredCountries.length === 0) return null
      
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

    const generatePopulationQuestion = () => {
      const dataKeys = Object.keys(sampleData.population)
      const correctIndex = Math.floor(Math.random() * Math.min(4, dataKeys.length))
      const selectedKeys = dataKeys.slice(0, 4)
      
      const options = selectedKeys.map((key, index) => ({
        label: sampleData.population[key].name,
        value: sampleData.population[key].value,
        isCorrect: index === correctIndex,
        cca2: key
      }))
      
      return {
        localizedName: 'Population Question',
        continent: 'Chart Data',
        options,
        correctAnswer: options[correctIndex]
      }
    }

    const generateAreaQuestion = () => {
      const areaData = {
        'RU': { name: 'Русия', value: 17098242 },
        'CA': { name: 'Канада', value: 9984670 },
        'US': { name: 'ИМА', value: 9826675 },
        'CN': { name: 'Чин', value: 9596960 }
      }
      
      const dataKeys = Object.keys(areaData)
      const options = dataKeys.map((key, index) => ({
        label: areaData[key].name,
        value: areaData[key].value,
        isCorrect: index === 0, // Russia is largest
        cca2: key
      }))
      
      return {
        localizedName: 'Area Question',
        continent: 'Chart Data',
        options,
        correctAnswer: options[0]
      }
    }

    const generateGDPQuestion = () => {
      const dataKeys = Object.keys(sampleData.gdp)
      const correctIndex = Math.floor(Math.random() * Math.min(4, dataKeys.length))
      const selectedKeys = dataKeys.slice(0, 4)
      
      const options = selectedKeys.map((key, index) => ({
        label: sampleData.gdp[key].name,
        value: sampleData.gdp[key].value,
        isCorrect: index === correctIndex,
        cca2: key
      }))
      
      return {
        localizedName: 'GDP Question',
        continent: 'Chart Data',
        options,
        correctAnswer: options[correctIndex]
      }
    }

    const generateDistanceQuestion = () => {
      const capitalData = {
        'TJ': { name: 'Душанбе', lat: 38.5598, lng: 68.7870 },
        'UZ': { name: 'Тошканд', lat: 41.2995, lng: 69.2401 },
        'KG': { name: 'Бишкек', lat: 42.8746, lng: 74.5698 },
        'KZ': { name: 'Нур-Султон', lat: 51.1694, lng: 71.4491 }
      }
      
      const dataKeys = Object.keys(capitalData)
      const options = dataKeys.map((key, index) => ({
        label: capitalData[key].name,
        distance: Math.random() * 1000 + 100, // Mock distances
        isCorrect: index === 1, // Tashkent closest to Dushanbe
        cca2: key
      }))
      
      return {
        localizedName: 'Distance Question',
        continent: 'Chart Data',
        options,
        correctAnswer: options[1]
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
      
      // Initialize appropriate chart
      nextTick(() => {
        mapLoading.value = true
        initializeChart()
      })
    }

    const initializeChart = () => {
      switch (gameMode.value) {
        case 'map-shapes':
          initializeMap()
          break
        case 'population-bars':
          initializeBarChart()
          break
        case 'area-pie':
          initializePieChart()
          break
        case 'gdp-lines':
          initializeLineChart()
          break
        case 'capital-distance':
          initializeScatterChart()
          break
        default:
          initializeMap()
      }
    }

    const initializeBarChart = () => {
      if (!chartContainer.value) return
      if (root) root.dispose()
      
      root = am5.Root.new(chartContainer.value)
      root.setThemes([am5themes_Animated.new(root)])
      
      const chart = root.container.children.push(am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        paddingLeft: 0
      }))
      
      const yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, {
        categoryField: "country",
        renderer: am5xy.AxisRendererY.new(root, {
          minGridDistance: 10
        })
      }))
      
      const xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererX.new(root, {})
      }))
      
      const series = chart.series.push(am5xy.ColumnSeries.new(root, {
        name: "Population",
        xAxis: xAxis,
        yAxis: yAxis,
        valueXField: "value",
        categoryYField: "country"
      }))
      
      const data = Object.values(sampleData.population).slice(0, 5)
      yAxis.data.setAll(data.map(d => ({ country: d.name })))
      series.data.setAll(data.map(d => ({ country: d.name, value: d.value })))
      
      // Ensure loading stops when chart is ready
      series.events.on("datavalidated", () => {
        mapLoading.value = false
      })
    }

    const initializePieChart = () => {
      if (!chartContainer.value) return
      if (root) root.dispose()
      
      root = am5.Root.new(chartContainer.value)
      root.setThemes([am5themes_Animated.new(root)])
      
      const chart = root.container.children.push(am5percent.PieChart.new(root, {
        layout: root.verticalLayout
      }))
      
      const series = chart.series.push(am5percent.PieSeries.new(root, {
        valueField: "value",
        categoryField: "country"
      }))
      
      const areaData = [
        { country: "Русия", value: 17098242 },
        { country: "Канада", value: 9984670 },
        { country: "ИМА", value: 9826675 },
        { country: "Чин", value: 9596960 },
        { country: "Бразилия", value: 8514877 }
      ]
      
      series.data.setAll(areaData)
      
      // Ensure loading stops when chart is ready
      series.events.on("datavalidated", () => {
        mapLoading.value = false
      })
    }

    const initializeLineChart = () => {
      if (!chartContainer.value) return
      if (root) root.dispose()
      
      root = am5.Root.new(chartContainer.value)
      root.setThemes([am5themes_Animated.new(root)])
      
      const chart = root.container.children.push(am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX"
      }))
      
      const xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
        categoryField: "country",
        renderer: am5xy.AxisRendererX.new(root, {})
      }))
      
      const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {})
      }))
      
      const series = chart.series.push(am5xy.LineSeries.new(root, {
        name: "GDP",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        categoryXField: "country"
      }))
      
      const data = Object.values(sampleData.gdp).slice(0, 6)
      xAxis.data.setAll(data.map(d => ({ country: d.name })))
      series.data.setAll(data.map(d => ({ country: d.name, value: d.value })))
      
      // Ensure loading stops when chart is ready
      series.events.on("datavalidated", () => {
        mapLoading.value = false
      })
    }

    const initializeScatterChart = () => {
      if (!chartContainer.value) return
      if (root) root.dispose()
      
      root = am5.Root.new(chartContainer.value)
      root.setThemes([am5themes_Animated.new(root)])
      
      const chart = root.container.children.push(am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX"
      }))
      
      const xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererX.new(root, {})
      }))
      
      const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {})
      }))
      
      const series = chart.series.push(am5xy.XYSeries.new(root, {
        name: "Distances",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "distance",
        valueXField: "index",
        tooltip: am5.Tooltip.new(root, {
          labelText: "{city}: {distance} км"
        })
      }))
      
      // Add circles for scatter plot
      series.set("fill", am5.color("#3b82f6"))
      series.bullets.push(() => {
        return am5.Bullet.new(root, {
          sprite: am5.Circle.new(root, {
            radius: 6,
            fill: am5.color("#3b82f6")
          })
        })
      })
      
      const distanceData = [
        { index: 1, distance: 340, city: "Тошканд" },
        { index: 2, distance: 680, city: "Бишкек" },
        { index: 3, distance: 1240, city: "Нур-Султон" },
        { index: 4, distance: 920, city: "Ашғобот" }
      ]
      
      series.data.setAll(distanceData)
      
      // Ensure loading stops when chart is ready
      series.events.on("datavalidated", () => {
        mapLoading.value = false
      })
    }

    const handleOptionClick = (option) => {
      if (!currentQuestion.value || gameState.value !== 'playing') return
      
      if (gameTimer) clearInterval(gameTimer)
      
      if (option.isCorrect) {
        const points = 10 + timeLeft.value * 2
        score.value += points
        
        feedback.value = {
          type: 'correct',
          message: `Офарин! +${points} балл`
        }
      } else {
        feedback.value = {
          type: 'incorrect',
          message: `Нодуруст! Ҷавоби дуруст: ${currentQuestion.value.correctAnswer?.label}`
        }
      }
      
      setTimeout(() => {
        nextQuestion()
      }, 2500)
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
      return descriptions[gameMode.value] || descriptions['map-shapes']
    }

    const getQuestionText = () => {
      if (!currentQuestion.value) return ''
      
      switch (gameMode.value) {
        case 'map-shapes':
          return `${currentQuestion.value.localizedName}-ро дар харита пайдо кунед`
        case 'population-bars':
          return `Кадом кишвар бештарин аҳолӣ дорад?`
        case 'area-pie':
          return `Кадом кишвар калонтарин минтақа дорад?`
        case 'gdp-lines':
          return `Кадом кишвар қувватарин иқтисодиёт дорад?`
        case 'capital-distance':
          return `Кадом пойтахт наздиктарин аст?`
        default:
          return `${currentQuestion.value.localizedName}-ро пайдо кунед`
      }
    }

    const getLoadingText = () => {
      const loadingTexts = {
        'map-shapes': 'Харита бор мешавад...',
        'population-bars': 'Диаграммаи аҳолӣ бор мешавад...',
        'area-pie': 'Диаграммаи минтақаҳо бор мешавад...',
        'gdp-lines': 'Диаграммаи иқтисодӣ бор мешавад...',
        'capital-distance': 'Диаграммаи масофа бор мешавад...'
      }
      return loadingTexts[gameMode.value] || 'Бор мешавад...'
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
      gameState, gameMode, difficulty, score, timeLeft, currentQuestionIndex, totalQuestions,
      currentQuestion, feedback, isLoading, countries,
      
      // Chart state
      chartContainer, isGlobeView, mapLoading, colorMode,
      
      // Methods
      startGame, restartGame, goHome, toggleView, updateColors, getGameDescription,
      getQuestionText, getLoadingText, handleOptionClick, handleCountryClick
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