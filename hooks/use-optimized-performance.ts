"use client"

import React, { useCallback, useMemo, useRef, useEffect } from 'react'

// Hook para memoização de componentes pesados
export function useMemoizedComponent<T extends React.ComponentType<any>>(
  Component: T,
  props: React.ComponentProps<T>,
  deps: React.DependencyList
) {
  return useMemo(() => {
    return React.createElement(Component, props)
  }, [Component, props, ...deps])
}

// Hook para debounce otimizado
export function useOptimizedDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const callbackRef = useRef(callback)

  // Atualizar callback ref quando mudar
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
    [delay, ...deps]
  ) as T

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedCallback
}

// Hook para throttle otimizado
export function useOptimizedThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
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
    [delay, ...deps]
  ) as T

  return throttledCallback
}

// Hook para intersection observer otimizado
export function useOptimizedIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
) {
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
        {
          rootMargin: '50px',
          threshold: 0.1,
          ...options,
        }
      )

      observerRef.current.observe(element)
    },
    [options]
  )

  const unobserve = useCallback((element: HTMLElement) => {
    if (observerRef.current) {
      observerRef.current.unobserve(element)
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
}

// Hook para performance monitoring
export function usePerformanceMonitor() {
  const startTime = useRef<number>(Date.now())

  const markStart = useCallback((name: string) => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(`${name}-start`)
    }
  }, [])

  const markEnd = useCallback((name: string) => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(`${name}-end`)
      performance.measure(name, `${name}-start`, `${name}-end`)
    }
  }, [])

  const measure = useCallback((name: string, fn: () => void) => {
    markStart(name)
    fn()
    markEnd(name)
  }, [markStart, markEnd])

  return { markStart, markEnd, measure }
}

// Hook para memory optimization
export function useMemoryOptimization() {
  const cleanupFunctions = useRef<(() => void)[]>([])

  const addCleanup = useCallback((cleanup: () => void) => {
    cleanupFunctions.current.push(cleanup)
  }, [])

  useEffect(() => {
    return () => {
      cleanupFunctions.current.forEach(cleanup => cleanup())
      cleanupFunctions.current = []
    }
  }, [])

  return { addCleanup }
}
