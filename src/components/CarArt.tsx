// Ilustrações de carro desenhadas em SVG, usadas no lugar de fotos reais
// na página-cópia do marketplace.

export type CarView = 'side' | 'front' | 'rear' | 'cabin'

interface Props {
  view: CarView
  body: string
  sky: number
}

const SKIES = [
  ['#cfe3f2', '#f1f6fa'],
  ['#f6dcc3', '#fbf1e6'],
  ['#d7dde8', '#eef1f6'],
  ['#d2e8da', '#eef6f0'],
]

function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16)
  const ch = (shift: number) => Math.max(0, Math.min(255, ((n >> shift) & 255) + amount))
  return `#${[16, 8, 0].map((s) => ch(s).toString(16).padStart(2, '0')).join('')}`
}

export function CarArt({ view, body, sky }: Props) {
  const [top, bottom] = SKIES[sky % SKIES.length]
  const dark = shade(body, -40)
  const light = shade(body, 35)
  const id = `${view}-${sky}-${body.slice(1)}`

  return (
    <svg viewBox="0 0 800 520" role="img" aria-hidden="true" className="car-art" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
        <linearGradient id={`body-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset="0.55" stopColor={body} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
      </defs>
      <rect width="800" height="520" fill={`url(#sky-${id})`} />
      {view !== 'cabin' && (
        <>
          <path d="M0 350 L120 290 L210 330 L330 255 L470 335 L560 285 L690 340 L800 300 V400 H0Z" fill="#000" opacity="0.06" />
          <rect y="395" width="800" height="125" fill="#9aa0a8" />
          <rect y="395" width="800" height="6" fill="#868c94" />
          <g stroke="#fff" strokeWidth="6" opacity="0.55">
            <path d="M40 470 H190 M300 470 H450 M560 470 H710" />
          </g>
        </>
      )}
      {view === 'side' && <Side id={id} dark={dark} />}
      {view === 'front' && <FrontRear id={id} dark={dark} front />}
      {view === 'rear' && <FrontRear id={id} dark={dark} front={false} />}
      {view === 'cabin' && <Cabin />}
    </svg>
  )
}

function Wheel({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="48" fill="#1b1d22" />
      <circle cx={cx} cy={cy} r="30" fill="#c9ced6" />
      <circle cx={cx} cy={cy} r="9" fill="#5b616b" />
      <g stroke="#8d939d" strokeWidth="5">
        {[0, 72, 144, 216, 288].map((a) => (
          <line key={a} x1={cx} y1={cy} x2={cx + 27 * Math.cos((a * Math.PI) / 180)} y2={cy + 27 * Math.sin((a * Math.PI) / 180)} />
        ))}
      </g>
    </g>
  )
}

function Side({ id, dark }: { id: string; dark: string }) {
  return (
    <g>
      <ellipse cx="410" cy="418" rx="330" ry="20" fill="#000" opacity="0.18" />
      <path
        d="M70 360 L70 318 Q72 296 100 290 L190 275 Q235 232 300 200 Q330 186 372 186 H490 Q528 186 556 208 L618 262 L700 276 Q736 284 740 316 V360 Z"
        fill={`url(#body-${id})`}
      />
      <path d="M262 262 Q300 218 340 206 H395 V262 Z" fill="#26323f" opacity="0.92" />
      <path d="M410 206 H488 Q512 208 530 224 L574 262 H410 Z" fill="#26323f" opacity="0.92" />
      <path d="M262 262 Q300 218 340 206 H350 L300 262Z" fill="#fff" opacity="0.16" />
      <rect x="400" y="206" width="8" height="58" fill={dark} />
      <path d="M70 330 H740" stroke={dark} strokeWidth="3" opacity="0.5" />
      <rect x="448" y="288" width="40" height="7" rx="3" fill={dark} />
      <rect x="318" y="288" width="40" height="7" rx="3" fill={dark} />
      <path d="M714 296 Q736 300 738 318 L704 316Z" fill="#fff6c9" />
      <path d="M72 300 L98 298 L98 316 L72 318Z" fill="#c2262d" />
      <rect x="70" y="344" width="672" height="18" fill={dark} opacity="0.55" />
      <Wheel cx={190} cy={362} />
      <Wheel cx={590} cy={362} />
    </g>
  )
}

function FrontRear({ id, dark, front }: { id: string; dark: string; front: boolean }) {
  const lamp = front ? '#fff6c9' : '#c2262d'
  return (
    <g>
      <ellipse cx="400" cy="425" rx="250" ry="22" fill="#000" opacity="0.2" />
      <path d="M170 380 V300 Q172 270 200 262 L240 160 Q256 130 290 130 H510 Q544 130 560 160 L600 262 Q628 270 630 300 V380 Z" fill={`url(#body-${id})`} />
      <path d="M262 165 Q270 150 292 150 H508 Q530 150 538 165 L566 245 H234 Z" fill="#26323f" opacity="0.92" />
      <path d="M262 165 Q270 150 292 150 H330 L290 245 H234Z" fill="#fff" opacity="0.14" />
      <rect x="196" y="286" width="86" height="30" rx="10" fill={lamp} />
      <rect x="518" y="286" width="86" height="30" rx="10" fill={lamp} />
      <rect x="318" y="318" width="164" height="40" rx="6" fill={front ? '#20242b' : '#eceff3'} />
      {front && (
        <g stroke="#454b55" strokeWidth="3">
          <path d="M326 328 H474 M326 338 H474 M326 348 H474" />
        </g>
      )}
      {!front && <rect x="352" y="326" width="96" height="26" rx="3" fill="#fff" stroke="#17348c" strokeWidth="3" />}
      <rect x="170" y="364" width="460" height="22" rx="8" fill={dark} opacity="0.75" />
      <rect x="196" y="372" width="62" height="46" rx="8" fill="#1b1d22" />
      <rect x="542" y="372" width="62" height="46" rx="8" fill="#1b1d22" />
    </g>
  )
}

function Cabin() {
  return (
    <g>
      <rect width="800" height="520" fill="#2a2f38" />
      <path d="M0 0 H800 V250 Q400 190 0 250Z" fill="#aab9c6" opacity="0.5" />
      <path d="M0 250 Q400 190 800 250 V320 Q400 270 0 320Z" fill="#14171c" />
      <rect y="320" width="800" height="200" fill="#1c2027" />
      <circle cx="250" cy="330" r="118" fill="none" stroke="#0c0e12" strokeWidth="34" />
      <circle cx="250" cy="330" r="30" fill="#0c0e12" />
      <rect x="150" y="238" width="200" height="62" rx="30" fill="#0c0e12" opacity="0.85" />
      <circle cx="215" cy="268" r="30" fill="#10151c" stroke="#59616d" strokeWidth="4" />
      <circle cx="295" cy="268" r="30" fill="#10151c" stroke="#59616d" strokeWidth="4" />
      <path d="M215 268 L232 252 M295 268 L312 252" stroke="#e4572e" strokeWidth="4" strokeLinecap="round" />
      <rect x="470" y="248" width="220" height="130" rx="14" fill="#0c0e12" />
      <rect x="482" y="260" width="196" height="106" rx="8" fill="#1f4466" />
      <path d="M482 330 Q540 290 600 322 T678 300 V366 H482Z" fill="#2f7da6" opacity="0.7" />
      <rect x="470" y="400" width="220" height="36" rx="10" fill="#0c0e12" />
      <circle cx="510" cy="418" r="10" fill="#59616d" />
      <circle cx="580" cy="418" r="10" fill="#59616d" />
      <circle cx="650" cy="418" r="10" fill="#59616d" />
    </g>
  )
}
