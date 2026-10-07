import type { ZodType } from 'zod'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

export const NETWORK_ERROR = 0
const TIMEOUT_MS = 15_000

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string }

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  token?: string | null
  signal?: AbortSignal
}

const readMessage = (payload: unknown, status: number) => {
  if (payload && typeof payload === 'object' && 'message' in payload && typeof payload.message === 'string') {
    return payload.message
  }
  return `Request failed with status ${status}`
}

export async function request<T>(
  path: string,
  schema: ZodType<T>,
  { method = 'GET', body, token, signal }: RequestOptions = {},
): Promise<ApiResult<T>> {
  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(TIMEOUT_MS)]) : AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (error) {
    if (signal?.aborted) throw error
    return { ok: false, status: NETWORK_ERROR, message: 'Network request failed' }
  }

  const payload: unknown = await res.json().catch(() => null)

  if (!res.ok) {
    return { ok: false, status: res.status, message: readMessage(payload, res.status) }
  }

  const parsed = schema.safeParse(payload)
  if (!parsed.success) {
    return { ok: false, status: res.status, message: 'Unexpected response from server' }
  }

  return { ok: true, data: parsed.data }
}
