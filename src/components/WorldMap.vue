<template>
  <div class="world-map-container">
    <!-- Map Controls -->
    <div class="map-controls">
      <button 
        @click="toggleView" 
        :disabled="isLoading"
        class="view-toggle-btn"
      >
        <span v-if="isGlobeView">🗺️</span>
        <span v-else>🌍</span>
        {{ isGlobeView ? 'Харитаи ҳамвор' : 'Глобус' }}
      </button>
      
      <div class="color-mode-controls">
        <button 
          @click="setColorMode('continents')"
          :class="{ active: colorMode === 'continents' }"
          class="mode-btn"
        >
          Қитъаҳо
        </button>
        <button 
          @click="setColorMode('unique')"
          :class="{ active: colorMode === 'unique' }"
          class="mode-btn"
        >
          Кишварҳо
        </button>
        <button 
          @click="setColorMode('plain')"
          :class="{ active: colorMode === 'plain' }"
          class="mode-btn"
        >
          Оддӣ
        </button>
      </div>
    </div>

    <!-- Map Container -->
    <div 
      ref="chartContainer" 
      class="map-chart"
      :class="{ loading: isLoading }"
    >
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p>Харита боркунӣ шуда истодааст...</p>
      </div>
    </div>

    <!-- Continent Info Panel -->
    <div v-if="hoveredContinent" class="continent-info">
      <h3>{{ getContinentInfo(hoveredContinent)?.nameTajik }}</h3>
      <p>{{ getContinentInfo(hoveredContinent)?.countries.length }} кишвар</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as am5 from '@amcharts/amcharts5'
import * as am5map from '@amcharts/amcharts5/map'
import am5geodata_worldLow from '@amcharts/amcharts5-geodata/worldLow'
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated'

// Comprehensive Tajik country names mapping
const countryNamesTajik = {
  "AF": "Афғонистон",
  "AL": "Албания", 
  "DZ": "Алҷазоир",
  "AD": "Андорра",
  "AO": "Ангола",
  "AR": "Аргентина",
  "AM": "Арманистон",
  "AU": "Австралия",
  "AT": "Австрия",
  "AZ": "Озарбойҷон",
  "BS": "Багама",
  "BH": "Баҳрайн",
  "BD": "Бангладеш",
  "BB": "Барбадос",
  "BY": "Белорус",
  "BE": "Белгия",
  "BZ": "Белиз",
  "BJ": "Бенин",
  "BT": "Бутан",
  "BO": "Боливия",
  "BA": "Босния ва Ҳерсеговина",
  "BW": "Ботсвана",
  "BR": "Бразилия",
  "BN": "Бруней",
  "BG": "Болгария",
  "BF": "Буркина-Фасо",
  "BI": "Бурунди",
  "KH": "Камбоҷа",
  "CM": "Камерун",
  "CA": "Канада",
  "CV": "Кабо-Верде",
  "KY": "Кайман",
  "CF": "Ҷумҳурии Африқои Марказӣ",
  "TD": "Чад",
  "CL": "Чилӣ",
  "CN": "Чин",
  "CO": "Колумбия",
  "KM": "Комор",
  "CG": "Конго",
  "CD": "Ҷумҳурии Демократии Конго",
  "CK": "Ҷазираҳои Кук",
  "CR": "Коста-Рика",
  "HR": "Хорватия",
  "CU": "Куба",
  "CY": "Кипр",
  "CZ": "Чехия",
  "DK": "Дания",
  "DJ": "Ҷибутӣ",
  "DM": "Доминика",
  "DO": "Ҷумҳурии Доминика",
  "EC": "Эквадор",
  "EG": "Миср",
  "SV": "Салвадор",
  "GQ": "Гвинеяи Экваторӣ",
  "ER": "Эритрея",
  "EE": "Эстония",
  "SZ": "Эсватини",
  "ET": "Эфиопия",
  "FJ": "Фиҷӣ",
  "FI": "Финландия",
  "FR": "Фаронса",
  "GA": "Габон",
  "GM": "Гамбия",
  "GE": "Гурҷистон",
  "DE": "Олмон",
  "GH": "Гана",
  "GR": "Юнон",
  "GD": "Гренада",
  "GT": "Гватемала",
  "GN": "Гвинея",
  "GW": "Гвинея-Бисау",
  "GY": "Гайана",
  "HT": "Ҳаитӣ",
  "HN": "Ҳондурас",
  "HU": "Маҷористон",
  "IS": "Исландия",
  "IN": "Ҳиндустон",
  "ID": "Индонезия",
  "IR": "Эрон",
  "IQ": "Ироқ",
  "IE": "Ирландия",
  "IL": "Фаластин",
  "IT": "Италия",
  "CI": "Кот-д'Ивуар",
  "JM": "Ямайка",
  "JP": "Япония",
  "JO": "Урдун",
  "KZ": "Қазоқистон",
  "KE": "Кения",
  "KI": "Кирибати",
  "KP": "Кореяи Шимолӣ",
  "KR": "Кореяи Ҷанубӣ",
  "KW": "Кувайт",
  "KG": "Қирғизистон",
  "LA": "Лаос",
  "LV": "Латвия",
  "LB": "Лубнон",
  "LS": "Лесото",
  "LR": "Либерия",
  "LY": "Либия",
  "LI": "Лихтенштейн",
  "LT": "Литва",
  "LU": "Люксембург",
  "MO": "Макао",
  "MK": "Македонияи Шимолӣ",
  "MG": "Мадагаскар",
  "MW": "Малавӣ",
  "MY": "Малайзия",
  "ML": "Мали",
  "MT": "Малта",
  "MH": "Ҷазираҳои Маршалл",
  "MQ": "Мартиника",
  "MR": "Мавритания",
  "MU": "Маврикий",
  "YT": "Майот",
  "MX": "Мексика",
  "FM": "Микронезия",
  "MD": "Молдова",
  "MC": "Монако",
  "MN": "Муғулистон",
  "ME": "Монтенегро",
  "MS": "Монтсеррат",
  "MA": "Марокаш",
  "MZ": "Мозамбик",
  "MM": "Мянмар",
  "NA": "Намибия",
  "NR": "Нору",
  "NP": "Непал",
  "NL": "Нидерланд",
  "NZ": "Зеландияи Нав",
  "NI": "Никарагуа",
  "NE": "Нигер",
  "NG": "Нигерия",
  "NO": "Норвегия",
  "OM": "Уммон",
  "PK": "Покистон",
  "PW": "Палау",
  "PA": "Панама",
  "PG": "Папуа-Гвинеяи Нав",
  "PY": "Парагвай",
  "PE": "Перу",
  "PH": "Филиппин",
  "PL": "Полша",
  "PT": "Португалия",
  "QA": "Қатар",
  "RO": "Руминия",
  "RU": "Русия",
  "RW": "Руанда",
  "KN": "Сент-Китс ва Невис",
  "LC": "Сент-Люсия",
  "VC": "Сент-Винсент ва Гренадин",
  "WS": "Самоа",
  "SM": "Сан-Марино",
  "ST": "Сао Томе ва Принсипе",
  "SA": "Арабистони Саудӣ",
  "SN": "Сенегал",
  "RS": "Сербия",
  "SC": "Сейшелҳо",
  "SL": "Серра-Леоне",
  "SG": "Сингапур",
  "SK": "Словакия",
  "SI": "Словения",
  "SO": "Сомалӣ",
  "ZA": "Африқои Ҷанубӣ",
  "SS": "Судани Ҷанубӣ",
  "ES": "Испания",
  "LK": "Шри-Ланка",
  "SD": "Судан",
  "SR": "Суринам",
  "SJ": "Свалбард ва Ян Майен",
  "SE": "Шветсия",
  "SY": "Сурия",
  "TW": "Тайван",
  "TJ": "Тоҷикистон",
  "TZ": "Танзания",
  "TH": "Таиланд",
  "TL": "Тимор-Лесте",
  "TG": "Того",
  "TK": "Токелау",
  "TO": "Тонга",
  "TT": "Тринтидад ва Тобаго",
  "TN": "Тунис",
  "TR": "Туркия",
  "TM": "Туркманистон",
  "TC": "Ҷазираҳои Турк ва Кайкос",
  "TV": "Тувалу",
  "UG": "Уганда",
  "UA": "Украина",
  "AE": "Имороти Муттаҳидаи Араб",
  "GB": "Британияи Кабир",
  "US": "Иёлоти Муттаҳидаи Амрико",
  "UY": "Уругвай",
  "UZ": "Узбекистон",
  "VU": "Вануату",
  "VA": "Ватикан",
  "VE": "Венесуэла",
  "VN": "Ветнам",
  "WF": "Уолис ва Футуна",
  "EH": "Сахараи Ғарбӣ",
  "YE": "Йемен",
  "ZM": "Замбия",
  "ZW": "Зимбабве",
  "AQ": "Антарктика",
  "GL": "Гринландия"
}

// Continent definitions with Tajik names
const continents = [
  {
    id: "africa",
    name: "Africa", 
    nameTajik: "Африқо",
    color: "#10B981",
    countries: ["DZ", "AO", "BJ", "BW", "BF", "BI", "CM", "CV", "CF", "TD", "KM", "CG", "CD", "CI", "DJ", "EG", "GQ", "ER", "ET", "GA", "GM", "GH", "GN", "GW", "KE", "LS", "LR", "LY", "MG", "MW", "ML", "MR", "MU", "MA", "MZ", "NA", "NE", "NG", "RW", "ST", "SN", "SC", "SL", "SO", "ZA", "SS", "SD", "SZ", "TZ", "TG", "TN", "UG", "ZM", "ZW"]
  },
  {
    id: "asia",
    name: "Asia",
    nameTajik: "Осиё", 
    color: "#F59E0B",
    countries: ["AF", "AM", "AZ", "BH", "BD", "BT", "BN", "KH", "CN", "CY", "GE", "IN", "ID", "IR", "IQ", "IL", "JP", "JO", "KZ", "KW", "KG", "LA", "LB", "MY", "MV", "MN", "MM", "NP", "KP", "OM", "PK", "PS", "PH", "QA", "SA", "SG", "KR", "LK", "SY", "TW", "TJ", "TH", "TL", "TR", "TM", "AE", "UZ", "VN", "YE"]
  },
  {
    id: "europe", 
    name: "Europe",
    nameTajik: "Аврупо",
    color: "#8B5CF6",
    countries: ["AL", "AD", "AT", "BY", "BE", "BA", "BG", "HR", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IS", "IE", "IT", "XK", "LV", "LI", "LT", "LU", "MK", "MT", "MD", "MC", "ME", "NL", "NO", "PL", "PT", "RO", "RU", "SM", "RS", "SK", "SI", "ES", "SE", "CH", "UA", "GB", "VA"]
  },
  {
    id: "north-america",
    name: "North America",
    nameTajik: "Амрикои Шимолӣ",
    color: "#EF4444", 
    countries: ["AG", "BS", "BB", "BZ", "CA", "CR", "CU", "DM", "DO", "SV", "GD", "GT", "HT", "HN", "JM", "MX", "NI", "PA", "KN", "LC", "VC", "TT", "US"]
  },
  {
    id: "south-america",
    name: "South America", 
    nameTajik: "Амрикои Ҷанубӣ",
    color: "#06B6D4",
    countries: ["AR", "BO", "BR", "CL", "CO", "EC", "FK", "GF", "GY", "PY", "PE", "SR", "UY", "VE"]
  },
  {
    id: "australia",
    name: "Australia & Oceania",
    nameTajik: "Австралия ва Уқёнусия", 
    color: "#F97316",
    countries: ["AU", "FJ", "KI", "MH", "FM", "NR", "NZ", "PW", "PG", "WS", "SB", "TO", "TV", "VU"]
  },
  {
    id: "antarctica",
    name: "Antarctica",
    nameTajik: "Антарктида",
    color: "#64748B",
    countries: ["AQ"]
  }
]

export default {
  name: 'WorldMap',
  props: {
    selectedContinent: String,
    hoveredContinent: String,
    selectedCountry: String,
    countryFeedback: Object,
    isFindCountryMode: {
      type: Boolean,
      default: false
    },
    colorMode: {
      type: String,
      default: 'continents'
    }
  },
  emits: ['continent-click', 'continent-hover', 'country-click'],
  setup(props, { emit }) {
    const chartContainer = ref(null)
    const isGlobeView = ref(false)
    const isLoading = ref(false)
    const colorMode = ref(props.colorMode)
    
    // Chart references
    let root = null
    let chart = null
    let polygonSeries = null
    let loadingTimeout = null
    let previousPolygon = null

    // Helper functions
    const getContinentByCountry = (countryCode) => {
      return continents.find(continent => 
        continent.countries.includes(countryCode)
      )
    }

    const getContinentInfo = (continentId) => {
      return continents.find(c => c.id === continentId)
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
      if (0 <= hue && hue < 60) {
        r = c; g = x; b = 0
      } else if (60 <= hue && hue < 120) {
        r = x; g = c; b = 0
      } else if (120 <= hue && hue < 180) {
        r = 0; g = c; b = x
      } else if (180 <= hue && hue < 240) {
        r = 0; g = x; b = c
      } else if (240 <= hue && hue < 300) {
        r = x; g = 0; b = c
      } else if (300 <= hue && hue < 360) {
        r = c; g = 0; b = x
      }
      
      const toHex = (n) => Math.round((n + m) * 255).toString(16).padStart(2, '0')
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`
    }

    const selectCountry = (countryId) => {
      if (!polygonSeries || !chart) return
      
      setTimeout(() => {
        const dataItem = polygonSeries.getDataItemById(countryId)
        const target = dataItem?.get("mapPolygon")
        
        if (target && isGlobeView.value) {
          const centroid = target.geoCentroid()
          if (centroid) {
            chart.animate({ 
              key: "rotationX", 
              to: -centroid.longitude, 
              duration: 1500, 
              easing: am5.ease.inOut(am5.ease.cubic) 
            })
            chart.animate({ 
              key: "rotationY", 
              to: -centroid.latitude, 
              duration: 1500, 
              easing: am5.ease.inOut(am5.ease.cubic) 
            })
          }
        } else if (target && !isGlobeView.value) {
          polygonSeries.zoomToDataItem(dataItem)
        }
      }, 100)
    }

    const toggleView = async () => {
      if (isLoading.value) return
      
      isLoading.value = true
      isGlobeView.value = !isGlobeView.value
      
      if (loadingTimeout) {
        clearTimeout(loadingTimeout)
      }
      
      loadingTimeout = setTimeout(() => {
        isLoading.value = false
      }, 2000)
      
      await nextTick()
      initializeMap()
    }

    const setColorMode = (mode) => {
      colorMode.value = mode
      updateMapColors()
    }

    const updateMapColors = () => {
      if (!polygonSeries) return
      
      polygonSeries.mapPolygons.each((polygon) => {
        const countryCode = polygon.dataItem?.get("id")
        if (!countryCode) return
        
        let color = "#E5E7EB" // Default gray
        
        if (colorMode.value === "continents") {
          const continent = getContinentByCountry(countryCode)
          if (continent) {
            color = continent.color
          }
        } else if (colorMode.value === "unique") {
          color = getUniqueCountryColor(countryCode)
        }
        
        polygon.set("fill", am5.color(color))
      })
    }

    const initializeMap = () => {
      if (!chartContainer.value) return
      
      // Dispose existing chart
      if (root) {
        root.dispose()
      }
      
      // Create root
      root = am5.Root.new(chartContainer.value)
      root.setThemes([am5themes_Animated.new(root)])
      
      // Create chart
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
      
      // Configure polygons
      polygonSeries.mapPolygons.template.setAll({
        tooltipText: "{name}",
        fill: am5.color("#E5E7EB"),
        stroke: am5.color("#FFFFFF"),
        strokeWidth: 0.5,
        interactive: true
      })
      
      // Add polygon interactions
      polygonSeries.mapPolygons.template.on("pointerover", (ev) => {
        const countryCode = ev.target.dataItem?.get("id")
        if (countryCode) {
          const continent = getContinentByCountry(countryCode)
          if (continent) {
            emit('continent-hover', continent.id)
          }
        }
      })
      
      polygonSeries.mapPolygons.template.on("pointerout", () => {
        emit('continent-hover', undefined)
      })
      
      polygonSeries.mapPolygons.template.on("click", (ev) => {
        const countryCode = ev.target.dataItem?.get("id")
        if (countryCode) {
          emit('country-click', countryCode)
          if (props.isFindCountryMode) {
            selectCountry(countryCode)
          }
        }
      })
      
      // Set country names in Tajik
      polygonSeries.mapPolygons.template.adapters.add("tooltipText", (text, target) => {
        const countryCode = target.dataItem?.get("id")
        if (countryCode && countryNamesTajik[countryCode]) {
          return countryNamesTajik[countryCode]
        }
        return text
      })
      
      // Apply initial colors
      polygonSeries.onPrivate("geoJSON", () => {
        updateMapColors()
        isLoading.value = false
        if (loadingTimeout) {
          clearTimeout(loadingTimeout)
        }
      })
      
      // Globe rotation for aesthetic effect
      if (isGlobeView.value) {
        chart.animate({
          key: "rotationX",
          to: 360,
          duration: 20000,
          loops: Infinity
        })
      }
    }

    // Watchers
    watch(() => props.colorMode, (newMode) => {
      colorMode.value = newMode
      updateMapColors()
    })

    watch(() => props.selectedCountry, (newCountry) => {
      if (newCountry) {
        selectCountry(newCountry)
      }
    })

    // Lifecycle
    onMounted(() => {
      initializeMap()
    })

    onUnmounted(() => {
      if (root) {
        root.dispose()
      }
      if (loadingTimeout) {
        clearTimeout(loadingTimeout)
      }
    })

    return {
      chartContainer,
      isGlobeView,
      isLoading,
      colorMode,
      toggleView,
      setColorMode,
      getContinentInfo,
      countryNamesTajik
    }
  }
}
</script>

<style scoped>
.world-map-container {
  position: relative;
  width: 100%;
  height: 500px;
  background: #f8fafc;
  border-radius: 12px;
  overflow: hidden;
}

.map-controls {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
  display: flex;
  gap: 10px;
  align-items: center;
}

.view-toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-toggle-btn:hover:not(:disabled) {
  background: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.view-toggle-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.color-mode-controls {
  display: flex;
  gap: 4px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 4px;
}

.mode-btn {
  padding: 6px 12px;
  border: none;
  background: transparent;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #64748b;
}

.mode-btn:hover {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.mode-btn.active {
  background: #3b82f6;
  color: white;
}

.map-chart {
  width: 100%;
  height: 100%;
  position: relative;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(248, 250, 252, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 5;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.continent-info {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  z-index: 10;
}

.continent-info h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.continent-info p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}
</style>