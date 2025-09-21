<template>
  <main class="container">
    <!-- Welcome Section -->
    <div class="welcome-section">
      <h1 class="title">Чолиши дониши ҷуғрофия</h1>
      <p class="subtitle">Дониши ҷуғрофияи худро санҷед, балли болоро ба даст оваред!</p>
      
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
        placeholder="Ҷустуҷуи режимҳои бозӣ"
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

    <!-- Interactive Learning Map -->
    <div class="learning-section">
      <div class="learning-header">
        <h2 class="learning-title">🌍 Харитаи таълимӣ</h2>
        <p class="learning-subtitle">Ҷаҳонро кашф кунед ва дар бораи кишварҳо маълумот гиред</p>
      </div>
      
      <div class="learning-map-container">
        <WorldMapViewer 
          mode="learning"
          :show-controls="true"
          loading-text="Харитаи таълимӣ бор мешавад..."
          @country-click="handleCountryClick"
          @country-hover="handleCountryHover"
          @map-ready="onMapReady"
        />
      </div>
      
      <!-- Enhanced Country Info Panel -->
      <div v-if="selectedCountryInfo" class="country-info-panel enhanced">
        <div v-if="isLoadingCountryData" class="loading-indicator">
          <div class="spinner"></div>
          <p>Маълумот дарёфт мешавад...</p>
        </div>
        
        <div v-else-if="countryDetails" class="country-details">
          <!-- Header with flag and basic info -->
          <div class="country-header">
            <div class="flag-container">
              <img 
                v-if="countryDetails.flag.png" 
                :src="countryDetails.flag.png" 
                :alt="countryDetails.flag.alt"
                class="country-flag"
                loading="lazy"
              />
              <span v-else class="flag-emoji">{{ countryDetails.flag.emoji }}</span>
            </div>
            <div class="country-title-info">
              <h3 class="country-name">{{ countryDetails.name.common }}</h3>
              <p class="country-official">{{ countryDetails.name.official }}</p>
              <span v-if="selectedCountryInfo.continent" class="continent-badge">
                {{ selectedCountryInfo.continent.nameTajik }}
              </span>
            </div>
          </div>

          <!-- Key Statistics -->
          <div class="country-stats">
            <div class="stat-item">
              <span class="stat-icon">🏛️</span>
              <div class="stat-content">
                <strong>Пойтахт:</strong>
                <span>{{ countryDetails.capital.join(', ') || 'Номаълум' }}</span>
              </div>
            </div>
            
            <div class="stat-item">
              <span class="stat-icon">👥</span>
              <div class="stat-content">
                <strong>Аҳолӣ:</strong>
                <span>{{ formatNumber(countryDetails.population) }}</span>
              </div>
            </div>
            
            <div class="stat-item">
              <span class="stat-icon">📐</span>
              <div class="stat-content">
                <strong>Масоҳат:</strong>
                <span>{{ formatArea(countryDetails.area) }}</span>
              </div>
            </div>
            
            <div class="stat-item" v-if="countryDetails.languages.length > 0">
              <span class="stat-icon">🗣️</span>
              <div class="stat-content">
                <strong>Забонҳо:</strong>
                <span>{{ countryDetails.languages.slice(0, 3).join(', ') }}</span>
              </div>
            </div>
            
            <div class="stat-item" v-if="countryDetails.currencies.length > 0">
              <span class="stat-icon">💰</span>
              <div class="stat-content">
                <strong>Асъор:</strong>
                <span>{{ formatCurrencies(countryDetails.currencies) }}</span>
              </div>
            </div>
          </div>

          <!-- Fun Facts Section -->
          <div v-if="countryDetails.funFacts.length > 0" class="fun-facts">
            <h4 class="section-title">🎯 Фактҳои ҷолиб</h4>
            <ul class="facts-list">
              <li v-for="(fact, index) in countryDetails.funFacts.slice(0, 3)" :key="index" class="fact-item">
                {{ fact }}
              </li>
            </ul>
          </div>

          <!-- Educational Tips -->
          <div v-if="countryDetails.educationalTips.length > 0" class="educational-tips">
            <h4 class="section-title">📚 Маълумоти таълимӣ</h4>
            <ul class="tips-list">
              <li v-for="(tip, index) in countryDetails.educationalTips" :key="index" class="tip-item">
                {{ tip }}
              </li>
            </ul>
          </div>

          <!-- Action Buttons -->
          <div class="country-actions">
            <button 
              v-if="countryDetails.maps.googleMaps" 
              @click="openMap(countryDetails.maps.googleMaps)"
              class="action-btn map-btn"
            >
              🗺️ Дар харита дидан
            </button>
            <button 
              v-if="countryDetails.borders.length > 0"
              @click="exploreBorders(countryDetails.borders)"
              class="action-btn borders-btn"
            >
              🌍 Кишварҳои ҳамсоя ({{ countryDetails.borders.length }})
            </button>
            <button 
              @click="learnMoreAboutRegion(countryDetails.region)"
              class="action-btn region-btn"
            >
              🌏 Минтақаи {{ countryDetails.region }}
            </button>
            <button 
              @click="addToLearningList(countryDetails)"
              class="action-btn bookmark-btn"
            >
              ⭐ Барои баъд нигоҳ доштан
            </button>
          </div>
          
          <!-- Quick Learning Stats -->
          <div class="quick-stats">
            <div class="quick-stat">
              <span class="quick-stat-number">{{ getCountryRank('population') }}</span>
              <span class="quick-stat-label">Ранги аҳолӣ дар ҷаҳон</span>
            </div>
            <div class="quick-stat">
              <span class="quick-stat-number">{{ getCountryRank('area') }}</span>
              <span class="quick-stat-label">Ранги масоҳат дар ҷаҳон</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Game List -->
    <div class="game-list">
      <div v-if="filteredGames.length === 0" class="no-games">
        <p>Дар ин қисм бозӣҳо мавҷуд нестанд</p>
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
              Дараҷа: {{ "★".repeat(game.modes[0].difficulty) }}{{ "☆".repeat(3 - game.modes[0].difficulty) }}
            </div>
          </div>
          <p class="game-bonus">Мукофоти якумин гузариш: {{ game.rewards.firstWin }} балл</p>
        </div>
      </div>
    </div>

    <!-- Game Details Modal -->
    <div v-if="showDetails" class="modal-overlay" @click="closeDetails">
      <div class="modal-content" @click.stop>
        <h2 class="modal-title">{{ selectedGame.title }}</h2>
        <p class="modal-description">{{ selectedGame.description }}</p>
        <div class="modal-buttons">
          <button class="btn btn-primary" @click.stop="startGame(selectedGame.path)">
            Шуруъ кардани бозӣ
          </button>
          <button class="btn" @click="closeDetails">Пӯшидан</button>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import WorldMapViewer from '@/components/WorldMapViewer.vue'
import countryAPI from '@/services/countryAPI.js'

export default {
  name: 'Home',
  components: {
    WorldMapViewer
  },
  data() {
    return {
      showDetails: false,
      selectedGame: {},
      searchKey: '',
      currentCategory: 'Ҳама',
      selectedCountryInfo: null,
      countryDetails: null,
      isLoadingCountryData: false,
      categories: ['Ҳама', 'Осон', 'Пешрафта', 'Чолиш', 'Чандин нафара'],
      statsData: [
        { value: '6', label: 'Режимҳои бозӣ' },
        { value: '200+', label: 'Миқдори масалаҳо' },
        { value: '10K+', label: 'Шумораи чолишҳо' }
      ],
      games: {
        flags: {
          title: 'Чолиши байрақ',
          description: 'Фарҳанги байрақҳои мамлакатҳои ҷаҳонро мукашшиф созед, аз шинохти содаи байрақҳо то фаҳми амиқи торих ва маънии онҳо.',
          modes: [
            { name: 'Режими ибтидоӣ', desc: 'Шинохти байрақҳои асосии мамлакатҳо', difficulty: 1 },
            { name: 'Режими олӣ', desc: 'Чолиши байрақҳои нодир ва шабеҳ', difficulty: 2 }
          ],
          rewards: { firstWin: 100 },
          path: '/games/flags'
        },
        shapes: {
          title: 'Чолиши шаклҳо',
          description: 'Бо шаклҳои ҳудуди мамлакатҳо дониши ҷуғрофияи худро санҷед ва қобилияти ташхиси фазоӣро инкишоф диҳед.',
          modes: [
            { name: 'Шинохти паё', desc: 'Омӯхти шаклҳои мумтози мамлакатҳо', difficulty: 2 },
            { name: 'Чолиши суръат', desc: 'Дар вақти муайян ташхиси шаклҳои мамлакатҳо', difficulty: 3 }
          ],
          rewards: { firstWin: 150 },
          path: '/games/shapes'
        },
        capitals: {
          title: 'Чолиши пойтахтҳо',
          description: 'Шинохти шумо нисбат ба пойтахтҳои мамлакатҳои ҷаҳонро санҷед, аз таносуби содаи пойтахтҳо то дониши амиқи торихӣ ва фарҳангӣ.',
          modes: [
            { name: 'Таносуби пойтахтҳо', desc: 'Мамлакатҳо в пойтахтҳои онҳоро дурус мутаносибсозед', difficulty: 2 },
            { name: 'Кашфи фарҳангӣ', desc: 'Шинохти хусусиятҳои торихӣ ва фарҳанги пойтахтҳо', difficulty: 3 }
          ],
          rewards: { firstWin: 120 },
          path: '/games/capitals'
        },
        timedChallenge: {
          title: 'Чолиши вақтдор',
          description: 'Дар вақти маҳдуд ба миқдори зиёди масъалаҳои ҷуғрофӣ ҷавоб диҳед, дақиқӣ va sur‘at-i javobdihīi khudro sānjed.',
          modes: [
            { name: 'Ҷавобдиҳии sare‘', desc: 'Dar 60 sāniya javobāt-i zyād ball-i zyād', difficulty: 2 },
            { name: 'Regime-i zindamoni', desc: 'Javob-i nādurust khatm meshavad, ball-i maksimalīro koyosh kun', difficulty: 3 }
          ],
          rewards: { firstWin: 150 },
          path: '/games/timed-challenge'
        },
        multiplayer: {
          title: 'Муқоисаи чандин нафара',
          description: 'Dūstoni khudro ba musobaqa-yi dānish-i jughrāfī da‘vat kun, regime-i muqoyisa dar vaqt-i haqīqī āmukhtanro shavīqtar mesāzad.',
          modes: [
            { name: 'Muqoyisa-i dūstān', desc: 'Bā dūstontān muqoyisa-yi 1v1 dar vaqt-i haqīqī', difficulty: 2 },
            { name: 'Musobaqa-yi guruhi', desc: 'Guruhsāzi va musobaqa-yi chandin nafara', difficulty: 2 }
          ],
          rewards: { firstWin: 200 },
          path: '/games/multiplayer'
        },
        randomMode: {
          title: 'Режими тасодуфӣ',
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
        flags: ['Осон', 'Пешрафта'],
        shapes: ['Пешрафта', 'Чолиш'],
        capitals: ['Осон', 'Пешрафта'],
        timedChallenge: ['Чолиш'],
        multiplayer: ['Чандин нафара'],
        randomMode: ['Чолиш', 'Чандин нафара']
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
      if (category === 'Ҳама') {
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
      this.$router.push(path)
      this.closeDetails()
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
    },
    async handleCountryClick(countryData) {
      console.log('handleCountryClick called with:', countryData) // Debug log
      
      this.selectedCountryInfo = countryData
      this.isLoadingCountryData = true
      this.countryDetails = null
      
      console.log('State updated:', {
        selectedCountryInfo: this.selectedCountryInfo,
        isLoadingCountryData: this.isLoadingCountryData
      }) // Debug log
      
      console.log('Кишвар сару клик шуд:', countryData.name)
      
      try {
        // Fetch detailed country data from REST Countries API
        const detailedData = await countryAPI.getCountryByCode(countryData.countryCode)
        this.countryDetails = detailedData
        
        // Scroll to info panel for better UX
        setTimeout(() => {
          const panel = document.querySelector('.country-info-panel')
          if (panel) {
            panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          }
        }, 100)
        
      } catch (error) {
        console.error('Хатогӣ ҳангоми дарёфти маълумоти кишвар:', error)
        this.countryDetails = {
          name: { common: countryData.name, official: countryData.name },
          flag: { emoji: '🏳️' },
          capital: [],
          population: 0,
          area: 0,
          languages: [],
          currencies: [],
          funFacts: ['Маълумот дастрас нест'],
          educationalTips: ['Лутфан боз кӯшиш кунед']
        }
      } finally {
        this.isLoadingCountryData = false
      }
    },
    handleCountryHover(countryData) {
      // Митавон инҷо маълумоти hover зиёд илова куним
      // console.log('Country hovered:', countryData.name)
    },
    onMapReady() {
      console.log('Харитаи таълимӣ амода шуд')
    },
    
    // Helper methods for formatting data
    formatNumber(num) {
      if (!num) return 'Номаълум'
      return new Intl.NumberFormat('tg-TJ').format(num)
    },
    
    formatArea(area) {
      if (!area) return 'Номаълум'
      return `${new Intl.NumberFormat('tg-TJ').format(area)} км²`
    },
    
    formatCurrencies(currencies) {
      if (!currencies || currencies.length === 0) return 'Номаълум'
      return currencies.map(curr => `${curr.name} (${curr.symbol || curr.code})`).join(', ')
    },
    
    // Action methods
    openMap(mapUrl) {
      window.open(mapUrl, '_blank', 'noopener,noreferrer')
    },
    
    async exploreBorders(borderCodes) {
      try {
        const borderCountries = await countryAPI.getMultipleCountries(borderCodes.slice(0, 5))
        const borderNames = borderCountries.map(country => country.name.common).join(', ')
        
        // Create an interactive alert with options
        const message = `Кишварҳои ҳамсоя: ${borderNames}\n\nМехоҳед дар бораи яке аз онҳо маълумот гиред?`
        if (confirm(message)) {
          // Select the first border country for exploration
          const firstBorder = borderCountries[0]
          if (firstBorder) {
            this.selectedCountryInfo = {
              countryCode: firstBorder.code,
              name: firstBorder.name.common
            }
            this.countryDetails = firstBorder
          }
        }
      } catch (error) {
        console.error('Хатогӣ ҳангоми дарёфти кишварҳои ҳамсоя:', error)
      }
    },
    
    async learnMoreAboutRegion(region) {
      try {
        const regionCountries = await countryAPI.getCountriesByRegion(region)
        const randomCountry = regionCountries[Math.floor(Math.random() * regionCountries.length)]
        
        if (randomCountry) {
          const message = `Минтақаи ${region} ${regionCountries.length} кишвар дорад. Кишвари тасодуфӣ: ${randomCountry.name.common}. Мехоҳед дар бораи он маълумот гиред?`
          if (confirm(message)) {
            this.selectedCountryInfo = {
              countryCode: randomCountry.code,
              name: randomCountry.name.common
            }
            this.countryDetails = randomCountry
          }
        }
      } catch (error) {
        console.error('Хатогӣ ҳангоми дарёфти минтақа:', error)
      }
    },
    
    addToLearningList(countryData) {
      // Simple local storage implementation
      const savedCountries = JSON.parse(localStorage.getItem('savedCountries') || '[]')
      const exists = savedCountries.find(c => c.code === countryData.code)
      
      if (!exists) {
        savedCountries.push({
          code: countryData.code,
          name: countryData.name.common,
          flag: countryData.flag.emoji,
          savedAt: new Date().toISOString()
        })
        localStorage.setItem('savedCountries', JSON.stringify(savedCountries))
        alert(`${countryData.name.common} ба рӯйхати омӯзиш илова шуд! 📚`)
      } else {
        alert(`${countryData.name.common} аллакай дар рӯйхати шумо мавҷуд аст.`)
      }
    },
    
    getCountryRank(metric) {
      // Simplified ranking simulation - in real app this would come from API
      if (!this.countryDetails || !this.countryDetails[metric]) return 'Н/А'
      
      const value = this.countryDetails[metric]
      if (metric === 'population') {
        if (value > 100000000) return 'Топ 15'
        if (value > 50000000) return 'Топ 30'
        if (value > 10000000) return 'Топ 70'
        return 'Зир аз 70'
      }
      if (metric === 'area') {
        if (value > 1000000) return 'Топ 20'
        if (value > 500000) return 'Топ 40'
        if (value > 100000) return 'Топ 100'
        return 'Зир аз 100'
      }
      return 'Н/А'
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

/* Learning Section Styles */
.learning-section {
  margin: 2rem 0;
  background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%);
  border-radius: 1rem;
  padding: 2rem;
  border: 2px solid #0EA5E9;
  box-shadow: 0 10px 25px rgba(14, 165, 233, 0.1);
}

.learning-header {
  text-align: center;
  margin-bottom: 2rem;
}

.learning-title {
  font-size: 1.8rem;
  color: #0C4A6E;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.learning-subtitle {
  color: #0369A1;
  font-size: 1rem;
  opacity: 0.9;
}

.learning-map-container {
  height: clamp(350px, 60vh, 600px);
  border-radius: 0.75rem;
  overflow: hidden;
  margin-bottom: 1.5rem;
  background: white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

/* Enhanced Country Info Panel Styles */
.country-info-panel {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 0.75rem;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(14, 165, 233, 0.2);
  transition: all 0.4s ease;
}

.country-info-panel.enhanced {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 249, 255, 0.95) 100%);
  box-shadow: 0 8px 32px rgba(14, 165, 233, 0.15);
  border: 2px solid rgba(14, 165, 233, 0.3);
  transform: translateY(0);
  animation: slideInUp 0.5s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Loading Indicator */
.loading-indicator {
  text-align: center;
  padding: 2rem;
  color: #0369A1;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #E0F2FE;
  border-top: 4px solid #0EA5E9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Country Header */
.country-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid rgba(14, 165, 233, 0.1);
}

.flag-container {
  flex-shrink: 0;
  position: relative;
}

.country-flag {
  width: 80px;
  height: auto;
  max-height: 60px;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.country-flag:hover {
  transform: scale(1.1);
}

.flag-emoji {
  font-size: 4rem;
  display: block;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.country-title-info {
  flex-grow: 1;
}

.country-name {
  font-size: 1.8rem;
  color: #0C4A6E;
  margin: 0 0 0.5rem 0;
  font-weight: 700;
  line-height: 1.2;
}

.country-official {
  font-size: 1rem;
  color: #0369A1;
  margin: 0 0 0.75rem 0;
  opacity: 0.8;
  font-style: italic;
}

.continent-badge {
  background: linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%);
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 1.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3);
}

/* Country Statistics */
.country-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 0.75rem;
  border: 1px solid rgba(14, 165, 233, 0.15);
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(14, 165, 233, 0.2);
}

.stat-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.stat-content {
  flex-grow: 1;
}

.stat-content strong {
  display: block;
  color: #0C4A6E;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-content span {
  color: #0369A1;
  font-size: 1rem;
  font-weight: 500;
}

/* Sections */
.section-title {
  color: #0C4A6E;
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.fun-facts, .educational-tips {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(240, 249, 255, 0.6);
  border-radius: 0.75rem;
  border-left: 4px solid #0EA5E9;
}

.facts-list, .tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.fact-item, .tip-item {
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(14, 165, 233, 0.1);
  color: #0369A1;
  line-height: 1.6;
  position: relative;
  padding-left: 1.5rem;
}

.fact-item::before, .tip-item::before {
  content: '•';
  color: #0EA5E9;
  font-weight: bold;
  position: absolute;
  left: 0;
  font-size: 1.2rem;
}

.fact-item:last-child, .tip-item:last-child {
  border-bottom: none;
}

/* Action Buttons */
.country-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 1.5rem;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 2rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
  min-width: 160px;
}

.map-btn {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.map-btn:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.borders-btn {
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
}

.borders-btn:hover {
  background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
}

.region-btn {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
}

.region-btn:hover {
  background: linear-gradient(135deg, #D97706 0%, #B45309 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
}

.bookmark-btn {
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
}

.bookmark-btn:hover {
  background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
}

/* Quick Learning Stats */
.quick-stats {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  padding: 1rem;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 0.75rem;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.quick-stat {
  flex: 1;
  text-align: center;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.quick-stat:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.quick-stat-number {
  display: block;
  font-size: 1.25rem;
  font-weight: 700;
  color: #059669;
  margin-bottom: 0.25rem;
}

.quick-stat-label {
  font-size: 0.8rem;
  color: #047857;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Responsive Design for Country Panel */
@media (max-width: 768px) {
  .country-info-panel.enhanced {
    padding: 1rem;
  }
  
  .country-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .country-flag {
    width: 60px;
    max-height: 45px;
  }
  
  .flag-emoji {
    font-size: 3rem;
  }
  
  .country-name {
    font-size: 1.5rem;
  }
  
  .country-stats {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .stat-item {
    padding: 0.75rem;
  }
  
  .fun-facts, .educational-tips {
    padding: 1rem;
  }
  
  .country-actions {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
    min-width: auto;
  }
  
  .quick-stats {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .quick-stat {
    padding: 0.5rem;
  }
  
  .quick-stat-number {
    font-size: 1.1rem;
  }
  
  .quick-stat-label {
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .country-name {
    font-size: 1.3rem;
  }
  
  .stat-item {
    gap: 0.5rem;
    padding: 0.5rem;
  }
  
  .stat-icon {
    font-size: 1.2rem;
  }
  
  .action-btn {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
  }
  
  .quick-stats {
    padding: 0.75rem;
  }
  
  .quick-stat {
    padding: 0.4rem;
  }
  
  .section-title {
    font-size: 1.1rem;
  }
  
  .fun-facts, .educational-tips {
    padding: 1rem;
  }
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