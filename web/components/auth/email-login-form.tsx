'use client'

import { useState, type FormEvent } from 'react'
import { EnvelopeSimple, LockKey, CaretRight, Eye, EyeSlash, WarningCircle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginApi } from '@/lib/services/login.api'
import { NETWORK_ERROR } from '@/lib/services/base.api'
import { useAuthStore } from '@/lib/auth-store'

const inputClass =
  'pl-10 bg-[#1A1A1A] border-[#2A2A2A] text-[#E8E8E8] placeholder:text-[#888888] focus:border-[#D4AF37] focus:ring-[#D4AF37]/20 aria-[invalid=true]:border-[#E5484D]/70'

function loginErrorMessage(status: number, message: string) {
  switch (status) {
    case NETWORK_ERROR:
      return "We couldn't reach APAX. Check your connection and try again."
    case 400:
      return message
    case 401:
      return "That email and password don't match an account."
    case 429:
      return 'Too many attempts. Wait a minute, then try again.'
    default:
      return 'Something went wrong on our side. Try again in a moment.'
  }
}

interface EmailLoginFormProps {
  onSuccess: () => void
}

export function EmailLoginForm({ onSuccess }: EmailLoginFormProps) {
  const setSession = useAuthStore((s) => s.setSession)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    setIsLoading(true)
    setError(null)

    const res = await loginApi({ email: email.trim(), password })

    if (!res.ok) {
      setError(loginErrorMessage(res.status, res.message))
      setIsLoading(false)
      return
    }

    setSession(res.data.token, res.data.user)
    onSuccess()
  }

  const clearError = () => error && setError(null)

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-busy={isLoading}>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-[#C0C0C0]">Email</Label>
        <div className="relative">
          <EnvelopeSimple className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" aria-hidden />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="client@apax.institutional"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              clearError()
            }}
            disabled={isLoading}
            aria-invalid={!!error}
            aria-describedby={error ? 'login-error' : undefined}
            className={inputClass}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-[#C0C0C0]">Password</Label>
        <div className="relative">
          <LockKey className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" aria-hidden />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              clearError()
            }}
            disabled={isLoading}
            aria-invalid={!!error}
            aria-describedby={error ? 'login-error' : undefined}
            className={`${inputClass} pr-10`}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#C0C0C0]"
          >
            {showPassword ? <EyeSlash className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-[#888888]">
          <input type="checkbox" className="rounded border-[#2A2A2A] bg-[#1A1A1A] text-[#D4AF37] focus:ring-[#D4AF37]/20" />
          Remember me
        </label>
        <a href="#" className="text-[#D4AF37] hover:text-[#E6C861]">Forgot password?</a>
      </div>

      <div aria-live="assertive">
        {error && (
          <p
            id="login-error"
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-[#E5484D]/30 bg-[#E5484D]/10 px-3 py-2.5 text-sm text-[#F2A8AA]"
          >
            <WarningCircle weight="fill" className="mt-0.5 h-4 w-4 shrink-0 text-[#E5484D]" aria-hidden />
            <span>{error}</span>
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full metallic-shine bg-[#D4AF37] text-[#0A0A0A] hover:bg-[#E6C861] font-semibold h-12 gap-2"
      >
        {isLoading ? (
          <>
            <span className="w-5 h-5 border-2 border-[#0A0A0A]/30 border-t-[#0A0A0A] rounded-full animate-spin" aria-hidden />
            Signing in
          </>
        ) : (
          <>
            Sign In
            <CaretRight weight="bold" className="w-4 h-4" />
          </>
        )}
      </Button>
    </form>
  )
}
