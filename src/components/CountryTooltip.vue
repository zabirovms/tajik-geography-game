<template>
  <div 
    v-if="visible && countryData" 
    class="country-tooltip"
    :style="tooltipStyle"
  >
    <div class="tooltip-content">
      <div class="tooltip-flag">
        <img 
          v-if="countryData.flag?.png" 
          :src="countryData.flag.png" 
          :alt="countryData.flag.alt"
          class="flag-image"
          loading="lazy"
        />
        <span v-else class="flag-emoji">{{ countryData.flag?.emoji || '🏳️' }}</span>
      </div>
      <div class="tooltip-info">
        <div class="country-name">{{ countryData.name?.common || 'Unknown' }}</div>
        <div v-if="countryData.capital && countryData.capital.length > 0" class="capital-info">
          🏛️ {{ countryData.capital[0] }}
        </div>
        <div v-if="countryData.population" class="population-info">
          👥 {{ formatPopulation(countryData.population) }}
        </div>
      </div>
    </div>
    <div class="tooltip-arrow"></div>
  </div>
</template>

<script>
export default {
  name: 'CountryTooltip',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    countryData: {
      type: Object,
      default: null
    },
    position: {
      type: Object,
      default: () => ({ x: 0, y: 0 })
    }
  },
  computed: {
    tooltipStyle() {
      // Calculate viewport dimensions
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const tooltipWidth = 250 // Estimated tooltip width
      const tooltipHeight = 120 // Estimated tooltip height
      
      // Calculate clamped position
      let x = this.position.x
      let y = this.position.y
      let transform = 'translate(-50%, -120%)'
      
      // Clamp horizontally
      if (x - tooltipWidth / 2 < 10) {
        x = tooltipWidth / 2 + 10
        transform = 'translate(-50%, -120%)'
      } else if (x + tooltipWidth / 2 > viewportWidth - 10) {
        x = viewportWidth - tooltipWidth / 2 - 10
        transform = 'translate(-50%, -120%)'
      }
      
      // Clamp vertically
      if (y - tooltipHeight - 20 < 10) {
        y = this.position.y + 20
        transform = 'translate(-50%, 20px)'
      }
      
      return {
        left: `${x}px`,
        top: `${y}px`,
        transform: transform
      }
    }
  },
  methods: {
    formatPopulation(population) {
      if (population >= 1000000) {
        return `${(population / 1000000).toFixed(1)}M`
      } else if (population >= 1000) {
        return `${(population / 1000).toFixed(0)}K`
      }
      return population.toString()
    }
  }
}
</script>

<style scoped>
.country-tooltip {
  position: fixed;
  z-index: 10000;
  pointer-events: none;
  animation: tooltipFadeIn 0.2s ease-out;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -120%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -120%) scale(1);
  }
}

.tooltip-content {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(240, 249, 255, 0.98) 100%);
  border: 2px solid rgba(14, 165, 233, 0.3);
  border-radius: 1rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 200px;
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.2),
    0 4px 15px rgba(14, 165, 233, 0.1);
  backdrop-filter: blur(10px);
}

.tooltip-flag {
  flex-shrink: 0;
}

.flag-image {
  width: 40px;
  height: auto;
  max-height: 30px;
  border-radius: 0.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.flag-emoji {
  font-size: 2.5rem;
  display: block;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.tooltip-info {
  flex-grow: 1;
}

.country-name {
  font-size: 1rem;
  font-weight: 700;
  color: #0C4A6E;
  margin-bottom: 0.25rem;
  line-height: 1.2;
}

.capital-info, .population-info {
  font-size: 0.8rem;
  color: #0369A1;
  margin-bottom: 0.15rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.tooltip-arrow {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid rgba(255, 255, 255, 0.98);
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.1));
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .tooltip-content {
    padding: 0.75rem;
    min-width: 180px;
  }
  
  .flag-image {
    width: 35px;
    max-height: 25px;
  }
  
  .flag-emoji {
    font-size: 2rem;
  }
  
  .country-name {
    font-size: 0.9rem;
  }
  
  .capital-info, .population-info {
    font-size: 0.75rem;
  }
}
</style>