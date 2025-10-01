"use client"

import { useCallback, useMemo, useRef, useEffect, useState } from 'react'

// Hook centralizado para performance
export function usePerformanceOptimized() {
  const [isHydrated, setIsHydrated] = useState(false)

  // Verificar hidratação
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Debounce otimizado
  const useDebounce = useCallback(<T extends (...args: any[]) => any>(
    callback: T,
    delay: number
  ): T => {
    const timeoutRef = useRef<NodeJS.Timeout>()
    const callbackRef = useRef(callback)

    useEffect(() => {
      callbackRef.current = callback
    }, [callback])

    const debouncedCallback = useCallback(
      (...args: Parameters<T>) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(() => {
          callbackRef.current(...args)
        }, delay)
      },
      [delay]
    ) as T

    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    }, [])

    return debouncedCallback
  }, [])

  // Throttle otimizado
  const useThrottle = useCallback(<T extends (...args: any[]) => any>(
    callback: T,
    delay: number
  ): T => {
    const lastRun = useRef<number>(0)
    const callbackRef = useRef(callback)

    useEffect(() => {
      callbackRef.current = callback
    }, [callback])

    const throttledCallback = useCallback(
      (...args: Parameters<T>) => {
        const now = Date.now()
        if (now - lastRun.current >= delay) {
          lastRun.current = now
          callbackRef.current(...args)
        }
      },
      [delay]
    ) as T

    return throttledCallback
  }, [])

  // Intersection Observer otimizado
  const useIntersectionObserver = useCallback((
    callback: (entries: IntersectionObserverEntry[]) => void,
    options: IntersectionObserverInit = {}
  ) => {
    const observerRef = useRef<IntersectionObserver | null>(null)
    const callbackRef = useRef(callback)

    useEffect(() => {
      callbackRef.current = callback
    }, [callback])

    const observe = useCallback(
      (element: HTMLElement) => {
        if (observerRef.current) {
          observerRef.current.disconnect()
        }

        observerRef.current = new IntersectionObserver(
          (entries) => callbackRef.current(entries),
          options
        )

        observerRef.current.observe(element)
      },
      [options]
    )

    const unobserve = useCallback(() => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }, [])

    useEffect(() => {
      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect()
        }
      }
    }, [])

    return { observe, unobserve }
  }, [])

  // Hook para verificar se está no cliente
  const useIsClient = useCallback(() => {
    return isHydrated
  }, [isHydrated])

  // Hook para verificar se é mobile
  const useIsMobile = useCallback(() => {
    const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined)

    useEffect(() => {
      if (!isHydrated) return

      const mql = window.matchMedia('(max-width: 767px)')
      const onChange = () => {
        setIsMobile(window.innerWidth < 768)
      }
      
      mql.addEventListener('change', onChange)
      setIsMobile(window.innerWidth < 768)
      
      return () => mql.removeEventListener('change', onChange)
    }, [isHydrated])

    return !!isMobile
  }, [isHydrated])

  return {
    isHydrated,
    useDebounce,
    useThrottle,
    useIntersectionObserver,
    useIsClient,
    useIsMobile
  }
}
