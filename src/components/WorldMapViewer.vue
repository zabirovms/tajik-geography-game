<template>
  <div class="world-map-viewer">
    <!-- Map Controls -->
    <div class="map-controls" v-if="showControls">
      <button @click="toggleView" class="control-btn">
        {{ isGlobeView ? '🗺️ Харитаи ҳамвор' : '🌍 Глобус' }}
      </button>
      
      <select v-model="colorMode" @change="updateColors" class="control-select">
        <option value="continents">Қитъаҳо</option>
        <option value="unique">Кишварҳои алоҳида</option>
        <option value="plain">Оддӣ</option>
      </select>
    </div>

    <!-- Map Container -->
    <div ref="chartContainer" class="chart-container" :class="{ 'learning-mode': mode === 'learning', 'game-mode': mode === 'game' }">
      <div v-if="isLoading" class="loading">{{ loadingText }}</div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import * as am5 from '@amcharts/amcharts5'
import * as am5map from '@amcharts/amcharts5/map'
import am5geodata_worldLow from '@amcharts/amcharts5-geodata/worldLow'
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated'
import { countryNamesTajik, continents, getContinentByCountry, getUniqueCountryColor } from '@/utils/mapData.js'

export default {
  name: 'WorldMapViewer',
  props: {
    mode: {
      type: String,
      default: 'learning', // 'learning' or 'game'
      validator: value => ['learning', 'game'].includes(value)
    },
    showControls: {
      type: Boolean,
      default: true
    },
    loadingText: {
      type: String,
      default: 'Харита бор мешавад...'
    },
    initialGlobeView: {
      type: Boolean,
      default: false
    },
    initialColorMode: {
      type: String,
      default: 'continents'
    }
  },
  emits: ['country-click', 'country-hover', 'map-ready'],
  setup(props, { emit }) {
    const chartContainer = ref(null)
    const isGlobeView = ref(props.initialGlobeView)
    const isLoading = ref(true)
    const colorMode = ref(props.initialColorMode)
    
    let root = null
    let chart = null
    let polygonSeries = null


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
      
      // Create root
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
      
      // Configure polygons based on mode - explicitly disable tooltips in game mode
      const polygonConfig = {
        fill: am5.color("#E5E7EB"),
        stroke: am5.color("#FFFFFF"),
        strokeWidth: 0.5,
        interactive: true
      }

      // Strictly enforce tooltip behavior per mode
      if (props.mode === 'learning') {
        polygonConfig.tooltipText = "{name}"
      } else {
        // Game mode: NO tooltips at all
        polygonConfig.tooltipText = ""
        polygonConfig.tooltip = null
      }

      polygonSeries.mapPolygons.template.setAll(polygonConfig)
      
      // Add hover effects
      polygonSeries.mapPolygons.template.states.create("hover", {
        fill: props.mode === 'learning' ? am5.color("#10B981") : am5.color("#3B82F6"),
        stroke: am5.color("#FFFFFF"),
        strokeWidth: 2
      })
      
      // Add Tajik tooltips for learning mode
      if (props.mode === 'learning') {
        polygonSeries.mapPolygons.template.adapters.add("tooltipText", (text, target) => {
          const countryCode = target.dataItem?.get("id")
          if (countryCode && countryNamesTajik[countryCode]) {
            return countryNamesTajik[countryCode]
          }
          return text
        })
      }
      
      // Add country click handler
      polygonSeries.mapPolygons.template.on("click", (ev) => {
        const countryCode = ev.target.dataItem?.get("id")
        if (countryCode) {
          emit('country-click', {
            countryCode,
            name: countryNamesTajik[countryCode] || countryCode,
            continent: getContinentByCountry(countryCode)
          })
        }
      })

      // Add hover handler
      polygonSeries.mapPolygons.template.on("pointerover", (ev) => {
        const countryCode = ev.target.dataItem?.get("id")
        if (countryCode) {
          emit('country-hover', {
            countryCode,
            name: countryNamesTajik[countryCode] || countryCode,
            continent: getContinentByCountry(countryCode)
          })
        }
      })
      
      // When map loads, apply colors and hide loading
      polygonSeries.events.on("datavalidated", () => {
        updateColors()
        isLoading.value = false
        emit('map-ready')
      })
      
      // Globe rotation for learning mode
      if (isGlobeView.value && props.mode === 'learning') {
        chart.animate({
          key: "rotationX",
          to: 360,
          duration: 30000,
          loops: Infinity
        })
      }
      
      console.log('WorldMapViewer initialized:', { 
        mode: props.mode,
        isGlobeView: isGlobeView.value, 
        colorMode: colorMode.value 
      })
    }

    const toggleView = async () => {
      isLoading.value = true
      isGlobeView.value = !isGlobeView.value
      await nextTick()
      initializeMap()
    }

    // Watch for prop changes
    watch(() => props.mode, () => {
      if (chart) {
        initializeMap()
      }
    })

    onMounted(() => {
      console.log('WorldMapViewer mounted, initializing...')
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
.world-map-viewer {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.map-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.control-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #D1D5DB;
  border-radius: 0.5rem;
  background: white;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  color: #374151;
}

.control-btn:hover {
  background: #F3F4F6;
  border-color: #9CA3AF;
}

.control-select {
  padding: 0.5rem;
  border: 1px solid #D1D5DB;
  border-radius: 0.5rem;
  background: white;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
}

.chart-container {
  flex: 1;
  width: 100%;
  position: relative;
  border-radius: 0.75rem;
  overflow: hidden;
  height: clamp(320px, 55vh, 640px);
  min-height: 320px;
}

.chart-container.learning-mode {
  background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%);
  border: 2px solid #0EA5E9;
  box-shadow: 0 10px 25px rgba(14, 165, 233, 0.1);
}

.chart-container.game-mode {
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
  border: 2px solid #F59E0B;
  box-shadow: 0 10px 25px rgba(245, 158, 11, 0.1);
}

.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.125rem;
  color: #6B7280;
  font-weight: 500;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 0.5rem;
  backdrop-filter: blur(4px);
}

/* Responsive design */
@media (max-width: 768px) {
  .map-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  
  .chart-container {
    height: clamp(280px, 45vh, 500px);
    min-height: 280px;
  }
  
  .control-btn,
  .control-select {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .chart-container {
    height: clamp(250px, 40vh, 400px);
    min-height: 250px;
  }
}
</style>