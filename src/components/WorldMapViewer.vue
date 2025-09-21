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
    
    <!-- Interactive Tooltip -->
    <CountryTooltip 
      v-if="mode === 'learning'"
      :visible="showTooltip"
      :country-data="hoveredCountryData"
      :position="tooltipPosition"
    />
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import * as am5 from '@amcharts/amcharts5'
import * as am5map from '@amcharts/amcharts5/map'
import am5geodata_worldLow from '@amcharts/amcharts5-geodata/worldLow'
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated'
import { countryNamesTajik, continents, getContinentByCountry, getUniqueCountryColor } from '@/utils/mapData.js'
import CountryTooltip from './CountryTooltip.vue'
import countryAPI from '@/services/countryAPI.js'

export default {
  name: 'WorldMapViewer',
  components: {
    CountryTooltip
  },
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
    
    // Tooltip state
    const showTooltip = ref(false)
    const hoveredCountryData = ref(null)
    const tooltipPosition = ref({ x: 0, y: 0 })
    
    let root = null
    let chart = null
    let polygonSeries = null
    let hoverTimeout = null
    let currentHoveredCountry = null
    let animationController = null
    let hoverAbortController = null


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
        interactive: true,
        cursorOverStyle: "pointer",
        focusable: true
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
      
      // Ensure polygons are interactive
      polygonSeries.mapPolygons.template.set("interactive", true)
      polygonSeries.mapPolygons.template.set("cursorOverStyle", "pointer")
      
      // Enhanced hover effects with smooth animations
      polygonSeries.mapPolygons.template.states.create("hover", {
        fill: props.mode === 'learning' ? am5.color("#10B981") : am5.color("#3B82F6"),
        stroke: am5.color("#FFFFFF"),
        strokeWidth: 3,
        strokeOpacity: 1,
        fillOpacity: 0.9
      })
      
      // Add selection/active state for clicked countries
      polygonSeries.mapPolygons.template.states.create("active", {
        fill: am5.color("#F59E0B"),
        stroke: am5.color("#FFFFFF"),
        strokeWidth: 4,
        strokeOpacity: 1,
        fillOpacity: 1
      })
      
      // Configure smooth animations
      polygonSeries.mapPolygons.template.set("stateAnimationDuration", 300)
      polygonSeries.mapPolygons.template.set("stateAnimationEasing", am5.ease.out(am5.ease.cubic))
      
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
      
      // Enhanced country click handler with animations
      let selectedPolygon = null
      
      // Primary click handling method
      polygonSeries.mapPolygons.template.on("click", function(ev) {
        console.log('Click event triggered on polygon') // Debug log
        console.log('Event details:', ev) // Additional debug
        
        const polygon = ev.target
        const dataItem = polygon.dataItem
        const countryCode = dataItem ? dataItem.get("id") : null
        
        console.log('Country clicked:', countryCode, 'DataItem:', dataItem) // Debug log
        
        if (countryCode) {
          handleCountrySelection(polygon, countryCode)
        } else {
          console.log('No country code found for clicked element') // Debug log
        }
      })
      
      // Alternative click handling using different event binding
      polygonSeries.mapPolygons.template.on("hit", function(ev) {
        console.log('Hit event triggered on polygon') // Debug log
        const polygon = ev.target
        const dataItem = polygon.dataItem
        const countryCode = dataItem ? dataItem.get("id") : null
        
        if (countryCode) {
          handleCountrySelection(polygon, countryCode)
        }
      })
      
      // Function to handle country selection
      const handleCountrySelection = (polygon, countryCode) => {
        console.log('handleCountrySelection called for:', countryCode) // Debug log
        
        // Remove previous selection
        if (selectedPolygon) {
          selectedPolygon.states.applyAnimate("default")
        }
        
        // Apply selection animation to clicked country
        selectedPolygon = polygon
        selectedPolygon.states.applyAnimate("active")
        
        // Add pulse animation for learning mode
        if (props.mode === 'learning') {
          const pulseAnimation = selectedPolygon.animate({
            key: "fillOpacity",
            to: 0.7,
            duration: 200,
            easing: am5.ease.inOut(am5.ease.cubic)
          })
          
          pulseAnimation.events.on("stopped", () => {
            selectedPolygon.animate({
              key: "fillOpacity",
              to: 1,
              duration: 200,
              easing: am5.ease.inOut(am5.ease.cubic)
            })
          })
        }
        
        const countryData = {
          countryCode,
          name: countryNamesTajik[countryCode] || countryCode,
          continent: getContinentByCountry(countryCode)
        }
        
        console.log('Emitting country-click event:', countryData) // Debug log
        emit('country-click', countryData)
      }
      
      // Add additional event listeners to ensure clicks are captured
      polygonSeries.events.on("datavalidated", () => {
        console.log('Polygon series data validated, countries loaded') // Debug log
        
        // Ensure all polygons are properly interactive
        let polygonCount = 0
        polygonSeries.mapPolygons.each((polygon) => {
          polygon.set("interactive", true)
          polygon.set("cursorOverStyle", "pointer")
          
          // Add direct event listener as backup
          polygon.onPrivate("maskRectangle", () => {
            console.log('Polygon mask rectangle updated')
          })
          polygonCount++
        })
        console.log(`Set up ${polygonCount} polygons as interactive`)
        
        // Add global click listener to the chart container as fallback with coordinate-based country detection
        if (chartContainer.value) {
          chartContainer.value.addEventListener('click', (event) => {
            console.log('Direct click on chart container:', event)
            console.log('Click coordinates:', { x: event.clientX, y: event.clientY })
            
            // Get the container bounds for coordinate conversion
            const containerRect = chartContainer.value.getBoundingClientRect()
            const relativeX = event.clientX - containerRect.left
            const relativeY = event.clientY - containerRect.top
            
            console.log('Relative coordinates:', { x: relativeX, y: relativeY })
            
            // Simple approach: use amCharts' built-in point-to-coordinate conversion
            try {
              // Convert pixel coordinates to geographic coordinates if possible
              const mapPoint = chart.convert({ x: relativeX, y: relativeY })
              console.log('Map point:', mapPoint)
              
              // Alternative approach: check elements at the click point in DOM
              const elementsAtPoint = document.elementsFromPoint(event.clientX, event.clientY)
              console.log('Elements at click point:', elementsAtPoint.length, 'elements')
              
              // Look for amCharts elements in the DOM hierarchy
              let foundCountryCode = null
              for (const element of elementsAtPoint) {
                // Check if element has amCharts data attributes or path data
                if (element.tagName === 'path' || element.tagName === 'g') {
                  // Try to find country code in element attributes or data
                  const dataId = element.getAttribute('data-id') || 
                               element.getAttribute('aria-label') ||
                               element.getAttribute('data-country')
                  
                  if (dataId) {
                    foundCountryCode = dataId
                    break
                  }
                }
                
                // Check parent elements for data
                let parent = element.parentElement
                let depth = 0
                while (parent && depth < 5) {
                  const parentDataId = parent.getAttribute('data-id') || 
                                     parent.getAttribute('aria-label') ||
                                     parent.getAttribute('data-country')
                  if (parentDataId) {
                    foundCountryCode = parentDataId
                    break
                  }
                  parent = parent.parentElement
                  depth++
                }
                
                if (foundCountryCode) break
              }
              
              if (foundCountryCode) {
                console.log('Found country from DOM:', foundCountryCode)
                // Find the corresponding polygon
                let foundPolygon = null
                polygonSeries.mapPolygons.each((polygon) => {
                  const countryCode = polygon.dataItem?.get("id")
                  if (countryCode === foundCountryCode) {
                    foundPolygon = polygon
                    return false // Break loop
                  }
                })
                
                if (foundPolygon) {
                  handleCountrySelection(foundPolygon, foundCountryCode)
                } else {
                  console.log('Polygon not found for country code:', foundCountryCode)
                }
              } else {
                console.log('No country found at click coordinates - trying geometric approach')
                
                // Fallback: iterate through all polygons and test if point is inside
                let foundPolygon = null
                let smallestArea = Infinity
                
                polygonSeries.mapPolygons.each((polygon) => {
                  const countryCode = polygon.dataItem?.get("id")
                  if (!countryCode) return
                  
                  // Get polygon's global bounds
                  const bounds = polygon.globalBounds()
                  if (bounds) {
                    const left = bounds.left
                    const right = bounds.right  
                    const top = bounds.top
                    const bottom = bounds.bottom
                    const area = (right - left) * (bottom - top)
                    
                    // Check if click is within bounds
                    if (relativeX >= left && relativeX <= right && 
                        relativeY >= top && relativeY <= bottom && 
                        area < smallestArea) {
                      foundPolygon = polygon
                      smallestArea = area
                    }
                  }
                })
                
                if (foundPolygon) {
                  const countryCode = foundPolygon.dataItem?.get("id")
                  console.log('Found country via bounds check:', countryCode)
                  handleCountrySelection(foundPolygon, countryCode)
                } else {
                  console.log('No country found at coordinates:', { x: relativeX, y: relativeY })
                }
              }
            } catch (error) {
              console.error('Error in coordinate-based country detection:', error)
              console.log('Error details:', error.message, error.stack)
            }
          })
        }
        
        // Add individual event listeners to each polygon for direct interaction
        setTimeout(() => {
          console.log('Setting up individual polygon click listeners...')
          polygonSeries.mapPolygons.each((polygon, index) => {
            if (index < 5) console.log(`Setting up polygon ${index}:`, polygon.dataItem?.get("id"))
            
            // Multiple event binding approaches
            polygon.on("click", (ev) => {
              console.log('Individual polygon click:', ev.target.dataItem?.get("id"))
              const countryCode = ev.target.dataItem?.get("id")
              if (countryCode) {
                handleCountrySelection(ev.target, countryCode)
              }
            })
            
            polygon.on("pointerdown", (ev) => {
              console.log('Individual polygon pointerdown:', ev.target.dataItem?.get("id"))
            })
          })
        }, 1000)
      })

      // Enhanced hover handler with tooltip
      polygonSeries.mapPolygons.template.on("pointerover", async (ev) => {
        const countryCode = ev.target.dataItem?.get("id")
        if (countryCode && props.mode === 'learning') {
          // Clear any existing timeout
          if (hoverTimeout) {
            clearTimeout(hoverTimeout)
          }
          
          currentHoveredCountry = countryCode
          
          // Set tooltip position from mouse coordinates
          const containerRect = chartContainer.value.getBoundingClientRect()
          tooltipPosition.value = {
            x: ev.originalEvent?.clientX || containerRect.left + containerRect.width / 2,
            y: ev.originalEvent?.clientY || containerRect.top + containerRect.height / 2
          }
          
          // Show basic tooltip immediately
          hoveredCountryData.value = {
            name: { common: countryNamesTajik[countryCode] || countryCode },
            flag: { emoji: getCountryFlagEmoji(countryCode) },
            capital: [],
            population: null
          }
          showTooltip.value = true
          
          // Cancel any existing hover request
          if (hoverAbortController) {
            hoverAbortController.abort()
          }
          
          // Fetch detailed data with a slight delay and abort control
          hoverTimeout = setTimeout(async () => {
            if (currentHoveredCountry === countryCode) {
              try {
                hoverAbortController = new AbortController()
                const detailedData = await countryAPI.getCountryByCode(countryCode)
                if (currentHoveredCountry === countryCode && !hoverAbortController.signal.aborted) {
                  hoveredCountryData.value = detailedData
                }
              } catch (error) {
                if (error.name !== 'AbortError') {
                  console.warn('Failed to load country details for tooltip:', error)
                }
              } finally {
                hoverAbortController = null
              }
            }
          }, 300)
          
          emit('country-hover', {
            countryCode,
            name: countryNamesTajik[countryCode] || countryCode,
            continent: getContinentByCountry(countryCode)
          })
        }
      })
      
      // Add mouse leave handler to hide tooltip
      polygonSeries.mapPolygons.template.on("pointerout", () => {
        if (props.mode === 'learning') {
          if (hoverTimeout) {
            clearTimeout(hoverTimeout)
            hoverTimeout = null
          }
          
          if (hoverAbortController) {
            hoverAbortController.abort()
            hoverAbortController = null
          }
          
          currentHoveredCountry = null
          showTooltip.value = false
          hoveredCountryData.value = null
        }
      })
      
      // Handle mouse movement for tooltip positioning
      if (props.mode === 'learning') {
        chartContainer.value.addEventListener('mousemove', (ev) => {
          if (showTooltip.value) {
            tooltipPosition.value = {
              x: ev.clientX,
              y: ev.clientY
            }
          }
        })
      }
      
      // When map loads, apply colors and hide loading
      polygonSeries.events.on("datavalidated", () => {
        updateColors()
        isLoading.value = false
        emit('map-ready')
      })
      
      // Enhanced globe rotation and zoom animations for learning mode
      if (isGlobeView.value && props.mode === 'learning') {
        // Gentle rotation animation
        chart.animate({
          key: "rotationX",
          to: 360,
          duration: 45000,
          loops: Infinity,
          easing: am5.ease.linear
        })
        
        // Add periodic zoom pulse for visual interest
        const zoomAnimation = () => {
          const zoomOut = chart.animate({
            key: "zoomLevel",
            to: 1.1,
            duration: 3000,
            easing: am5.ease.inOut(am5.ease.quad)
          })
          
          zoomOut.events.on("stopped", () => {
            const zoomIn = chart.animate({
              key: "zoomLevel",
              to: 1,
              duration: 3000,
              easing: am5.ease.inOut(am5.ease.quad)
            })
            
            zoomIn.events.on("stopped", () => {
              setTimeout(zoomAnimation, 5000) // Wait 5 seconds before next pulse
            })
          })
        }
        
        // Start zoom animation after a delay
        setTimeout(zoomAnimation, 3000)
      }
      
      // Add interactive features for flat map
      if (!isGlobeView.value && props.mode === 'learning') {
        // Enable map dragging with momentum
        chart.set("panX", "translateX")
        chart.set("panY", "translateY")
        chart.set("wheelY", "zoom")
        
        // Add subtle map breathing animation
        const breatheAnimation = () => {
          const breatheOut = polygonSeries.animate({
            key: "fillOpacity",
            to: 0.95,
            duration: 4000,
            easing: am5.ease.inOut(am5.ease.sine)
          })
          
          breatheOut.events.on("stopped", () => {
            const breatheIn = polygonSeries.animate({
              key: "fillOpacity",
              to: 1,
              duration: 4000,
              easing: am5.ease.inOut(am5.ease.sine)
            })
            
            breatheIn.events.on("stopped", () => {
              setTimeout(breatheAnimation, 8000)
            })
          })
        }
        
        setTimeout(breatheAnimation, 2000)
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
      // Clean up resources
      if (hoverTimeout) {
        clearTimeout(hoverTimeout)
      }
      if (hoverAbortController) {
        hoverAbortController.abort()
      }
      if (root) {
        root.dispose()
      }
    })

    // Helper function to get country flag emoji
    const getCountryFlagEmoji = (countryCode) => {
      try {
        const codePoints = countryCode
          .toUpperCase()
          .split('')
          .map(char => 127397 + char.charCodeAt())
        return String.fromCodePoint(...codePoints)
      } catch {
        return '🏳️'
      }
    }
    
    return {
      chartContainer,
      isGlobeView,
      isLoading,
      colorMode,
      showTooltip,
      hoveredCountryData,
      tooltipPosition,
      toggleView,
      updateColors,
      getCountryFlagEmoji
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