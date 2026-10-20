// Buzina de carro sintetizada enquanto o botão esquerdo é segurado numa área livre da página.
// Som gerado pela Web Audio API, sem arquivo de áudio.

let ctx: AudioContext | null = null
let voice: { stop: () => void } | null = null

/** Cria (uma vez) o contexto de áudio. */
function getContext(): AudioContext | null {
  if (ctx) return ctx
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  try {
    ctx = new Ctor()
  } catch {
    ctx = null
  }
  return ctx
}

// Navegadores só liberam áudio após um gesto do usuário. Destravamos o contexto no
// primeiro clique (antes do mousedown que dispara a buzina) e a cada novo clique,
// caso o navegador o suspenda por inatividade. Sem isso a buzina só sai depois de
// vários cliques.
function unlockAudio(): void {
  const audio = getContext()
  if (audio && audio.state === 'suspended') void audio.resume()
}

/** Curva de distorção suave (tanh) para dar o timbre metálico da buzina. */
function brassCurve(amount: number): Float32Array<ArrayBuffer> {
  const n = 256
  const curve = new Float32Array(new ArrayBuffer(n * 4))
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1
    curve[i] = Math.tanh(x * amount)
  }
  return curve
}

/** Começa a buzina (dois tons de carro) e a mantém tocando até stop(). */
function startHonk(): void {
  if (voice) return
  try {
    const audio = getContext()
    if (!audio) return
    if (audio.state === 'suspended') void audio.resume()

    const now = audio.currentTime

    // Envelope/ataque: sobe rápido e segura (buzina mantida enquanto o botão fica pressionado).
    const drive = audio.createGain()
    drive.gain.setValueAtTime(0.0001, now)
    drive.gain.exponentialRampToValueAtTime(0.22, now + 0.012)

    const shaper = audio.createWaveShaper()
    shaper.curve = brassCurve(2.2)

    const lowpass = audio.createBiquadFilter()
    lowpass.type = 'lowpass'
    lowpass.frequency.value = 3800
    lowpass.Q.value = 0.6

    const out = audio.createGain()
    out.gain.value = 0.45

    drive.connect(shaper)
    shaper.connect(lowpass)
    lowpass.connect(out)
    out.connect(audio.destination)

    // Dois tons a uma terça (≈ buzina de carro), cada um dobrado e levemente desafinado para encorpar.
    const oscs: OscillatorNode[] = []
    for (const base of [440, 554.37]) {
      for (const detune of [-5, 5]) {
        const osc = audio.createOscillator()
        osc.type = 'sawtooth'
        osc.frequency.value = base
        osc.detune.value = detune
        osc.connect(drive)
        osc.start(now)
        oscs.push(osc)
      }
    }

    voice = {
      stop: () => {
        if (!ctx) return
        const t = ctx.currentTime
        drive.gain.cancelScheduledValues(t)
        drive.gain.setValueAtTime(Math.max(drive.gain.value, 0.0001), t)
        drive.gain.exponentialRampToValueAtTime(0.0001, t + 0.06)
        for (const osc of oscs) osc.stop(t + 0.09)
        voice = null
      },
    }
  } catch {
    // Sem áudio disponível: segue sem buzina.
    voice = null
  }
}

function stopHonk(): void {
  voice?.stop()
}

const INTERACTIVE = 'a, button, input, textarea, select, label, summary, dialog, [role="button"], [contenteditable]'
const TEXTUAL = 'p, h1, h2, h3, h4, h5, h6, li, dt, dd, code, strong, em, small, figcaption, span'

/** Liga a buzina: segurar o botão esquerdo numa área livre (fora de botões, links, campos e texto) buzina até soltar. */
export function startHorn(): () => void {
  const onDown = (e: MouseEvent) => {
    if (e.button !== 0 || e.defaultPrevented) return
    const target = e.target as Element | null
    if (!target) return
    if (target.closest(INTERACTIVE) || target.closest(TEXTUAL)) return
    const selection = window.getSelection?.()
    if (selection && selection.type === 'Range' && !selection.isCollapsed) return
    startHonk()
  }
  // Destrava o áudio em qualquer clique (fase de captura, antes do mousedown acima).
  document.addEventListener('pointerdown', unlockAudio, true)
  document.addEventListener('mousedown', onDown)
  window.addEventListener('mouseup', stopHonk)
  window.addEventListener('blur', stopHonk)
  return () => {
    document.removeEventListener('pointerdown', unlockAudio, true)
    document.removeEventListener('mousedown', onDown)
    window.removeEventListener('mouseup', stopHonk)
    window.removeEventListener('blur', stopHonk)
    stopHonk()
  }
}
