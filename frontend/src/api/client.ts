const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || ''

// 環境変数が設定されていない場合は警告
if (!API_ENDPOINT) {
  console.error('VITE_API_ENDPOINT が設定されていません。.env.development を確認してください。')
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  headers?: Record<string, string>
}

export class ApiError extends Error {
  statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {} } = options

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  }

  if (body) {
    config.body = JSON.stringify(body)
  }

  try {
    const url = `${API_ENDPOINT}${endpoint}`

    // 開発環境でのデバッグログ
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${method} ${url}`, body ? { body } : '')
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      let errorMessage = 'Request failed'
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch {
        // JSONパースに失敗した場合はステータステキストを使用
        errorMessage = response.statusText || errorMessage
      }
      throw new ApiError(response.status, errorMessage)
    }

    return response.json()
  } catch (error) {
    // ネットワークエラーやCORS エラーの場合
    if (error instanceof ApiError) {
      if (import.meta.env.DEV) {
        console.error('[API Error]', error)
      }
      throw error
    }

    // 詳細なエラー情報をログに出力
    if (import.meta.env.DEV) {
      console.error('[Network Error]', error)
    }

    throw new ApiError(0, 'ネットワークエラーが発生しました。接続を確認してください。')
  }
}
