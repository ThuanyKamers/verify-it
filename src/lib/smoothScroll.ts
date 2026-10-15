import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

let lenis: Lenis | null = null

/** Respeita quem pediu menos movimento no sistema. */
function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Liga o scroll suave (Lenis) no documento e o mantém em sincronia com o GSAP. */
export function startSmoothScroll(): () => void {
  if (prefersReducedMotion() || lenis) return () => {}

  const instance = new Lenis({ duration: 1.05, smoothWheel: true })
  lenis = instance

  instance.on('scroll', ScrollTrigger.update)
  const tick = (time: number) => instance.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)

  return () => {
    gsap.ticker.remove(tick)
    instance.destroy()
    if (lenis === instance) lenis = null
  }
}

/** Vai ao topo ao trocar de página, respeitando o scroll suave quando ativo. */
export function scrollToTop(): void {
  if (lenis) lenis.scrollTo(0, { immediate: true })
  else window.scrollTo(0, 0)
}
