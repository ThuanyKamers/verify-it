// Buzina de carro sintetizada ao clicar/segurar numa área livre da página.
// Som gerado pela Web Audio API, sem arquivo de áudio.

let ctx: AudioContext | null = null

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

interface Voice {
  release: (at?: number) => void
}

// Duração mínima de uma buzinada: um toque rápido ainda soa por tempo suficiente.
const MIN_SUSTAIN = 0.16
const LEVEL = 0.2
const MAX_VOICES = 3
const voices: Voice[] = []

/** Toca uma buzina (dois tons) que segura no volume até release(). Devolve a voz, ou null se não houver áudio. */
function spawnVoice(): Voice | null {
  const audio = getContext()
  if (!audio) return null
  try {
    if (audio.state === 'suspended') void audio.resume()
    const start = audio.currentTime

    const drive = audio.createGain()
    drive.gain.setValueAtTime(0.0001, start)
    drive.gain.exponentialRampToValueAtTime(LEVEL, start + 0.01)

    const shaper = audio.createWaveShaper()
    shaper.curve = brassCurve(2.2)

    const lowpass = audio.createBiquadFilter()
    lowpass.type = 'lowpass'
    lowpass.frequency.value = 3800
    lowpass.Q.value = 0.6

    const out = audio.createGain()
    out.gain.value = 0.33

    drive.connect(shaper)
    shaper.connect(lowpass)
    lowpass.connect(out)
    out.connect(audio.destination)

    const oscs: OscillatorNode[] = []
    for (const base of [440, 554.37]) {
      for (const detune of [-5, 5]) {
        const osc = audio.createOscillator()
        osc.type = 'sawtooth'
        osc.frequency.value = base
        osc.detune.value = detune
        osc.connect(drive)
        osc.start(start)
        oscs.push(osc)
      }
    }

    let released = false
    const voice: Voice = {
      release: (at = audio.currentTime) => {
        if (released) return
        released = true
        // Garante a duração mínima mesmo quando o botão é solto num toque rápido.
        const t = Math.max(at, start + MIN_SUSTAIN)
        drive.gain.cancelScheduledValues(t)
        drive.gain.setValueAtTime(LEVEL, t)
        drive.gain.exponentialRampToValueAtTime(0.0001, t + 0.05)
        for (const osc of oscs) osc.stop(t + 0.07)
        const i = voices.indexOf(voice)
        if (i >= 0) voices.splice(i, 1)
      },
    }
    voices.push(voice)
    // Limita vozes simultâneas: cliques muito rápidos soltam a mais antiga.
    while (voices.length > MAX_VOICES) voices[0].release()
    return voice
  } catch {
    return null
  }
}

const INTERACTIVE = 'a, button, input, textarea, select, label, summary, dialog, [role="button"], [contenteditable]'
const TEXTUAL = 'p, h1, h2, h3, h4, h5, h6, li, dt, dd, code, strong, em, small, figcaption, span'

/** Liga a buzina: clicar numa área livre dá uma buzinada; segurar buzina até soltar. */
export function startHorn(): () => void {
  // A voz do clique atual (enquanto o botão está pressionado).
  let held: Voice | null = null

  const onDown = (e: MouseEvent) => {
    if (e.button !== 0 || e.defaultPrevented) return
    const target = e.target as Element | null
    if (!target) return
    if (target.closest(INTERACTIVE) || target.closest(TEXTUAL)) return
    const selection = window.getSelection?.()
    if (selection && selection.type === 'Range' && !selection.isCollapsed) return
    held = spawnVoice()
  }
  const onUp = () => {
    held?.release()
    held = null
  }
  const onBlur = () => {
    held = null
    for (const voice of [...voices]) voice.release()
  }

  // Destrava o áudio em qualquer clique (fase de captura, antes do mousedown acima).
  document.addEventListener('pointerdown', unlockAudio, true)
  document.addEventListener('mousedown', onDown)
  window.addEventListener('mouseup', onUp)
  window.addEventListener('blur', onBlur)
  return () => {
    document.removeEventListener('pointerdown', unlockAudio, true)
    document.removeEventListener('mousedown', onDown)
    window.removeEventListener('mouseup', onUp)
    window.removeEventListener('blur', onBlur)
    onBlur()
  }
}
