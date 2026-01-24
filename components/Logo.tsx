export function Logo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#00d4ff', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#00a8cc', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      
      {/* Wallet/Receipt base - larger and more prominent */}
      <rect x="4" y="6" width="24" height="18" rx="2" fill="url(#logoGrad)" opacity="0.15"/>
      
      {/* Receipt lines - thicker and more visible */}
      <line x1="7" y1="10" x2="18" y2="10" stroke="url(#logoGrad)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="7" y1="16" x2="24" y2="16" stroke="url(#logoGrad)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="7" y1="22" x2="15" y2="22" stroke="url(#logoGrad)" strokeWidth="1.5" strokeLinecap="round"/>
      
      {/* AI Spark accent - larger and more prominent */}
      <path d="M 22 4 L 24 9 L 29 11 L 24 13 L 22 18 L 20 13 L 15 11 L 20 9 Z" 
            fill="url(#logoGrad)" opacity="0.95"/>
      
      {/* Small accent sparks */}
      <circle cx="10" cy="26" r="1" fill="#00d4ff" opacity="0.8"/>
      <circle cx="24" cy="24" r="0.8" fill="#00d4ff" opacity="0.7"/>
    </svg>
  );
}
