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
      const apiUrl = `${BASE_URL}/alpha/${countryCode}?fields=name,flags,capital,population,area,region,subregion,languages,currencies,timezones,borders,latlng,maps,coatOfArms,car,continents`
      console.log(`Making API call to: ${apiUrl}`)
      
      const response = await fetch(apiUrl)
      console.log(`API response status:`, response.status, response.statusText)
      
      if (!response.ok) {
        console.error(`API call failed with status ${response.status}:`, response.statusText)
        throw new Error(`Failed to fetch country data: ${response.status} - ${response.statusText}`)
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
   * Enhanced fallback data with basic country information
   */
  getFallbackData(countryCode) {
    // Basic country database for immediate display
    const countryDatabase = {
      'US': {
        name: { common: 'Иёлоти Муттаҳидаи Амрико', official: 'Иёлоти Муттаҳидаи Амрико' },
        capital: ['Вашингтон'],
        region: 'Амрикои Шимолӣ',
        population: 331000000,
        area: 9833517,
        languages: ['Англисӣ'],
        currencies: [{ name: 'Доллари амрикоӣ', symbol: '$', code: 'USD' }],
      },
      'CN': {
        name: { common: 'Чин', official: 'Ҷумҳурии Халқии Чин' },
        capital: ['Пекин'],
        region: 'Осиё',
        population: 1440000000,
        area: 9596961,
        languages: ['Чинӣ'],
        currencies: [{ name: 'Юани чинӣ', symbol: '¥', code: 'CNY' }],
      },
      'RU': {
        name: { common: 'Русия', official: 'Федератсияи Русия' },
        capital: ['Маскав'],
        region: 'Аврупо/Осиё',
        population: 146000000,
        area: 17098242,
        languages: ['Русӣ'],
        currencies: [{ name: 'Рубли русӣ', symbol: '₽', code: 'RUB' }],
      },
      'IN': {
        name: { common: 'Ҳинд', official: 'Ҷумҳурии Ҳинд' },
        capital: ['Нав Делӣ'],
        region: 'Осиё',
        population: 1380000000,
        area: 3287263,
        languages: ['Ҳиндӣ', 'Англисӣ'],
        currencies: [{ name: 'Рупияи ҳиндӣ', symbol: '₹', code: 'INR' }],
      },
      'BR': {
        name: { common: 'Бразилия', official: 'Ҷумҳурии Федеративии Бразилия' },
        capital: ['Бразилия'],
        region: 'Амрикои Ҷанубӣ',
        population: 213000000,
        area: 8514877,
        languages: ['Португалӣ'],
        currencies: [{ name: 'Реали бразилӣ', symbol: 'R$', code: 'BRL' }],
      },
      'AU': {
        name: { common: 'Австралия', official: 'Иттиҳодия Австралия' },
        capital: ['Канберра'],
        region: 'Уқёнусия',
        population: 25500000,
        area: 7692024,
        languages: ['Англисӣ'],
        currencies: [{ name: 'Доллари австралӣ', symbol: 'A$', code: 'AUD' }],
      },
      'DE': {
        name: { common: 'Олмония', official: 'Ҷумҳурии Федеративии Олмония' },
        capital: ['Берлин'],
        region: 'Аврупо',
        population: 83000000,
        area: 357114,
        languages: ['Олмонӣ'],
        currencies: [{ name: 'Евро', symbol: '€', code: 'EUR' }],
      },
      'FR': {
        name: { common: 'Фаронса', official: 'Ҷумҳурии Фаронса' },
        capital: ['Париж'],
        region: 'Аврупо',
        population: 67000000,
        area: 643801,
        languages: ['Фаронсавӣ'],
        currencies: [{ name: 'Евро', symbol: '€', code: 'EUR' }],
      },
      'GB': {
        name: { common: 'Шоҳигарии Муттаҳида', official: 'Шоҳигарии Муттаҳидаи Бритониёи Кабир ва Ирландияи Шимолӣ' },
        capital: ['Лондон'],
        region: 'Аврупо',
        population: 67000000,
        area: 242495,
        languages: ['Англисӣ'],
        currencies: [{ name: 'Фунти стерлинг', symbol: '£', code: 'GBP' }],
      },
      'JP': {
        name: { common: 'Япония', official: 'Япония' },
        capital: ['Токё'],
        region: 'Осиё',
        population: 125800000,
        area: 377930,
        languages: ['Японӣ'],
        currencies: [{ name: 'Йенаи японӣ', symbol: '¥', code: 'JPY' }],
      },
      'CA': {
        name: { common: 'Канада', official: 'Канада' },
        capital: ['Оттава'],
        region: 'Амрикои Шимолӣ',
        population: 38000000,
        area: 9984670,
        languages: ['Англисӣ', 'Фаронсавӣ'],
        currencies: [{ name: 'Доллари канадӣ', symbol: 'C$', code: 'CAD' }],
      },
      'IT': {
        name: { common: 'Италия', official: 'Ҷумҳурии Италия' },
        capital: ['Рим'],
        region: 'Аврупо',
        population: 60400000,
        area: 301340,
        languages: ['Италиявӣ'],
        currencies: [{ name: 'Евро', symbol: '€', code: 'EUR' }],
      },
      'TJ': {
        name: { common: 'Тоҷикистон', official: 'Ҷумҳурии Тоҷикистон' },
        capital: ['Душанбе'],
        region: 'Осиё',
        population: 9500000,
        area: 143100,
        languages: ['Тоҷикӣ'],
        currencies: [{ name: 'Сомонӣ', symbol: 'ТҶС', code: 'TJS' }],
      }
    }

    const basicData = countryDatabase[countryCode]
    if (basicData) {
      return {
        code: countryCode,
        name: basicData.name,
        flag: { 
          emoji: this.getCountryEmoji(countryCode), 
          alt: `Байрақи ${basicData.name.common}`,
          png: `https://flagcdn.com/w320/${countryCode.toLowerCase()}.png`
        },
        capital: basicData.capital,
        region: basicData.region,
        population: basicData.population,
        area: basicData.area,
        languages: basicData.languages,
        currencies: basicData.currencies,
        maps: {
          googleMaps: `https://www.google.com/maps/search/${encodeURIComponent(basicData.name.common)}`,
          openStreetMaps: `https://www.openstreetmap.org/search?query=${encodeURIComponent(basicData.name.common)}`
        },
        funFacts: this.generateFunFactsFromData(basicData),
        educationalTips: this.generateEducationalTipsFromData(basicData),
        borders: [],
        timezones: [],
        coordinates: []
      }
    }

    // Default fallback for unknown countries
    return {
      code: countryCode,
      name: { common: 'Кишвари номаълум', official: 'Кишвари номаълум', native: [] },
      flag: { emoji: '🏳️', alt: 'Байрақи номаълум' },
      capital: [],
      region: 'Номаълум',
      population: 0,
      area: 0,
      languages: [],
      currencies: [],
      funFacts: ['Маълумот дар бораи ин кишвар дастрас нест'],
      educationalTips: ['Маълумоти бештар дарёфт кунед']
    }
  }

  generateFunFactsFromData(countryData) {
    const facts = []
    
    if (countryData.population) {
      const populationMillions = (countryData.population / 1000000).toFixed(1)
      facts.push(`Аҳолии ин кишвар тақрибан ${populationMillions} миллион нафар аст`)
    }
    
    if (countryData.area) {
      const areaThousands = (countryData.area / 1000).toFixed(0)
      facts.push(`Масоҳати ин кишвар ${areaThousands} ҳазор км² аст`)
    }
    
    if (countryData.languages && countryData.languages.length > 1) {
      facts.push(`Дар ин кишвар ${countryData.languages.length} забони расмӣ мавҷуд аст`)
    }

    return facts
  }

  generateEducationalTipsFromData(countryData) {
    const tips = []
    
    if (countryData.capital && countryData.capital.length > 0) {
      tips.push(`Пойтахти ин кишвар ${countryData.capital[0]} аст`)
    }
    
    if (countryData.region) {
      tips.push(`Ин кишвар дар минтақаи ${countryData.region} воқеъ аст`)
    }
    
    if (countryData.languages && countryData.languages.length > 0) {
      tips.push(`Забони(ҳои) расмии ин кишвар: ${countryData.languages.join(', ')}`)
    }

    return tips
  }
}

// Export singleton instance
export default new CountryAPIService()