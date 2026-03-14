type P = { size?: number; className?: string }

const D = ({ children }: { children: React.ReactNode }) => (
  <>
    <polygon points="50,3 97,50 50,97 3,50" fill="white" stroke="#dc2626" strokeWidth="5.5" />
    {children}
  </>
)

export function SghExplosive({ size = 40, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
      <D>
        {/* Bomb body */}
        <circle cx="50" cy="63" r="19" fill="black" />
        {/* Fuse */}
        <path d="M50 44 Q56 37 52 30 Q57 23 63 17" stroke="black" strokeWidth="3.5" strokeLinecap="round" />
        {/* Spark */}
        <circle cx="64" cy="15" r="4.5" fill="black" />
        {/* Explosion rays */}
        <line x1="28" y1="44" x2="20" y2="35" stroke="black" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="35" y1="33" x2="29" y2="24" stroke="black" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="20" y1="57" x2="11" y2="54" stroke="black" strokeWidth="3.5" strokeLinecap="round" />
      </D>
    </svg>
  )
}

export function SghFlammable({ size = 40, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
      <D>
        {/* Outer flame */}
        <path d="M50 78 C31 78 21 63 26 48 C30 36 40 38 40 27 C44 38 42 45 47 45 C47 33 53 24 57 15 C60 28 55 38 60 44 C67 36 72 44 72 55 C72 68 62 78 50 78Z" fill="black" />
        {/* Inner lighter zone */}
        <path d="M50 70 C40 70 35 62 38 54 C40 48 45 50 45 44 C47 50 46 54 49 54 C50 48 53 44 55 52 C58 59 55 70 50 70Z" fill="white" />
      </D>
    </svg>
  )
}

export function SghOxidizing({ size = 40, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
      <D>
        {/* Ring (horseshoe) */}
        <path d="M35 70 A15 15 0 1 1 65 70" stroke="black" strokeWidth="6" strokeLinecap="round" fill="none" />
        {/* Flame above ring */}
        <path d="M50 52 C44 52 39 46 42 39 C43 34 47 36 47 30 C49 36 48 41 50 41 C51 36 54 30 56 24 C58 31 55 37 57 40 C61 35 65 39 65 45 C65 51 57 52 50 52Z" fill="black" />
      </D>
    </svg>
  )
}

export function SghGasPressure({ size = 40, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
      <D>
        {/* Cylinder body */}
        <rect x="35" y="44" width="30" height="36" rx="5" fill="black" />
        {/* Top dome */}
        <ellipse cx="50" cy="44" rx="15" ry="8" fill="black" />
        {/* Valve stem */}
        <rect x="46" y="30" width="8" height="11" rx="3" fill="black" />
        {/* Valve handle */}
        <rect x="38" y="25" width="24" height="7" rx="3.5" fill="black" />
        {/* Shine line on cylinder */}
        <rect x="39" y="50" width="4" height="22" rx="2" fill="white" opacity="0.25" />
        {/* Base */}
        <rect x="31" y="79" width="38" height="6" rx="3" fill="black" />
      </D>
    </svg>
  )
}

export function SghCorrosive({ size = 40, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
      <D>
        {/* Drop 1 */}
        <path d="M37 13 Q37 7 43 7 Q49 7 49 13 L43 23Z" fill="black" />
        {/* Drop 2 */}
        <path d="M55 18 Q55 12 61 12 Q67 12 67 18 L61 28Z" fill="black" />
        {/* Drip lines */}
        <line x1="43" y1="23" x2="43" y2="45" stroke="black" strokeWidth="2.5" strokeDasharray="4 3" strokeLinecap="round" />
        <line x1="61" y1="28" x2="61" y2="45" stroke="black" strokeWidth="2.5" strokeDasharray="4 3" strokeLinecap="round" />
        {/* Surface */}
        <line x1="22" y1="55" x2="78" y2="55" stroke="black" strokeWidth="5" strokeLinecap="round" />
        {/* Damage/holes left side */}
        <path d="M28 55 L24 64 M38 55 L32 68 L40 74" stroke="black" strokeWidth="3" strokeLinecap="round" fill="none" />
        {/* Damage/holes right side */}
        <path d="M58 55 L62 66 M68 55 L65 65 L73 72" stroke="black" strokeWidth="3" strokeLinecap="round" fill="none" />
      </D>
    </svg>
  )
}

export function SghToxic({ size = 40, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
      <D>
        {/* Skull */}
        <ellipse cx="50" cy="42" rx="21" ry="19" fill="black" />
        {/* Eye sockets */}
        <circle cx="42" cy="40" r="5.5" fill="white" />
        <circle cx="58" cy="40" r="5.5" fill="white" />
        {/* Nose */}
        <path d="M47 50 L53 50 L50 55Z" fill="white" />
        {/* Jaw bar */}
        <rect x="35" y="57" width="30" height="10" rx="2" fill="black" />
        {/* Teeth gaps */}
        <rect x="40" y="57" width="4" height="9" rx="0" fill="white" />
        <rect x="48" y="57" width="4" height="9" rx="0" fill="white" />
        <rect x="56" y="57" width="4" height="9" rx="0" fill="white" />
        {/* Crossbones */}
        <line x1="26" y1="72" x2="74" y2="85" stroke="black" strokeWidth="6" strokeLinecap="round" />
        <line x1="26" y1="85" x2="74" y2="72" stroke="black" strokeWidth="6" strokeLinecap="round" />
        {/* Bone knobs */}
        <circle cx="26" cy="72" r="5" fill="black" />
        <circle cx="74" cy="85" r="5" fill="black" />
        <circle cx="74" cy="72" r="5" fill="black" />
        <circle cx="26" cy="85" r="5" fill="black" />
      </D>
    </svg>
  )
}

export function SghHarmful({ size = 40, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
      <D>
        {/* Exclamation bar */}
        <rect x="43" y="18" width="14" height="46" rx="7" fill="black" />
        {/* Exclamation dot */}
        <circle cx="50" cy="76" r="8" fill="black" />
      </D>
    </svg>
  )
}

export function SghHealthHazard({ size = 40, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
      <D>
        {/* Head */}
        <circle cx="50" cy="26" r="11" fill="black" />
        {/* Body */}
        <path d="M33 68 L33 46 Q33 37 50 37 Q67 37 67 46 L67 68Z" fill="black" />
        {/* Legs */}
        <rect x="33" y="65" width="13" height="18" rx="5" fill="black" />
        <rect x="54" y="65" width="13" height="18" rx="5" fill="black" />
        {/* Starburst on chest */}
        <line x1="50" y1="44" x2="50" y2="58" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <line x1="44" y1="46" x2="56" y2="56" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <line x1="56" y1="46" x2="44" y2="56" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <line x1="42" y1="51" x2="58" y2="51" stroke="white" strokeWidth="3" strokeLinecap="round" />
      </D>
    </svg>
  )
}

export function SghEnvHazard({ size = 40, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
      <D>
        {/* Tree trunk */}
        <rect x="45" y="54" width="10" height="26" fill="black" />
        {/* Main branches */}
        <line x1="50" y1="54" x2="30" y2="30" stroke="black" strokeWidth="6.5" strokeLinecap="round" />
        <line x1="50" y1="54" x2="70" y2="30" stroke="black" strokeWidth="6.5" strokeLinecap="round" />
        {/* Sub-branches */}
        <line x1="37" y1="44" x2="24" y2="40" stroke="black" strokeWidth="4.5" strokeLinecap="round" />
        <line x1="63" y1="44" x2="76" y2="40" stroke="black" strokeWidth="4.5" strokeLinecap="round" />
        {/* Fish body */}
        <ellipse cx="72" cy="74" rx="10" ry="6" fill="black" />
        {/* Fish tail */}
        <path d="M62 74 L53 67 L53 81Z" fill="black" />
        {/* Fish eye */}
        <circle cx="76" cy="72" r="2.5" fill="white" />
      </D>
    </svg>
  )
}

export function SghCmr({ size = 40, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
      <D>
        {/* DNA left strand */}
        <path d="M38 18 C46 28 54 38 62 48 C54 58 46 68 38 78" stroke="black" strokeWidth="4" strokeLinecap="round" fill="none" />
        {/* DNA right strand */}
        <path d="M62 18 C54 28 46 38 38 48 C46 58 54 68 62 78" stroke="black" strokeWidth="4" strokeLinecap="round" fill="none" />
        {/* Horizontal rungs */}
        <line x1="43" y1="27" x2="57" y2="27" stroke="black" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="36" y1="48" x2="64" y2="48" stroke="black" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="43" y1="69" x2="57" y2="69" stroke="black" strokeWidth="3.5" strokeLinecap="round" />
      </D>
    </svg>
  )
}
