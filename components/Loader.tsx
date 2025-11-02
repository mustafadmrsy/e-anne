export default function Loader({ label = 'Yükleniyor…' }: { label?: string }) {
  return (
    <div
      className="fixed inset-0 z-[9999]"
      style={{
        backgroundImage: `url(/background/eriste-background.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-[#5e4a3a]/70" />
      <div className="relative h-full w-full flex items-center justify-center p-6">
        <div className="inline-flex flex-col items-center gap-4 text-white">
          {/* Çift halka spinner */}
          <div className="relative h-14 w-14">
            <div className="absolute inset-0 rounded-full border-2 border-white/20"></div>
            <div className="absolute inset-0 rounded-full border-2 border-white/70 border-t-transparent animate-spin" style={{ animationDuration: '1s' }}></div>
            <div className="absolute inset-2 rounded-full border-2 border-white/30 border-b-transparent animate-spin" style={{ animationDuration: '1.6s' }}></div>
          </div>
          <div className="text-sm font-medium tracking-wide">{label}</div>
          {/* üç nokta animasyonu */}
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-white/80 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="h-2 w-2 rounded-full bg-white/70 animate-bounce" style={{ animationDelay: '120ms' }} />
            <span className="h-2 w-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '240ms' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
