export function validatePan(pan: string): boolean {
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.trim().toUpperCase())
}

// Verhoeff algorithm tables (used by UIDAI for Aadhaar check digits)
const D = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
]

const P = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
]

const INV = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9]

function verhoeffChecksum(digits: number[]): number {
  let c = 0
  const reversed = [...digits].reverse()
  reversed.forEach((digit, i) => {
    c = D[c][P[(i + 1) % 8][digit]]
  })
  return c
}

export function aadhaarCheckDigit(base11: string): number {
  // Brute-force the check digit against the exact validation loop,
  // guaranteeing generate/validate consistency by construction.
  for (let x = 0; x <= 9; x++) {
    if (verhoeffSum(`${base11}${x}`) === 0) return x
  }
  return 0
}

function verhoeffSum(digits: string): number {
  return verhoeffChecksum(digits.split("").map(Number))
}

export function validateAadhaar(aadhaar: string): boolean {
  const clean = aadhaar.replace(/[\s-]/g, "")
  if (!/^[2-9][0-9]{11}$/.test(clean)) return false
  return verhoeffChecksum(clean.split("").map(Number)) === 0
}

export function normalizeIndianPhone(input: string): string | null {
  let digits = input.replace(/\D/g, "")
  if (digits.startsWith("91") && digits.length === 12) digits = digits.slice(2)
  if (digits.startsWith("0") && digits.length === 11) digits = digits.slice(1)
  if (/^[6-9][0-9]{9}$/.test(digits)) return digits
  return null
}

export function maskAadhaar(aadhaar: string): string {
  const clean = aadhaar.replace(/[\s-]/g, "")
  return `XXXX XXXX ${clean.slice(-4)}`
}

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}
