import { useQuery } from '@tanstack/react-query'
import { useState, useEffect, useCallback } from 'react'
import { fetchInquiryDetail } from '@/api/inquiry'
import { POLLING_CONFIG } from '@/utils/constants'
import type { Inquiry } from '@/types/inquiry'

interface UseInquiryDetailOptions {
  enabled?: boolean
}

export function useInquiryDetail(id: string, options: UseInquiryDetailOptions = {}) {
  const { enabled = true } = options
  const [isPolling, setIsPolling] = useState(true)
  const [elapsedTime, setElapsedTime] = useState(0)

  const shouldPoll = useCallback((data: Inquiry | undefined): boolean => {
    if (!data) return true
    // Stop polling if answer exists or Category is not "質問"
    if (data.answer) return false
    if (data.Category && data.Category !== '質問') return false
    return true
  }, [])

  const getRefetchInterval = useCallback((): number | false => {
    if (!isPolling) return false
    if (elapsedTime >= POLLING_CONFIG.TIMEOUT) return false
    if (elapsedTime >= POLLING_CONFIG.EXTEND_AFTER) {
      return POLLING_CONFIG.EXTENDED_INTERVAL
    }
    return POLLING_CONFIG.INITIAL_INTERVAL
  }, [isPolling, elapsedTime])

  const query = useQuery({
    queryKey: ['inquiry', id],
    queryFn: () => fetchInquiryDetail(id),
    enabled: enabled && !!id,
    refetchInterval: getRefetchInterval(),
    staleTime: 0,
  })

  // Update elapsed time
  useEffect(() => {
    if (!isPolling || !enabled) return

    const timer = setInterval(() => {
      setElapsedTime((prev) => {
        const next = prev + 1000
        if (next >= POLLING_CONFIG.TIMEOUT) {
          setIsPolling(false)
        }
        return next
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isPolling, enabled])

  // Stop polling when answer is received or category is set
  useEffect(() => {
    if (query.data && !shouldPoll(query.data)) {
      setIsPolling(false)
    }
  }, [query.data, shouldPoll])

  const stopPolling = useCallback(() => {
    setIsPolling(false)
  }, [])

  const restartPolling = useCallback(() => {
    setElapsedTime(0)
    setIsPolling(true)
  }, [])

  return {
    ...query,
    isPolling,
    elapsedTime,
    stopPolling,
    restartPolling,
    currentInterval: getRefetchInterval(),
  }
}
