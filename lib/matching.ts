export interface Preferences {
  id?: string
  user_id?: string
  cleanliness_level?: number
  noise_level?: number
  sleep_schedule?: string
  budget_min?: number
  budget_max?: number
  smoking?: boolean
  pets?: boolean
  guests_frequency?: string
  preferred_location?: string
  study_style?: string
  conflict_style?: string
  routine_flexibility?: string
  social_energy?: string
}

export interface MatchDimension {
  key:
    | 'cleanliness'
    | 'noise'
    | 'sleep'
    | 'budget'
    | 'smoking'
    | 'pets'
    | 'guests'
    | 'location'
    | 'study_style'
    | 'conflict_style'
    | 'routine_flexibility'
    | 'social_energy'
  label: string
  score: number
  weight: number
}

export interface MatchResult {
  score: number
  dimensions: MatchDimension[]
}

const DIMENSION_WEIGHTS = {
  cleanliness: 0.2,
  noise: 0.2,
  sleep: 0.12,
  budget: 0.18,
  smoking: 0.1,
  pets: 0.08,
  guests: 0.06,
  location: 0.06,
  study_style: 0.07,
  conflict_style: 0.05,
  routine_flexibility: 0.06,
  social_energy: 0.06,
} as const

function clamp(num: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, num))
}

function scoreScaledDifference(a: number, b: number, maxDiff: number): number {
  const diff = Math.abs(a - b)
  return clamp((1 - diff / maxDiff) * 100, 0, 100)
}

function scoreBudgetOverlap(aMin: number, aMax: number, bMin: number, bMax: number): number {
  const normAMin = Math.min(aMin, aMax)
  const normAMax = Math.max(aMin, aMax)
  const normBMin = Math.min(bMin, bMax)
  const normBMax = Math.max(bMin, bMax)

  const overlap = Math.max(0, Math.min(normAMax, normBMax) - Math.max(normAMin, normBMin))
  const union = Math.max(normAMax, normBMax) - Math.min(normAMin, normBMin)
  const overlapScore = union > 0 ? (overlap / union) * 100 : 100

  const midpointA = (normAMin + normAMax) / 2
  const midpointB = (normBMin + normBMax) / 2
  const midpointGap = Math.abs(midpointA - midpointB)
  const midpointScore = clamp((1 - midpointGap / 3000) * 100, 0, 100)

  return overlapScore * 0.7 + midpointScore * 0.3
}

function scoreCategoricalCloseness(
  a: string,
  b: string,
  order: readonly string[],
  fallbackMismatch = 40,
): number {
  if (a === b) return 100
  const indexA = order.indexOf(a)
  const indexB = order.indexOf(b)
  if (indexA < 0 || indexB < 0) return fallbackMismatch
  return clamp((1 - Math.abs(indexA - indexB) / (order.length - 1 || 1)) * 100, 0, 100)
}

function tokenizeLocation(value: string): Set<string> {
  return new Set(
    value
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .map((part) => part.trim())
      .filter(Boolean),
  )
}

function scoreLocation(a: string, b: string): number {
  const setA = tokenizeLocation(a)
  const setB = tokenizeLocation(b)
  if (setA.size === 0 || setB.size === 0) return 40

  let intersection = 0
  for (const token of setA) {
    if (setB.has(token)) intersection += 1
  }
  const union = setA.size + setB.size - intersection
  return union > 0 ? (intersection / union) * 100 : 100
}

export function calculateMatchResult(prefs1: Preferences, prefs2: Preferences): MatchResult {
  const dimensions: MatchDimension[] = []
  let weightedScore = 0
  let totalWeight = 0

  if (prefs1.cleanliness_level !== undefined && prefs2.cleanliness_level !== undefined) {
    const score = scoreScaledDifference(prefs1.cleanliness_level, prefs2.cleanliness_level, 10)
    const weight = DIMENSION_WEIGHTS.cleanliness
    dimensions.push({ key: 'cleanliness', label: 'Cleanliness', score, weight })
    weightedScore += score * weight
    totalWeight += weight
  }

  if (prefs1.noise_level !== undefined && prefs2.noise_level !== undefined) {
    const score = scoreScaledDifference(prefs1.noise_level, prefs2.noise_level, 10)
    const weight = DIMENSION_WEIGHTS.noise
    dimensions.push({ key: 'noise', label: 'Noise Tolerance', score, weight })
    weightedScore += score * weight
    totalWeight += weight
  }

  if (prefs1.sleep_schedule && prefs2.sleep_schedule) {
    const score = scoreCategoricalCloseness(
      prefs1.sleep_schedule,
      prefs2.sleep_schedule,
      ['early_bird', 'normal', 'night_owl'],
      45,
    )
    const weight = DIMENSION_WEIGHTS.sleep
    dimensions.push({ key: 'sleep', label: 'Sleep Schedule', score, weight })
    weightedScore += score * weight
    totalWeight += weight
  }

  if (
    prefs1.budget_min !== undefined &&
    prefs1.budget_max !== undefined &&
    prefs2.budget_min !== undefined &&
    prefs2.budget_max !== undefined
  ) {
    const score = scoreBudgetOverlap(
      prefs1.budget_min,
      prefs1.budget_max,
      prefs2.budget_min,
      prefs2.budget_max,
    )
    const weight = DIMENSION_WEIGHTS.budget
    dimensions.push({ key: 'budget', label: 'Budget Fit', score, weight })
    weightedScore += score * weight
    totalWeight += weight
  }

  if (prefs1.smoking !== undefined && prefs2.smoking !== undefined) {
    const score = prefs1.smoking === prefs2.smoking ? 100 : 15
    const weight = DIMENSION_WEIGHTS.smoking
    dimensions.push({ key: 'smoking', label: 'Smoking Preference', score, weight })
    weightedScore += score * weight
    totalWeight += weight
  }

  if (prefs1.pets !== undefined && prefs2.pets !== undefined) {
    const score = prefs1.pets === prefs2.pets ? 100 : 30
    const weight = DIMENSION_WEIGHTS.pets
    dimensions.push({ key: 'pets', label: 'Pets Preference', score, weight })
    weightedScore += score * weight
    totalWeight += weight
  }

  if (prefs1.guests_frequency && prefs2.guests_frequency) {
    const score = scoreCategoricalCloseness(
      prefs1.guests_frequency,
      prefs2.guests_frequency,
      ['rarely', 'sometimes', 'often'],
      50,
    )
    const weight = DIMENSION_WEIGHTS.guests
    dimensions.push({ key: 'guests', label: 'Guest Frequency', score, weight })
    weightedScore += score * weight
    totalWeight += weight
  }

  if (prefs1.preferred_location && prefs2.preferred_location) {
    const score = scoreLocation(prefs1.preferred_location, prefs2.preferred_location)
    const weight = DIMENSION_WEIGHTS.location
    dimensions.push({ key: 'location', label: 'Preferred Location', score, weight })
    weightedScore += score * weight
    totalWeight += weight
  }

  if (prefs1.study_style && prefs2.study_style) {
    const score = scoreCategoricalCloseness(
      prefs1.study_style,
      prefs2.study_style,
      ['solo', 'pair', 'group'],
      50,
    )
    const weight = DIMENSION_WEIGHTS.study_style
    dimensions.push({ key: 'study_style', label: 'Study/Life Style', score, weight })
    weightedScore += score * weight
    totalWeight += weight
  }

  if (prefs1.conflict_style && prefs2.conflict_style) {
    const score = scoreCategoricalCloseness(
      prefs1.conflict_style,
      prefs2.conflict_style,
      ['direct', 'calm', 'mediated'],
      55,
    )
    const weight = DIMENSION_WEIGHTS.conflict_style
    dimensions.push({ key: 'conflict_style', label: 'Conflict Resolution Style', score, weight })
    weightedScore += score * weight
    totalWeight += weight
  }

  if (prefs1.routine_flexibility && prefs2.routine_flexibility) {
    const score = scoreCategoricalCloseness(
      prefs1.routine_flexibility,
      prefs2.routine_flexibility,
      ['strict', 'balanced', 'flexible'],
      50,
    )
    const weight = DIMENSION_WEIGHTS.routine_flexibility
    dimensions.push({ key: 'routine_flexibility', label: 'Routine Flexibility', score, weight })
    weightedScore += score * weight
    totalWeight += weight
  }

  if (prefs1.social_energy && prefs2.social_energy) {
    const score = scoreCategoricalCloseness(
      prefs1.social_energy,
      prefs2.social_energy,
      ['quiet', 'balanced', 'social'],
      50,
    )
    const weight = DIMENSION_WEIGHTS.social_energy
    dimensions.push({ key: 'social_energy', label: 'Social Energy', score, weight })
    weightedScore += score * weight
    totalWeight += weight
  }

  const score = totalWeight > 0 ? Number((weightedScore / totalWeight).toFixed(2)) : 0
  return { score, dimensions }
}

export function calculateSimilarity(prefs1: Preferences, prefs2: Preferences): number {
  return calculateMatchResult(prefs1, prefs2).score
}
