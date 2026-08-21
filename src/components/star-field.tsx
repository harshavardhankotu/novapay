/**
 * Deterministic particle field — golden-ratio distribution instead of
 * Math.random(), so server and client render identical output
 * (pure render, zero hydration mismatch).
 */
export function StarField({ count = 30 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const left = (i * 137.508) % 100
        const top = ((i * 61.803) + 13) % 100
        const size = 1 + ((i * 7) % 18) / 9
        const opacity = 0.2 + ((i * 37) % 50) / 100
        const delay = ((i * 53) % 50) / 10
        const duration = 2 + ((i * 29) % 30) / 10
        return (
          <div
            key={i}
            className="star"
            style={{
              left: `${left.toFixed(3)}%`,
              top: `${top.toFixed(3)}%`,
              width: `${size.toFixed(2)}px`,
              height: `${size.toFixed(2)}px`,
              opacity,
              animationDelay: `${delay.toFixed(2)}s`,
              animationDuration: `${duration.toFixed(2)}s`,
            }}
          />
        )
      })}
    </>
  )
}