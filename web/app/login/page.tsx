'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Wallet, EnvelopeSimple, ShieldCheck } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmailLoginForm } from '@/components/auth/email-login-form'
import { VaultDoor } from '@/components/auth/vault-door'
import { useAuthStore } from '@/lib/auth-store'

const VAULT_ANIMATION_MS = 1000

export default function LoginPage() {
  const router = useRouter()
  const [vaultOpening, setVaultOpening] = useState(false)
  const hydrated = useAuthStore((s) => s.hydrated)
  const token = useAuthStore((s) => s.token)

  useEffect(() => {
    if (hydrated && token && !vaultOpening) router.replace('/dashboard')
  }, [hydrated, token, vaultOpening, router])

  const handleLoginSuccess = () => {
    // Trigger vault door animation
    setVaultOpening(true)

    // Navigate after animation
    setTimeout(() => router.push('/dashboard'), VAULT_ANIMATION_MS)
  }

  return (
    <div className="min-h-screen bg-radial-obsidian flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-[#C0C0C0]/5 rounded-full blur-3xl" />

        {/* Vault door pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at center, #D4AF37 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Vault Door Animation Overlay */}
      {vaultOpening && <VaultDoor />}

      {/* Login Card */}
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-[#D4AF37]/20 rounded-full blur-xl" />
              <Image
                src="/images/apax-logo.png"
                alt="APAX"
                width={80}
                height={80}
                className="relative rounded-full"
              />
            </div>
            <h1 className="text-2xl font-serif font-bold text-gradient-gold">Enter The Vault</h1>
          </Link>
          <p className="text-sm text-[#888888] mt-2">Access your precious metal portfolio</p>
        </div>

        {/* Glass Card */}
        <div className="glass rounded-2xl p-8 gold-glow">
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-[#1A1A1A] p-1 rounded-lg">
              <TabsTrigger
                value="email"
                className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0A0A0A] text-[#888888] rounded-md transition-all"
              >
                <EnvelopeSimple className="w-4 h-4 mr-2" />
                Email
              </TabsTrigger>
              <TabsTrigger
                value="wallet"
                className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0A0A0A] text-[#888888] rounded-md transition-all"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Wallet
              </TabsTrigger>
            </TabsList>

            {/* Email Tab */}
            <TabsContent value="email">
              <EmailLoginForm onSuccess={handleLoginSuccess} />
            </TabsContent>

            {/* Wallet Tab */}
            <TabsContent value="wallet" className="space-y-6">
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <p className="text-sm text-[#888888]">
                  Wallet sign-in with SidraChain, MetaMask and WalletConnect is coming soon.
                  Use your email for now.
                </p>
              </div>

              <Button
                disabled
                className="w-full bg-[#1A1A1A] text-[#888888] border border-[#2A2A2A] font-semibold h-12"
              >
                Connect Sidra Ledger Gateway
              </Button>
            </TabsContent>
          </Tabs>

          {/* Security Badge */}
          <div className="mt-6 pt-6 border-t border-[#2A2A2A]">
            <div className="flex items-center justify-center gap-2 text-xs text-[#888888]">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>256-bit SSL Encryption</span>
              <span className="text-[#2A2A2A]">|</span>
              <span>RWA-Compliant</span>
            </div>
          </div>
        </div>

        {/* Sign up link */}
        <p className="text-center text-sm text-[#888888] mt-6">
          {"Don't have an account?"}{' '}
          <a href="#" className="text-[#D4AF37] hover:text-[#E6C861] font-medium">
            Create Account
          </a>
        </p>
      </div>
    </div>
  )
}
