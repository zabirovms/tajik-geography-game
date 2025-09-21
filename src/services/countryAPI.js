// REST Countries API service for fetching real-time country data
// API Documentation: https://restcountries.com/

const BASE_URL = 'https://restcountries.com/v3.1'

// Cache for API responses to improve performance
const cache = new Map()
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

class CountryAPIService {
  /**
   * Fetch detailed information about a specific country
   * @param {string} countryCode - 2-letter country code (ISO 3166-1 alpha-2)
   * @returns {Promise<Object>} Country data
   */
  async getCountryByCode(countryCode) {
    const cacheKey = `country_${countryCode}`
    
    // Check cache first
    if (this.isCacheValid(cacheKey)) {
      return cache.get(cacheKey).data
    }

    try {
      const response = await fetch(`${BASE_URL}/alpha/${countryCode}?fields=name,flags,capital,population,area,region,subregion,languages,currencies,timezones,borders,latlng,maps,coatOfArms,car,continents`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch country data: ${response.status}`)
      }

      const countryData = await response.json()
      const country = Array.isArray(countryData) ? countryData[0] : countryData

      // Process and enrich the data
      const processedData = this.processCountryData(country)
      
      // Cache the result
      cache.set(cacheKey, {
        data: processedData,
        timestamp: Date.now()
      })

      return processedData
    } catch (error) {
      console.error('Error fetching country data:', error)
      return this.getFallbackData(countryCode)
    }
  }

  /**
   * Fetch multiple countries data for neighboring countries
   * @param {string[]} countryCodes - Array of 2-letter country codes
   * @returns {Promise<Object[]>} Array of country data
   */
  async getMultipleCountries(countryCodes) {
    const promises = countryCodes.map(code => this.getCountryByCode(code))
    const results = await Promise.allSettled(promises)
    
    return results
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value)
  }

  /**
   * Search countries by name for educational exploration
   * @param {string} searchTerm - Country name to search
   * @returns {Promise<Object[]>} Array of matching countries
   */
  async searchCountries(searchTerm) {
    const cacheKey = `search_${searchTerm.toLowerCase()}`
    
    if (this.isCacheValid(cacheKey)) {
      return cache.get(cacheKey).data
    }

    try {
      const response = await fetch(`${BASE_URL}/name/${encodeURIComponent(searchTerm)}?fields=name,flags,capital,population,region,cca2`)
      
      if (!response.ok) {
        return []
      }

      const countries = await response.json()
      const processedData = countries.map(country => this.processCountryData(country))
      
      cache.set(cacheKey, {
        data: processedData,
        timestamp: Date.now()
      })

      return processedData
    } catch (error) {
      console.error('Error searching countries:', error)
      return []
    }
  }

  /**
   * Get countries by region for educational grouping
   * @param {string} region - Region name (e.g., 'Asia', 'Europe')
   * @returns {Promise<Object[]>} Array of countries in the region
   */
  async getCountriesByRegion(region) {
    const cacheKey = `region_${region.toLowerCase()}`
    
    if (this.isCacheValid(cacheKey)) {
      return cache.get(cacheKey).data
    }

    try {
      const response = await fetch(`${BASE_URL}/region/${encodeURIComponent(region)}?fields=name,flags,capital,population,cca2`)
      
      if (!response.ok) {
        return []
      }

      const countries = await response.json()
      const processedData = countries.map(country => this.processCountryData(country))
      
      cache.set(cacheKey, {
        data: processedData,
        timestamp: Date.now()
      })

      return processedData
    } catch (error) {
      console.error('Error fetching countries by region:', error)
      return []
    }
  }

  /**
   * Process raw API data into a standardized format
   * @param {Object} rawData - Raw country data from API
   * @returns {Object} Processed country data
   */
  processCountryData(rawData) {
    const data = {
      // Basic info
      code: rawData.cca2,
      name: {
        common: rawData.name?.common || 'Unknown',
        official: rawData.name?.official || 'Unknown',
        native: this.getNativeNames(rawData.name?.nativeName)
      },
      
      // Visual elements
      flag: {
        svg: rawData.flags?.svg,
        png: rawData.flags?.png,
        emoji: this.getCountryEmoji(rawData.cca2),
        alt: rawData.flags?.alt || `Flag of ${rawData.name?.common}`
      },
      
      // Geographic info
      capital: this.getCapital(rawData.capital),
      region: rawData.region || 'Unknown',
      subregion: rawData.subregion || '',
      continents: rawData.continents || [],
      
      // Demographic and size data
      population: rawData.population || 0,
      area: rawData.area || 0,
      
      // Cultural info
      languages: this.getLanguages(rawData.languages),
      currencies: this.getCurrencies(rawData.currencies),
      
      // Additional data
      timezones: rawData.timezones || [],
      borders: rawData.borders || [],
      coordinates: rawData.latlng || [],
      
      // External links
      maps: {
        googleMaps: rawData.maps?.googleMaps,
        openStreetMaps: rawData.maps?.openStreetMaps
      },
      
      // Fun facts
      drivingSide: rawData.car?.side || 'Unknown',
      coatOfArms: rawData.coatOfArms?.svg || rawData.coatOfArms?.png,
      
      // Generated educational content
      funFacts: this.generateFunFacts(rawData),
      educationalTips: this.generateEducationalTips(rawData)
    }

    return data
  }

  /**
   * Generate fun facts about the country
   * @param {Object} country - Country data
   * @returns {string[]} Array of fun facts
   */
  generateFunFacts(country) {
    const facts = []
    
    if (country.population) {
      const populationMillions = (country.population / 1000000).toFixed(1)
      facts.push(`Аҳолии ин кишвар тақрибан ${populationMillions} миллион нафар аст`)
    }
    
    if (country.area) {
      const areaThousands = (country.area / 1000).toFixed(0)
      facts.push(`Масоҳати ин кишвар ${areaThousands} ҳазор км² аст`)
    }
    
    if (country.timezones && country.timezones.length > 1) {
      facts.push(`Ин кишвар дар ${country.timezones.length} минтақаи вақт ҷойгир аст`)
    }
    
    if (country.borders && country.borders.length > 0) {
      facts.push(`Ин кишвар бо ${country.borders.length} кишвари дигар марз дорад`)
    }

    return facts
  }

  /**
   * Generate educational tips about the country
   * @param {Object} country - Country data
   * @returns {string[]} Array of educational tips
   */
  generateEducationalTips(country) {
    const tips = []
    
    if (country.capital && country.capital.length > 0) {
      tips.push(`Пойтахти ин кишвар ${country.capital[0]} аст`)
    }
    
    if (country.region) {
      tips.push(`Ин кишвар дар қитъаи ${country.region} воқеъ аст`)
    }
    
    const languages = this.getLanguages(country.languages)
    if (languages.length > 0) {
      tips.push(`Забони(ҳои) расмии ин кишвар: ${languages.join(', ')}`)
    }

    return tips
  }

  /**
   * Helper methods for data processing
   */
  getNativeNames(nativeNames) {
    if (!nativeNames) return []
    return Object.values(nativeNames).map(name => name.common).filter(Boolean)
  }

  getCapital(capital) {
    if (!capital) return []
    return Array.isArray(capital) ? capital : [capital]
  }

  getLanguages(languages) {
    if (!languages) return []
    return Object.values(languages)
  }

  getCurrencies(currencies) {
    if (!currencies) return []
    return Object.entries(currencies).map(([code, currency]) => ({
      code,
      name: currency.name,
      symbol: currency.symbol
    }))
  }

  getCountryEmoji(countryCode) {
    // Convert country code to flag emoji
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt())
    return String.fromCodePoint(...codePoints)
  }

  /**
   * Cache management methods
   */
  isCacheValid(key) {
    const cached = cache.get(key)
    if (!cached) return false
    return (Date.now() - cached.timestamp) < CACHE_DURATION
  }

  clearCache() {
    cache.clear()
  }

  /**
   * Fallback data when API fails
   */
  getFallbackData(countryCode) {
    return {
      code: countryCode,
      name: { common: 'Unknown Country', official: 'Unknown', native: [] },
      flag: { emoji: '🏳️', alt: 'Unknown flag' },
      capital: [],
      region: 'Unknown',
      population: 0,
      area: 0,
      languages: [],
      currencies: [],
      funFacts: ['Маълумот дастрас нест'],
      educationalTips: ['Интернет ва API-ро санҷед']
    }
  }
}

// Export singleton instance
export default new CountryAPIService()