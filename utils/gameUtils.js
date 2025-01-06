/**
 * 生成旗帜相关游戏题目
 * @param {Array} dataPool - 数据池
 * @param {String} gameType - 游戏类型：'country' 或 'state'
 * @param {String} gameMode - 游戏模式：'guessFlag' 或 'guessName'
 */
export function generateFlagQuestions(dataPool, gameType = 'country', gameMode = 'guessName', questionCount = 10) {
  const pool = [...dataPool]
  const questions = []
  
  while (pool.length < questionCount) {
    pool.push(...dataPool)
  }
  
  const shuffledPool = pool.sort(() => Math.random() - 0.5)
  
  for (let i = 0; i < questionCount; i++) {
    const correctAnswer = shuffledPool[i]
    const wrongOptions = shuffledPool
      .filter(item => item.tid !== correctAnswer.tid)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
    
    if (gameMode === 'guessFlag') {
      // 显示名称，猜旗帜
      questions.push({
        questionText: correctAnswer.stateEn || correctAnswer.countryEn,
        options: [correctAnswer.flagSrc, ...wrongOptions.map(item => item.flagSrc)].sort(() => Math.random() - 0.5),
        answer: correctAnswer.flagSrc,
        dataEncoded: correctAnswer.dataEncoded,
        enName: correctAnswer.stateEn || correctAnswer.countryEn,
        cnName: correctAnswer.stateCn
      })
    } else {
      // 显示旗帜，猜名称
      questions.push({
        imageUrl: correctAnswer.flagSrc,
        options: [
          correctAnswer.stateEn || correctAnswer.countryEn,
          ...wrongOptions.map(item => item.stateEn || item.countryEn)
        ].sort(() => Math.random() - 0.5),
        answer: correctAnswer.stateEn || correctAnswer.countryEn,
        dataEncoded: correctAnswer.dataEncoded,
        enName: correctAnswer.stateEn || correctAnswer.countryEn,
        cnName: correctAnswer.stateCn
      })
    }
  }
  
  return questions
}

/**
 * 生成轮廓相关游戏题目
 * @param {Array} dataPool - 数据池
 * @param {String} gameMode - 游戏模式：'guessCountryOutline' 或 'guessOutlineCountry'
 * @param {Number} questionCount - 题目数量
 */
export function generateShapeQuestions(dataPool, gameType = 'country', gameMode = 'guessCountryOutline', questionCount = 10) {
 console.error('gameMode:', gameMode);
  const pool = [...dataPool];
  const questions = [];

  // 确保数据池足够
  while (pool.length < questionCount) {
    pool.push(...dataPool);
  }

  const shuffledPool = pool.sort(() => Math.random() - 0.5);

  for (let i = 0; i < questionCount; i++) {
    const correctAnswer = shuffledPool[i];
    const wrongOptions = shuffledPool
      .filter(item => item.tid !== correctAnswer.tid) // 确保不包含正确答案
      .sort(() => Math.random() - 0.5)
      .slice(0, 3); // 选择 3 个错误选项

    if (gameMode === 'guessCountryOutline') {
      // 显示轮廓，猜国家
      questions.push({
        imageUrl: correctAnswer.flagSrc, // 轮廓图像
        options: [
          correctAnswer.stateEn || correctAnswer.countryEn, // 正确答案
          ...wrongOptions.map(item => correctAnswer.stateEn || correctAnswer.countryEn) // 错误选项
        ].sort(() => Math.random() - 0.5), // 随机打乱选项
        answer: correctAnswer.stateEn || correctAnswer.countryEn, // 正确答案
        dataEncoded: correctAnswer.dataEncoded,
        enName: correctAnswer.stateEn || correctAnswer.countryEn,
        cnName: correctAnswer.stateCn
      });
    } else if (gameMode === 'guessOutlineCountry') {
      // 显示国家，猜轮廓
      questions.push({
        questionText: correctAnswer.stateEn || correctAnswer.countryEn, // 国家名称
        options: [
          correctAnswer.flagSrc, // 正确答案
          ...wrongOptions.map(item => item.flagSrc) // 错误选项
        ].sort(() => Math.random() - 0.5), // 随机打乱选项
        answer: correctAnswer.shapeSrc, // 正确答案
        dataEncoded: correctAnswer.dataEncoded,
        enName: correctAnswer.stateEn || correctAnswer.countryEn,
        cnName: correctAnswer.stateCn
      });
    }
  }

  return questions;
}

/**
 * 生成首都相关游戏题目
 * @param {Array} dataPool - 数据池
 * @param {String} gameType - 游戏类型：'country' 或 'state'
 * @param {String} gameMode - 游戏模式：'guessCapital' 或 'guessName'
 * @param {Number} questionCount - 题目数量
 */
export function generateCapitalQuestions(dataPool, gameType = 'country', gameMode = 'guessCapital', questionCount = 10) {
  const pool = [...dataPool];
  const questions = [];

  // 确保数据池足够
  while (pool.length < questionCount) {
    pool.push(...dataPool);
  }

  const shuffledPool = pool.sort(() => Math.random() - 0.5);

  for (let i = 0; i < questionCount; i++) {
    const correctAnswer = shuffledPool[i];
    const wrongOptions = shuffledPool
      .filter(item => item.tid !== correctAnswer.tid) // 确保不包含正确答案
      .sort(() => Math.random() - 0.5)
      .slice(0, 3); // 选择 3 个错误选项

    if (gameMode === 'guessCapital') {
      // 显示国家/州名，猜首都
      questions.push({
        questionText: gameType === 'country' ? correctAnswer.countryEn : correctAnswer.stateEn, // 国家或州名称
        options: [
          correctAnswer.flagSrc, // 正确答案
          ...wrongOptions.map(item => item.flagSrc) // 错误选项
        ].sort(() => Math.random() - 0.5), // 随机打乱选项
        answer: correctAnswer.flagSrc, // 正确答案
        dataEncoded: correctAnswer.dataEncoded,
        enName: gameType === 'country' ? correctAnswer.countryEn : correctAnswer.stateEn,
        cnName: gameType === 'country' ? correctAnswer.countryCn : correctAnswer.stateCn
      });
    } else {
      // 显示首都，猜国家/州名
      questions.push({
        questionText: correctAnswer.flagSrc, // 首都名称
        options: [
          gameType === 'country' ? correctAnswer.countryEn : correctAnswer.stateEn, // 正确答案
          ...wrongOptions.map(item => gameType === 'country' ? item.countryEn : item.stateEn) // 错误选项
        ].sort(() => Math.random() - 0.5), // 随机打乱选项
        answer: gameType === 'country' ? correctAnswer.countryEn : correctAnswer.stateEn, // 正确答案
        dataEncoded: correctAnswer.dataEncoded,
        enName: gameType === 'country' ? correctAnswer.countryEn : correctAnswer.stateEn,
        cnName: gameType === 'country' ? correctAnswer.countryCn : correctAnswer.stateCn
      });
    }
  }

  return questions;
}