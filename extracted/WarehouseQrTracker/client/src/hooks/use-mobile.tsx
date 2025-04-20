import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState<boolean>(false)

  React.useEffect(() => {
    const media = window.matchMedia(query)
    const listener = () => setMatches(media.matches)
    
    // Initial check
    setMatches(media.matches)
    
    // Add listener
    media.addEventListener("change", listener)
    return () => media.removeEventListener("change", listener)
  }, [query])

  return matches
}

export function useIsMobile() {
  const isMobile = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
  return isMobile
}
