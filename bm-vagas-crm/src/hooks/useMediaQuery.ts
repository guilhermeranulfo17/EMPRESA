import { useEffect, useState } from 'react'

export function useMediaQuery(query: string) {
  const [ok, setOk] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const mql = window.matchMedia(query)
    const ouvir = () => setOk(mql.matches)
    ouvir()
    mql.addEventListener('change', ouvir)
    return () => mql.removeEventListener('change', ouvir)
  }, [query])
  return ok
}

export const useDesktop = () => useMediaQuery('(min-width: 1024px)')
