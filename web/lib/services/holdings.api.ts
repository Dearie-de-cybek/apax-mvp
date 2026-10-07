import { holdingsResponseSchema } from '@/src/types/holdings'
import { request } from './base.api'

export const getHoldingsApi = (token: string, signal?: AbortSignal) =>
  request('/api/holdings', holdingsResponseSchema, { token, signal })
