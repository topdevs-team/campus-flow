export interface Preferences {
  cleanliness_level?: number
  noise_level?: number
  sleep_schedule?: string
  budget_min?: number
  budget_max?: number
  smoking?: boolean
  pets?: boolean
  guests_frequency?: string
  preferred_location?: string
}

export function calculateSimilarity(prefs1: Preferences, prefs2: Preferences): number {
  let score = 0
  let weight = 0

  // Cleanliness level (0-100)
  if (prefs1.cleanliness_level !== undefined && prefs2.cleanliness_level !== undefined) {
    const diff = Math.abs(prefs1.cleanliness_level - prefs2.cleanliness_level)
    score += (100 - diff * 10) * 0.2
    weight += 0.2
  }

  // Noise level (0-100)
  if (prefs1.noise_level !== undefined && prefs2.noise_level !== undefined) {
    const diff = Math.abs(prefs1.noise_level - prefs2.noise_level)
    score += (100 - diff * 10) * 0.2
    weight += 0.2
  }

  // Sleep schedule match
  if (prefs1.sleep_schedule && prefs2.sleep_schedule) {
    const match = prefs1.sleep_schedule === prefs2.sleep_schedule ? 100 : 40
    score += match * 0.1
    weight += 0.1
  }

  // Budget range overlap
  if (
    prefs1.budget_min !== undefined &&
    prefs1.budget_max !== undefined &&
    prefs2.budget_min !== undefined &&
    prefs2.budget_max !== undefined
  ) {
    const overlap = Math.max(0, Math.min(prefs1.budget_max, prefs2.budget_max) - Math.max(prefs1.budget_min, prefs2.budget_min))
    const maxRange = Math.max(prefs1.budget_max - prefs1.budget_min, prefs2.budget_max - prefs2.budget_min)
    const match = maxRange > 0 ? (overlap / maxRange) * 100 : 50
    score += match * 0.15
    weight += 0.15
  }

  // Smoking preference match
  if (prefs1.smoking !== undefined && prefs2.smoking !== undefined) {
    score += (prefs1.smoking === prefs2.smoking ? 100 : 20) * 0.1
    weight += 0.1
  }

  // Pets preference match
  if (prefs1.pets !== undefined && prefs2.pets !== undefined) {
    score += (prefs1.pets === prefs2.pets ? 100 : 30) * 0.1
    weight += 0.1
  }

  // Guests frequency match
  if (prefs1.guests_frequency && prefs2.guests_frequency) {
    const match = prefs1.guests_frequency === prefs2.guests_frequency ? 100 : 50
    score += match * 0.08
    weight += 0.08
  }

  // Location preference match
  if (prefs1.preferred_location && prefs2.preferred_location) {
    const match = prefs1.preferred_location === prefs2.preferred_location ? 100 : 40
    score += match * 0.07
    weight += 0.07
  }

  return weight > 0 ? Math.round((score / weight) * 100) / 100 : 0
}
