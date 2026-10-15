// Buzina de carro sintetizada ao clicar numa área livre da página.
// Som gerado pela Web Audio API, sem arquivo de áudio.

let ctx: AudioContext | null = null

/** Toca uma buzina curta de dois tons (como as de carro). */
function honk(): void {
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return
    ctx = ctx ?? new Ctor()
    if (ctx.state === 'suspended') void ctx.resume()

    const now = ctx.currentTime
    const master = ctx.createGain()
    master.gain.setValueAtTime(0.0001, now)
    master.gain.exponentialRampToValueAtTime(0.16, now + 0.02)
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.4)
    master.connect(ctx.destination)

    // Dois tons próximos dão o timbre característico da buzina.
    for (const freq of [440, 349.2]) {
      const osc = ctx.createOscillator()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(freq, now)
      osc.connect(master)
      osc.start(now)
      osc.stop(now + 0.42)
    }
  } catch {
    // Sem áudio disponível: segue sem buzina.
  }
}

const INTERACTIVE = 'a, button, input, textarea, select, label, summary, dialog, [role="button"], [contenteditable]'
const TEXTUAL = 'p, h1, h2, h3, h4, h5, h6, li, dt, dd, code, strong, em, small, figcaption, span'

/** Liga a buzina nos cliques em áreas livres (fora de botões, links, campos e texto). Retorna a limpeza. */
export function startHorn(): () => void {
  const onClick = (e: MouseEvent) => {
    if (e.button !== 0 || e.defaultPrevented) return
    const target = e.target as Element | null
    if (!target) return
    if (target.closest(INTERACTIVE) || target.closest(TEXTUAL)) return
    const selection = window.getSelection?.()
    if (selection && selection.type === 'Range' && !selection.isCollapsed) return
    honk()
  }
  document.addEventListener('click', onClick)
  return () => document.removeEventListener('click', onClick)
}
