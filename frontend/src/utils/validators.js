export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

// Loosely matches Nepali mobile numbers (98xxxxxxxx / 97xxxxxxxx, 10 digits)
// without being so strict it blocks testing with other numbers.
export function isValidPhone(value) {
  return /^[9][6-8]\d{8}$/.test(value.trim())
}

export function isRequired(value) {
  return value !== undefined && value !== null && String(value).trim().length > 0
}
