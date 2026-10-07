import { loginResponseSchema } from '@/src/types/auth'
import { request } from './base.api'

export interface LoginCredentials {
  email: string
  password: string
}

export const loginApi = (credentials: LoginCredentials) =>
  request('/user/login', loginResponseSchema, { method: 'POST', body: credentials })
