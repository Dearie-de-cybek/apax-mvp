'use client'

import type { ReactNode } from 'react'
import { ArrowClockwise, Vault, WarningCircle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAPAXStore } from '@/lib/store'

function HoldingsSkeleton() {
  return (
    <div className="space-y-4 md:space-y-6" aria-hidden>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Skeleton className="h-[132px] sm:col-span-2 rounded-xl bg-[#1A1A1A]" />
        <Skeleton className="h-[132px] rounded-xl bg-[#1A1A1A]" />
        <Skeleton className="h-[132px] rounded-xl bg-[#1A1A1A]" />
        <Skeleton className="h-[132px] rounded-xl bg-[#1A1A1A]" />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        <Skeleton className="h-[380px] rounded-xl bg-[#1A1A1A]" />
        <Skeleton className="h-[380px] rounded-xl bg-[#1A1A1A]" />
      </div>
    </div>
  )
}

function HoldingsError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-4 rounded-xl border border-[#E5484D]/25 bg-[#E5484D]/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3 min-w-0">
        <WarningCircle weight="fill" className="mt-0.5 h-5 w-5 shrink-0 text-[#E5484D]" aria-hidden />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#E8E8E8]">We couldn&apos;t load your holdings</p>
          <p className="mt-1 text-sm text-[#A8A8A8] break-words">{message}</p>
        </div>
      </div>
      <Button
        onClick={onRetry}
        variant="outline"
        className="shrink-0 gap-2 border-[#2A2A2A] bg-transparent text-[#E8E8E8] hover:bg-[#1A1A1A] hover:border-[#D4AF37]/40"
      >
        <ArrowClockwise className="h-4 w-4" aria-hidden />
        Try again
      </Button>
    </div>
  )
}

function HoldingsEmpty() {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-[#2A2A2A] px-6 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[#2A2A2A] bg-[#1A1A1A]">
        <Vault className="h-6 w-6 text-[#D4AF37]" aria-hidden />
      </div>
      <p className="text-base font-semibold text-[#E8E8E8]">Your vault is empty</p>
      <p className="mt-2 max-w-sm text-sm text-[#888888]">
        Once a deposit is verified and allocated to you, your gold, silver and platinum will show up here.
      </p>
    </div>
  )
}

export function HoldingsSection({ children }: { children: ReactNode }) {
  const status = useAPAXStore((s) => s.holdingsStatus)
  const error = useAPAXStore((s) => s.holdingsError)
  const holdings = useAPAXStore((s) => s.userHoldings)
  const fetchHoldings = useAPAXStore((s) => s.fetchHoldings)

  if (status === 'idle' || status === 'loading') {
    return (
      <div aria-busy="true">
        <span className="sr-only">Loading your holdings</span>
        <HoldingsSkeleton />
      </div>
    )
  }

  if (status === 'error') {
    return <HoldingsError message={error ?? 'Something went wrong.'} onRetry={fetchHoldings} />
  }

  const isEmpty = holdings.goldGrams + holdings.silverGrams + holdings.platinumGrams === 0
  if (isEmpty) return <HoldingsEmpty />

  return <>{children}</>
}
