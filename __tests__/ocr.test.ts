import { describe, it, expect } from "vitest"
import { extractWithHeuristics, EXTRACTABLE_CATEGORIES, ExtractionError } from "../src/lib/ocr"

describe("receipt heuristics", () => {
  it("extracts amount from a TOTAL line and merchant from the first line", () => {
    const r = extractWithHeuristics("Swiggy Order\n2x Biriyani\nGST 42\nTOTAL: ₹486.50")
    expect(r.merchant).toBe("Swiggy Order")
    expect(r.amount).toBe(486.5)
    expect(r.category).toBe("Food & Dining")
    expect(EXTRACTABLE_CATEGORIES).toContain(r.category)
    expect(r.source).toBe("heuristic")
  })

  it("falls back to the largest rupee figure when no total line exists", () => {
    const r = extractWithHeuristics("Amazon\nBook ₹299\nHeadphones ₹4,499\nSaved ₹500")
    expect(r.amount).toBe(4499)
    expect(r.category).toBe("Shopping")
  })

  it("maps utility receipts to Bills & Utilities", () => {
    const r = extractWithHeuristics("Airtel Broadband\nMonthly wifi bill\nAmount due: ₹799")
    expect(r.category).toBe("Bills & Utilities")
  })

  it("throws NO_AMOUNT_FOUND for garbage input", () => {
    try {
      extractWithHeuristics("hello world nothing here")
      throw new Error("should have thrown")
    } catch (e) {
      expect(e).toBeInstanceOf(ExtractionError)
      expect((e as ExtractionError).code).toBe("NO_AMOUNT_FOUND")
    }
  })
})