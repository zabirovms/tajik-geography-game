/**
 * API service for geography data using REST Countries API
 * https://restcountries.com - Free, no API key required
 */

const BASE_URL = 'https://restcountries.com/v3.1'

class ApiService {
  constructor() {
    this.cache = new Map()
    this.cacheTimeout = 1000 * 60 * 30 // 30 minutes
  }

  /**
   * Generic HTTP request handler with caching
   */
  async request(url, options = {}) {
    const cacheKey = url
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Cache the response
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      })

      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  /**
   * Get all countries with essential data for games
   */
  async getAllCountries() {
    const fields = 'name,translations,capital,flags,population,region,subregion,cca2,cca3'
    const url = `${BASE_URL}/all?fields=${fields}`
    
    const countries = await this.request(url)
    
    // Filter out countries without capitals and add localized names
    return countries
      .filter(country => 
        country.capital && 
        country.capital.length > 0 && 
        country.flags && 
        country.flags.png
      )
      .map(country => this.localizeCountryNames(country))
  }

  /**
   * Localize country names to Tajik when available
   */
  localizeCountryNames(country) {
    const localized = { ...country }
    
    // Try to get localized name (fallback chain: per → rus → en, then transliterate)
    let localizedName = null
    
    // First try Persian (close to Tajik)
    if (country.translations?.per?.common) {
      localizedName = this.transliteratePersianToTajik(country.translations.per.common)
    }
    // Then try Russian (widely known in Tajikistan)  
    else if (country.translations?.rus?.common) {
      localizedName = this.transliterateRussianToTajik(country.translations.rus.common)
    }
    // Finally transliterate English
    else if (country.name?.common) {
      localizedName = this.transliterateEnglishToTajik(country.name.common)
    }
    
    localized.localizedName = localizedName || country.name?.common || 'Номаълум'
    
    // Transliterate capitals
    if (country.capital && country.capital[0]) {
      localized.localizedCapital = this.transliterateCapital(country.capital[0])
    }
    
    // Track localization success
    localized.localizationSource = localizedName ? 
      (country.translations?.per?.common ? 'persian' : 
       country.translations?.rus?.common ? 'russian' : 'english') : 'none'
    
    return localized
  }

  /**
   * Transliterate Persian text to Tajik Cyrillic
   */
  transliteratePersianToTajik(persianText) {
    // Since Persian is written in Arabic script and Tajik in Cyrillic, 
    // we'll use a mapping for common country names
    const persianToTajik = {
      'فرانسه': 'Фаронса',
      'آلمان': 'Олмон', 
      'ایران': 'Эрон',
      'چین': 'Чин',
      'ژاپن': 'Япония',
      'هند': 'Ҳинд',
      'روسیه': 'Русия',
      'انگلستان': 'Англия',
      'ایتالیا': 'Италия',
      'اسپانیا': 'Испания'
    }
    
    return persianToTajik[persianText] || null
  }

  /**
   * Transliterate Russian text to Tajik Cyrillic
   */
  transliterateRussianToTajik(russianText) {
    // Russian and Tajik both use Cyrillic, but with some differences
    return russianText
      .replace(/Россия/g, 'Русия')
      .replace(/я$/g, 'ё') // Common ending change
      .replace(/ия$/g, 'ия') // Keep most -ия endings
  }

  /**
   * Transliterate English country names to Tajik Cyrillic
   */
  transliterateEnglishToTajik(englishText) {
    const transliterationMap = {
      'Afghanistan': 'Афғонистон',
      'Albania': 'Албания', 
      'Algeria': 'Алҷазоир',
      'Argentina': 'Аргентина',
      'Armenia': 'Арманистон',
      'Australia': 'Австралия',
      'Austria': 'Австрия',
      'Azerbaijan': 'Озарбойҷон',
      'Bahrain': 'Баҳрайн',
      'Bangladesh': 'Бангладеш',
      'Belarus': 'Белорус',
      'Belgium': 'Белгия',
      'Brazil': 'Бразилия',
      'Bulgaria': 'Булғория',
      'Canada': 'Канада',
      'China': 'Чин',
      'Croatia': 'Хорватия',
      'Czech Republic': 'Ҷумҳурии Чех',
      'Denmark': 'Дания',
      'Egypt': 'Миср',
      'Finland': 'Финляндия',
      'France': 'Фаронса',
      'Georgia': 'Гурҷистон',
      'Germany': 'Олмония',
      'Greece': 'Юнон',
      'Hungary': 'Маҷористон',
      'India': 'Ҳинд',
      'Indonesia': 'Индонезия',
      'Iran': 'Эрон',
      'Iraq': 'Ироқ',
      'Ireland': 'Ирландия',
      'Israel': 'Исроил',
      'Italy': 'Италия',
      'Japan': 'Япония',
      'Jordan': 'Урдун',
      'Kazakhstan': 'Қазоқистон',
      'Kuwait': 'Кувайт',
      'Kyrgyzstan': 'Қирғизистон',
      'Latvia': 'Латвия',
      'Lebanon': 'Лубнон',
      'Lithuania': 'Литва',
      'Malaysia': 'Малезия',
      'Mexico': 'Мексика',
      'Mongolia': 'Муғулистон',
      'Morocco': 'Марокаш',
      'Netherlands': 'Нидерландия',
      'Norway': 'Норвегия',
      'Pakistan': 'Покистон',
      'Poland': 'Лаҳистон',
      'Portugal': 'Португалия',
      'Qatar': 'Қатар',
      'Romania': 'Руминия',
      'Russia': 'Русия',
      'Saudi Arabia': 'Арабистони Саудӣ',
      'Singapore': 'Сингапур',
      'South Korea': 'Кореяи Ҷанубӣ',
      'Spain': 'Испания',
      'Sweden': 'Шветсия',
      'Switzerland': 'Швейтсария',
      'Syria': 'Сурия',
      'Tajikistan': 'Тоҷикистон',
      'Thailand': 'Таиланд',
      'Turkey': 'Туркия',
      'Turkmenistan': 'Туркманистон',
      'Ukraine': 'Украина',
      'United Arab Emirates': 'Аморатҳои Муттаҳидаи Араб',
      'United Kingdom': 'Шоҳигарии Муттаҳида',
      'United States': 'Иёлоти Муттаҳидаи Амрико',
      'Uzbekistan': 'Ӯзбакистон',
      'Vietnam': 'Ветнам',
      'Yemen': 'Яман'
    }
    
    return transliterationMap[englishText] || this.basicTransliteration(englishText)
  }

  /**
   * Basic phonetic transliteration from Latin to Tajik Cyrillic
   */
  basicTransliteration(text) {
    const mapping = {
      'a': 'а', 'b': 'б', 'c': 'к', 'd': 'д', 'e': 'е', 'f': 'ф',
      'g': 'г', 'h': 'ҳ', 'i': 'и', 'j': 'ҷ', 'k': 'к', 'l': 'л',
      'm': 'м', 'n': 'н', 'o': 'о', 'p': 'п', 'q': 'қ', 'r': 'р',
      's': 'с', 't': 'т', 'u': 'у', 'v': 'в', 'w': 'в', 'x': 'кс',
      'y': 'й', 'z': 'з'
    }
    
    return text.toLowerCase().split('').map(char => mapping[char] || char).join('')
  }

  /**
   * Enhanced capital city transliteration
   */
  transliterateCapital(capital) {
    const transliterations = {
      // Major world capitals
      'Moscow': 'Маскав', 'Beijing': 'Пекин', 'Tokyo': 'Токё', 'Delhi': 'Делӣ',
      'London': 'Лондон', 'Paris': 'Париж', 'Berlin': 'Берлин', 'Rome': 'Рим',
      'Madrid': 'Мадрид', 'Washington, D.C.': 'Вашингтон', 'Ottawa': 'Оттава',
      'Canberra': 'Канберра', 'Cairo': 'Қоҳира', 'Tehran': 'Теҳрон',
      
      // Regional capitals important to Tajik speakers
      'Istanbul': 'Истанбул', 'Ankara': 'Анкара', 'Kabul': 'Кобул',
      'Islamabad': 'Исломобод', 'New Delhi': 'Нав Делӣ', 'Tashkent': 'Тошканд',
      'Bishkek': 'Бишкек', 'Ashgabat': 'Ашғобот', 'Baku': 'Боку',
      'Yerevan': 'Ереван', 'Tbilisi': 'Тбилисӣ', 'Almaty': 'Алматӣ',
      'Nur-Sultan': 'Нур-Султон', 'Dushanbe': 'Душанбе',
      
      // Additional important capitals
      'Vienna': 'Вена', 'Warsaw': 'Варшава', 'Prague': 'Прага',
      'Budapest': 'Будапешт', 'Stockholm': 'Стокгольм', 'Oslo': 'Осло',
      'Helsinki': 'Ҳелсинкӣ', 'Copenhagen': 'Копенҳаген', 'Amsterdam': 'Амстердам',
      'Brussels': 'Брюссел', 'Lisbon': 'Лисабон', 'Athens': 'Афина',
      'Sofia': 'София', 'Bucharest': 'Бухарест', 'Kiev': 'Киев',
      'Minsk': 'Минск', 'Riga': 'Рига', 'Vilnius': 'Вилнюс',
      'Tallinn': 'Таллин', 'Dublin': 'Дублин', 'Reykjavik': 'Рейкьявик'
    }
    
    return transliterations[capital] || this.basicTransliteration(capital)
  }

  /**
   * Get countries by region for difficulty levels
   */
  async getCountriesByRegion(region) {
    const url = `${BASE_URL}/region/${region}`
    return await this.request(url)
  }

  /**
   * Get specific country data
   */
  async getCountryByName(name) {
    const url = `${BASE_URL}/name/${name}`
    return await this.request(url)
  }

  /**
   * Get countries by language for localization
   */
  async getCountriesByLanguage(language) {
    const url = `${BASE_URL}/lang/${language}`
    return await this.request(url)
  }

  /**
   * Get flag image URL for a country code
   */
  getFlagUrl(countryCode, size = 'w320') {
    return `https://flagcdn.com/${size}/${countryCode.toLowerCase()}.png`
  }

  /**
   * Get alternative flag URL
   */
  getAlternativeFlagUrl(countryCode, size = 64, style = 'flat') {
    return `https://flagsapi.com/${countryCode.toUpperCase()}/${style}/${size}.png`
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear()
  }
}

// Export singleton instance
export default new ApiService()