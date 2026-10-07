const Pistons = ({ side }: { side: 'left' | 'right' }) => {
  const isLeft = side === 'left'
  const bar = isLeft
    ? 'bg-gradient-to-r from-transparent to-[#D4AF37] rounded-l-sm'
    : 'bg-gradient-to-l from-transparent to-[#D4AF37] rounded-r-sm'

  return (
    <div
      className={`relative z-10 w-8 h-64 flex flex-col justify-between py-8 shadow-[0_0_30px_rgba(212,175,55,0.3)] ${
        isLeft ? 'border-r-4 mr-[-2px]' : 'border-l-4 ml-[-2px]'
      } border-[#D4AF37]`}
    >
      <div className={`w-12 h-4 ${bar}`} />
      <div className={`w-16 h-4 ${bar}`} />
      <div className={`w-12 h-4 ${bar}`} />
    </div>
  )
}

export function VaultDoor() {
  return (
    <div className="fixed inset-0 z-50 flex pointer-events-none" aria-hidden="true">
      {/* Left Door Panel */}
      <div className="vault-door-left w-1/2 h-full bg-[#050505] border-r border-[#D4AF37]/20 flex items-center justify-end relative z-20">
        {/* Brushed Metal Texture */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A] to-[#050505] opacity-90" />

        {/* Locking Mechanisms (Pistons) */}
        <Pistons side="left" />
      </div>

      {/* Right Door Panel */}
      <div className="vault-door-right w-1/2 h-full bg-[#050505] border-l border-[#D4AF37]/20 flex items-center justify-start relative z-20">
        {/* Brushed Metal Texture */}
        <div className="absolute inset-0 bg-gradient-to-bl from-[#1A1A1A] to-[#050505] opacity-90" />

        {/* Locking Mechanisms (Pistons) */}
        <Pistons side="right" />
      </div>

      {/* Central Lock Spinner (Fading out) */}
      <div className="absolute inset-0 z-30 flex items-center justify-center animate-ping-slow pointer-events-none">
        <div className="w-96 h-96 rounded-full border border-[#D4AF37]/10 animate-spin-slow-reverse" />
      </div>
    </div>
  )
}
