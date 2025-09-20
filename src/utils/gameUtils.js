/**
 * Game utilities for question generation and game logic
 */

/**
 * Shuffle array using Fisher-Yates algorithm
 */
export function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Get random items from array
 */
export function getRandomItems(array, count) {
  const shuffled = shuffleArray(array)
  return shuffled.slice(0, count)
}

/**
 * Generate capital questions from country data
 */
export function generateCapitalQuestions(countries, gameMode = 'guessCapital', count = 10) {
  const questions = []
  const shuffledCountries = shuffleArray(countries)

  for (let i = 0; i < Math.min(count, shuffledCountries.length); i++) {
    const correctCountry = shuffledCountries[i]
    
    if (!correctCountry.capital || correctCountry.capital.length === 0) continue

    // Use localized names when available
    const capital = correctCountry.localizedCapital || correctCountry.capital[0]
    const countryName = correctCountry.localizedName || correctCountry.name.common

    // Get 3 wrong answers, ensuring uniqueness
    const otherCountries = shuffledCountries.filter(c => 
      (c.localizedName || c.name.common) !== countryName && 
      c.capital && 
      c.capital.length > 0
    )

    const wrongAnswers = []
    const usedAnswers = new Set([gameMode === 'guessCapital' ? capital : countryName])

    for (const country of otherCountries) {
      if (wrongAnswers.length >= 3) break
      
      const answer = gameMode === 'guessCapital' 
        ? (country.localizedCapital || country.capital[0])
        : (country.localizedName || country.name.common)
      
      if (!usedAnswers.has(answer)) {
        wrongAnswers.push(answer)
        usedAnswers.add(answer)
      }
    }

    // Ensure we have enough options
    if (wrongAnswers.length < 3) {
      console.warn(`Only ${wrongAnswers.length} unique wrong answers for ${countryName}`)
      // Pad with generic options if needed
      while (wrongAnswers.length < 3) {
        wrongAnswers.push(`Ҷавоби ${wrongAnswers.length + 2}`)
      }
    }

    const correctAnswer = gameMode === 'guessCapital' ? capital : countryName

    // Create options and shuffle
    const options = shuffleArray([correctAnswer, ...wrongAnswers])
    const correctIndex = options.indexOf(correctAnswer)

    questions.push({
      id: `capital_${i}`,
      question: gameMode === 'guessCapital' 
        ? `Пойтахти ${countryName} кадом аст?`
        : `${capital} пойтахти кадом кишвар аст?`,
      options,
      correctAnswer: correctIndex,
      type: 'capital',
      difficulty: getDifficultyByRegion(correctCountry.region),
      countryData: correctCountry
    })
  }

  return questions
}

/**
 * Generate flag questions from country data
 */
export function generateFlagQuestions(countries, gameMode = 'guessName', count = 10) {
  const questions = []
  const shuffledCountries = shuffleArray(countries)

  for (let i = 0; i < Math.min(count, shuffledCountries.length); i++) {
    const correctCountry = shuffledCountries[i]
    
    if (!correctCountry.flags || !correctCountry.flags.png) continue

    const countryName = correctCountry.name.common
    const flagUrl = correctCountry.flags.png

    if (gameMode === 'guessFlag') {
      // Show country name, guess flag
      const wrongFlags = getRandomItems(
        shuffledCountries
          .filter(c => 
            c.name.common !== countryName && 
            c.flags && 
            c.flags.png
          ),
        3
      )

      const options = shuffleArray([correctCountry, ...wrongFlags])
      const correctIndex = options.findIndex(c => c.name.common === countryName)

      questions.push({
        id: `flag_${i}`,
        question: `Байрақи ${countryName}-ро интихоб кунед:`,
        options: options.map(c => ({
          image: c.flags.png,
          alt: c.name.common
        })),
        correctAnswer: correctIndex,
        type: 'flag',
        subType: 'guessFlag',
        difficulty: getDifficultyByRegion(correctCountry.region),
        countryData: correctCountry
      })
    } else {
      // Show flag, guess country name
      const wrongAnswers = getRandomItems(
        shuffledCountries
          .filter(c => c.name.common !== countryName)
          .map(c => c.name.common),
        3
      )

      const options = shuffleArray([countryName, ...wrongAnswers])
      const correctIndex = options.indexOf(countryName)

      questions.push({
        id: `flag_${i}`,
        question: 'Ин байрақ ба кадом кишвар тааллуқ дорад?',
        flagImage: flagUrl,
        options,
        correctAnswer: correctIndex,
        type: 'flag',
        subType: 'guessName',
        difficulty: getDifficultyByRegion(correctCountry.region),
        countryData: correctCountry
      })
    }
  }

  return questions
}

/**
 * Generate mixed questions for random mode
 */
export function generateMixedQuestions(countries, count = 20) {
  const capitalQuestions = generateCapitalQuestions(countries, 'guessCapital', Math.ceil(count * 0.4))
  const flagQuestions = generateFlagQuestions(countries, 'guessName', Math.ceil(count * 0.4))
  const reverseCapitalQuestions = generateCapitalQuestions(countries, 'guessName', Math.floor(count * 0.2))

  const allQuestions = [...capitalQuestions, ...flagQuestions, ...reverseCapitalQuestions]
  return shuffleArray(allQuestions).slice(0, count)
}

/**
 * Get difficulty level based on region/population
 */
function getDifficultyByRegion(region) {
  const regionDifficulty = {
    'Europe': 1,
    'Americas': 2,
    'Asia': 2,
    'Africa': 3,
    'Oceania': 3,
    'Antarctic': 3
  }
  return regionDifficulty[region] || 2
}

/**
 * Calculate score based on time and difficulty
 */
export function calculateScore(timeSpent, difficulty, isCorrect) {
  if (!isCorrect) return 0

  const baseScore = difficulty * 100
  const timeBonus = Math.max(0, 30 - timeSpent) * 10 // Bonus for quick answers
  
  return Math.round(baseScore + timeBonus)
}

/**
 * Get achievement for score
 */
export function getAchievement(score, totalQuestions) {
  const percentage = (score / (totalQuestions * 300)) * 100 // Max possible score per question is ~300

  if (percentage >= 90) return { title: 'Номзани олӣ!', emoji: '🏆', color: '#FFD700' }
  if (percentage >= 80) return { title: 'Хеле хуб!', emoji: '🥇', color: '#C0C0C0' }
  if (percentage >= 70) return { title: 'Хуб!', emoji: '🥈', color: '#CD7F32' }
  if (percentage >= 60) return { title: 'Қонеъкунанда', emoji: '👍', color: '#4CAF50' }
  
  return { title: 'Кӯшиш кунед!', emoji: '💪', color: '#FF9800' }
}

/**
 * Format time display
 */
export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Generate a shapes/map question for the shapes game
 * @param {Array} countries - Array of country objects
 * @param {string} gameMode - 'country-to-shape' or 'shape-to-country'
 * @returns {Object} Question object with country data and continent info
 */
export function generateShapesQuestion(countries, gameMode = 'country-to-shape') {
  if (!countries || countries.length === 0) {
    return null
  }

  // Filter out countries without proper geographical data
  const validCountries = countries.filter(country => 
    country.cca2 && country.localizedName && country.region
  )

  if (validCountries.length === 0) {
    return null
  }

  // Select a random country
  const randomIndex = Math.floor(Math.random() * validCountries.length)
  const selectedCountry = validCountries[randomIndex]

  // Get continent name in Tajik
  const continentNamesTajik = {
    'Africa': 'Африқо',
    'Asia': 'Осиё', 
    'Europe': 'Аврупо',
    'North America': 'Амрикои Шимолӣ',
    'South America': 'Амрикои Ҷанубӣ',
    'Americas': 'Амрикаҳо',
    'Australia': 'Австралия ва Уқёнусия',
    'Oceania': 'Австралия ва Уқёнусия',
    'Antarctica': 'Антарктида'
  }

  return {
    id: selectedCountry.cca2,
    cca2: selectedCountry.cca2,
    name: selectedCountry.name?.common || selectedCountry.localizedName,
    localizedName: selectedCountry.localizedName,
    region: selectedCountry.region,
    continent: continentNamesTajik[selectedCountry.region] || selectedCountry.region,
    gameMode: gameMode,
    type: 'shapes',
    // Format for GameContainer compatibility
    question: `${selectedCountry.localizedName}-ро дар харита пайдо кунед`,
    options: ['Дар харитаро зер кунед'], // Single option since this is map-based
    correctAnswer: 0
  }
}

/**
 * Calculate score based on time remaining and difficulty (for shapes/map games)
 */
export function calculateMapScore(timeLeft, difficulty) {
  const basePoints = {
    'easy': 10,
    'medium': 15,
    'hard': 20
  }
  
  const timeBonus = Math.max(0, timeLeft) * 2
  return basePoints[difficulty] + timeBonus
}