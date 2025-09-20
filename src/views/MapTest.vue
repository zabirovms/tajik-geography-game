<template>
  <div class="map-test-page">
    <h1>amCharts5 Map Test</h1>
    
    <!-- Map Controls -->
    <div class="controls">
      <button @click="toggleView" class="control-btn">
        {{ isGlobeView ? '🗺️ Flat View' : '🌍 Globe View' }}
      </button>
      
      <select v-model="colorMode" @change="updateColors" class="control-select">
        <option value="continents">Continents</option>
        <option value="unique">Unique Colors</option>
        <option value="plain">Plain</option>
      </select>
    </div>

    <!-- Map Container -->
    <div ref="chartContainer" class="chart-container">
      <div v-if="isLoading" class="loading">Loading map...</div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as am5 from '@amcharts/amcharts5'
import * as am5map from '@amcharts/amcharts5/map'
import am5geodata_worldLow from '@amcharts/amcharts5-geodata/worldLow'
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated'

// Your exact Tajik country names
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

// Continents from your code
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
  name: 'MapTest',
  setup() {
    const chartContainer = ref(null)
    const isGlobeView = ref(false)
    const isLoading = ref(true)
    const colorMode = ref('continents')
    
    let root = null
    let chart = null
    let polygonSeries = null

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
      
      // Add country click handler
      polygonSeries.mapPolygons.template.on("click", (ev) => {
        const countryCode = ev.target.dataItem?.get("id")
        if (countryCode) {
          console.log(`Clicked: ${countryCode} - ${countryNamesTajik[countryCode] || 'Unknown'}`)
        }
      })
      
      // When map loads, apply colors and hide loading
      polygonSeries.onPrivate("geoJSON", () => {
        updateColors()
        isLoading.value = false
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
      
      console.log('Map initialized:', { isGlobeView: isGlobeView.value, colorMode: colorMode.value })
    }

    const toggleView = async () => {
      isLoading.value = true
      isGlobeView.value = !isGlobeView.value
      await nextTick()
      initializeMap()
    }

    onMounted(() => {
      console.log('MapTest mounted, initializing...')
      initializeMap()
    })

    onUnmounted(() => {
      if (root) root.dispose()
    })

    return {
      chartContainer,
      isGlobeView,
      isLoading,
      colorMode,
      toggleView,
      updateColors
    }
  }
}
</script>

<style scoped>
.map-test-page {
  padding: 20px;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.controls {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  align-items: center;
}

.control-btn {
  padding: 8px 16px;
  border: 1px solid #ccc;
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
  border: 1px solid #ccc;
  border-radius: 6px;
  background: white;
}

.chart-container {
  flex: 1;
  width: 100%;
  position: relative;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 18px;
  color: #666;
}
</style>