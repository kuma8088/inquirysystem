export interface ApiError {
  error: string
  statusCode?: number
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface PollingState {
  isPolling: boolean
  elapsedTime: number
  interval: number
}
