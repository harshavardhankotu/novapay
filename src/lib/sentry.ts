export function logError(error: Error, context?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "production") {
    console.error("[Sentry]", error.message, context || "")
  }
  console.error(`[Error] ${error.message}`, context || "")
}

export function logEvent(name: string, data?: Record<string, unknown>) {
  console.log(`[Event] ${name}`, data || "")
}
