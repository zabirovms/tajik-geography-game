// Shared map data and utilities for geographic components

// Country names in Tajik
export const countryNamesTajik = {
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

// Continent data with colors and country mappings
export const continents = [
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

// Helper functions
export const getContinentByCountry = (countryCode) => {
  return continents.find(continent => 
    continent.countries.includes(countryCode)
  )
}

export const getUniqueCountryColor = (countryCode) => {
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

// Continent name mapping for localization
export const continentNamesTajik = {
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