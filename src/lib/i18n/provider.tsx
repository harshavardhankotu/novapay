"use client"
import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { LangCode, t as translate } from "./index"

interface LangContextType {
  lang: LangCode
  setLang: (code: LangCode) => void
  t: (key: string) => string
}

const LangContext = createContext<LangContextType>({ lang: "en", setLang: () => {}, t: (k: string) => k })

export function useLang() {
  return useContext(LangContext)
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en")
  const setLang = useCallback((code: LangCode) => setLangState(code), [])

  return (
    <LangContext.Provider value={{ lang, setLang, t: (key: string) => translate(key, lang) }}>
      {children}
    </LangContext.Provider>
  )
}
