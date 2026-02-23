import Link from 'next/link'

export function Logo({ size = 32, showText = true, textColor = 'text-black' }: {
  size?: number
  showText?: boolean
  textColor?: string
}) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 font-black text-lg tracking-tight ${textColor}`}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="10" fill={textColor === 'text-white' ? 'white' : 'black'} />
        <path d="M8 21 Q14 11 20 21 Q26 31 32 21" stroke={textColor === 'text-white' ? 'black' : 'white'} strokeWidth="2.8" strokeLinecap="round" fill="none"/>
        <path d="M8 27 Q14 17 20 27 Q26 37 32 27" stroke={textColor === 'text-white' ? 'black' : 'white'} strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.35"/>
        <path d="M8 15 Q14 5 20 15 Q26 25 32 15" stroke={textColor === 'text-white' ? 'black' : 'white'} strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.35"/>
      </svg>
      {showText && <span>Campus Flow</span>}
    </Link>
  )
}

export function LogoIcon({ size = 32, inverted = false }: { size?: number; inverted?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill={inverted ? 'white' : 'black'} />
      <path d="M8 21 Q14 11 20 21 Q26 31 32 21" stroke={inverted ? 'black' : 'white'} strokeWidth="2.8" strokeLinecap="round" fill="none"/>
      <path d="M8 27 Q14 17 20 27 Q26 37 32 27" stroke={inverted ? 'black' : 'white'} strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.35"/>
      <path d="M8 15 Q14 5 20 15 Q26 25 32 15" stroke={inverted ? 'black' : 'white'} strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.35"/>
    </svg>
  )
}
