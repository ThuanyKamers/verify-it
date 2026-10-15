import { useState, type FormEvent } from 'react'
import { Leaders } from '../components/Leaders'
import { PlateInput } from '../components/PlateInput'
import { displaySite, listingHref, siteTheme } from '../lib/mockListing'
import { useI18n, type MessageKey } from '../i18n'
import { DEMO_URLS } from '../lib/seed'
import type { useAppState } from '../lib/store'
import { parseListingUrl } from '../lib/url'
import { maskPlate, type PlateCountry } from '../lib/validation'
import { addReport, appendLog, check, type CheckResult, type Listing } from '../lib/verify'

type Props = ReturnType<typeof useAppState>

export function CheckPage({ state, update }: Props) {
  const { t, locale } = useI18n()
  const [url, setUrl] = useState('')
  const [plate, setPlate] = useState('')
  const [plateCountry, setPlateCountry] = useState<PlateCountry>('DE')
  const [result, setResult] = useState<CheckResult | null>(null)
  const [reported, setReported] = useState(false)
  // Muda a cada consulta para que o carimbo "bata" de novo, mesmo com o mesmo resultado.
  const [run, setRun] = useState(0)
  // Posição do próximo exemplo de anúncio verificado: cada clique mostra outro veículo, em outro site.
  const [nextVerified, setNextVerified] = useState(0)
  // Idem para o exemplo de anúncio clonado: cada clique traz outro veículo e outra lista de links cadastrados.
  const [nextCloned, setNextCloned] = useState(0)
  // Exemplo de anúncio não verificado: cada clique usa um link novo (nunca denunciado) de um veículo que não está cadastrado.
  const [nextUnknown, setNextUnknown] = useState(0)
  // Semente por sessão para os links de exemplo "não verificados" não repetirem entre visitas (evita cair num link já denunciado).
  const [unknownSalt] = useState(() => Math.floor(Math.random() * 1_000_000))

  function runCheck(nextUrl: string, nextPlate: string, country: PlateCountry = plateCountry) {
    const res = check(state, { url: nextUrl, plate: nextPlate, plateCountry: country })
    setResult(res)
    setReported(false)
    setRun((n) => n + 1)
    if (res.status !== 'invalid') {
      update((s) => appendLog(s, { type: 'check', site: res.listing?.site ?? siteOf(nextUrl), result: res.status }))
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    runCheck(url, plate)
  }

  function tryExample(exampleUrl: string, examplePlate = '') {
    setUrl(exampleUrl)
    setPlate(examplePlate)
    setPlateCountry('DE')
    runCheck(exampleUrl, examplePlate, 'DE')
  }

  /**
   * Anúncios ativos em ordem embaralhada; a cada três cliques, um é do marketplace do Verify It.
   * O próximo nunca repete o veículo nem o site do anterior.
   */
  function tryVerified() {
    const active = state.listings.filter((l) => l.status === 'active').sort((a, b) => shuffleKey(a.checkId) - shuffleKey(b.checkId))
    if (active.length === 0) return tryExample(DEMO_URLS.verified)
    const market = active.filter((l) => siteTheme(l.site) === 'verifyit')
    const others = active.filter((l) => siteTheme(l.site) !== 'verifyit')
    const fromMarket = market.length > 0 && (nextVerified % 3 === 2 || others.length === 0)
    const pool = fromMarket ? market : others
    const last = result?.status === 'verified' ? result.listing : undefined
    let i = (fromMarket ? Math.floor(nextVerified / 3) : nextVerified) % pool.length
    for (let tries = 0; tries < pool.length; tries++) {
      const l = pool[i]
      if (!last || (l.plate !== last.plate && l.site !== last.site)) break
      i = (i + 1) % pool.length
    }
    setNextVerified((n) => n + 1)
    tryExample(pool[i].url)
  }

  /**
   * Golpe do anúncio clonado: a cada clique, outro veículo e, com ele, outra lista de links cadastrados.
   * Monta um link "clonado" (não cadastrado) num site onde o veículo tem anúncio verificado, para cair em "possível golpe".
   */
  function tryCloned() {
    const external = state.listings.filter((l) => l.status === 'active' && siteTheme(l.site) !== 'verifyit')
    const byPlate = new Map<string, Listing>()
    for (const l of external.sort((a, b) => shuffleKey(a.checkId) - shuffleKey(b.checkId))) {
      if (!byPlate.has(l.plate)) byPlate.set(l.plate, l)
    }
    const pool = [...byPlate.values()]
    if (pool.length === 0) return tryExample(DEMO_URLS.cloned, DEMO_URLS.clonedPlate)
    const lastPlate = result?.status === 'scam' ? result.related[0]?.plate : undefined
    let i = nextCloned % pool.length
    for (let tries = 0; tries < pool.length; tries++) {
      if (pool[i].plate !== lastPlate) break
      i = (i + 1) % pool.length
    }
    setNextCloned((n) => n + 1)
    const base = pool[i]
    // O Civic traz o exemplo já denunciado (golpe + denúncias); os demais, um clone recém-forjado.
    const href = base.plate === DEMO_URLS.clonedPlate ? DEMO_URLS.cloned : cloneUrl(base.url, nextCloned + 1)
    tryExample(href, base.plate)
  }

  /** Anúncio não verificado: a cada clique, um link novo (nunca denunciado) de um veículo que não está cadastrado. */
  function tryUnknown() {
    setNextUnknown((n) => n + 1)
    tryExample(strangeUrl(unknownSalt + nextUnknown))
  }

  /** Leva o comprador ao campo da placa para refazer a consulta. */
  function focusPlate() {
    const input = document.querySelector<HTMLInputElement>('.check-form .plate-input')
    input?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    input?.focus({ preventScroll: true })
  }

  function report() {
    update((s) => {
      const next = addReport(s, url)
      return next ? appendLog(next, { type: 'report', site: siteOf(url), result: 'reported' }) : s
    })
    setReported(true)
    setResult((r) => (r ? { ...r, reportCount: r.reportCount + 1 } : r))
  }

  const date = (iso: string) => new Date(iso).toLocaleDateString(locale)
  const risky = result && result.status !== 'verified' && result.status !== 'invalid'
  // Todos os anúncios verificados do veículo, incluindo o que está sendo consultado.
  const official = !result ? [] : result.status === 'verified' && result.listing ? [result.listing, ...result.related] : result.related

  return (
    <section className="page">
      <h1>{t('check.title')}</h1>
      <p className="lead">{t('check.lead')}</p>

      <form className="form check-form" onSubmit={onSubmit}>
        <label className="field">
          {t('check.url')}
          <input type="url" inputMode="url" required value={url} onChange={(e) => setUrl(e.target.value)} placeholder={t('check.urlPlaceholder')} />
        </label>
        <div className="check-row">
          <PlateInput value={plate} onChange={setPlate} country={plateCountry} onCountryChange={setPlateCountry} label={t('check.plate')} />
          <button className="button button-primary" type="submit">{t('check.submit')}</button>
        </div>
        <p className="muted small">{t('check.plateHint')}</p>
      </form>
      <p className="browse-link"><a className="button" href="#/market">{t('check.browse')}</a></p>

      <div className="examples">
        <span>{t('check.examples')}</span>
        <button type="button" className="text-button" onClick={tryVerified}>{t('check.example.verified')}</button>
        <button type="button" className="text-button" onClick={tryCloned}>{t('check.example.cloned')}</button>
        <button type="button" className="text-button" onClick={tryUnknown}>{t('check.example.unknown')}</button>
      </div>

      {result && (
        <article className={`report report-${result.status}`} role="status" aria-live="polite">
          <h2 key={run} className="stamp">{t(`status.${result.status}` as MessageKey)}</h2>
          <p className="report-body">{t(`result.${result.status}.body` as MessageKey)}</p>

          {risky && (
            <ul className="reasons">
              {result.reasons.map((r) => (
                <li key={r}>{t(`reason.${r}` as MessageKey, { n: result.reportCount })}</li>
              ))}
            </ul>
          )}

          {result.status === 'verified' && result.listing && (
            <>
              <Leaders
                rows={[
                  { label: t('result.vehicle'), value: `${result.listing.make} ${result.listing.model} ${result.listing.year}` },
                  { label: t('result.plate'), value: maskPlate(result.listing.plate) },
                  { label: t('result.site'), value: displaySite(result.listing.site) },
                  { label: t('result.verifiedOn'), value: date(result.listing.createdAt) },
                  { label: t('result.checkId'), value: <code>{result.listing.checkId}</code> },
                ]}
              />
              {result.reportCount > 0 && <p className="warning">{t('result.reportsWarning', { n: result.reportCount })}</p>}
            </>
          )}

          {official.length > 0 && (
            <div className="report-part">
              <h3>{t('result.related')}</h3>
              <ul className="plain-list">
                {official.map((l) => (
                  <li key={l.checkId}>
                    <a href={listingHref(l)} target="_blank" rel="noopener noreferrer">{displaySite(l.site)}</a>, {l.make} {l.model} {l.year}
                    {l.checkId === result.listing?.checkId && result.status === 'verified' && <> ({t('result.thisListing')})</>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.status === 'scam' && (
            <>
              <div className="report-part report-steps">
                <h3>{t('result.scam.steps')}</h3>
                <ol>
                  <li>{t('result.scam.step1')}</li>
                  <li>{t('result.scam.step2')}</li>
                  <li>{t(official.length ? 'result.scam.step3' : 'result.scam.step3none')}</li>
                </ol>
              </div>
              {reported ? (
                <p className="confirmation">{t('result.reported')}</p>
              ) : (
                <button type="button" className="button button-danger-solid" onClick={report}>{t('result.report')}</button>
              )}
            </>
          )}

          {result.status === 'unverified' && (
            <>
              <div className="report-part">
                <h3>{t('result.unverified.how')}</h3>
                <ul className="plain-list">
                  <li>{t('result.unverified.how1')}</li>
                  {!plate.trim() && <li>{t('result.unverified.how2')}</li>}
                  <li>{t('result.tips.1')}</li>
                  <li>{t('result.tips.2')}</li>
                </ul>
                {!plate.trim() && (
                  <button type="button" className="button" onClick={focusPlate}>{t('result.unverified.withPlate')}</button>
                )}
              </div>
              {reported ? (
                <p className="confirmation">{t('result.reported')}</p>
              ) : (
                <p className="report-quiet">
                  {t('result.unverified.suspicious')}{' '}
                  <button type="button" className="text-button" onClick={report}>{t('result.report')}</button>
                </p>
              )}
            </>
          )}
        </article>
      )}
    </section>
  )
}

/** Ordem fixa, mas sem relação com a ordem de cadastro, para os exemplos variarem de site e de veículo. */
function shuffleKey(id: string): number {
  return [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 1009, 7)
}

/** Gerador pseudoaleatório simples e determinístico a partir de uma semente. */
function rngFrom(seed: number): () => number {
  let s = (seed * 2654435761) >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

const ALNUM = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

/**
 * Forja um link "clonado" a partir de um anúncio real: mesmo site, mas com o identificador final trocado,
 * para gerar um link que não está cadastrado (impressão de que o golpista republicou o mesmo carro).
 */
function cloneUrl(url: string, seed: number): string {
  const u = new URL(url)
  const rnd = rngFrom(seed)
  const parts = u.pathname.split('/')
  const i = parts.length - 1
  const ext = parts[i].match(/\.html?$/i)?.[0] ?? ''
  const name = ext ? parts[i].slice(0, -ext.length) : parts[i]
  const dash = name.lastIndexOf('-')
  const head = dash >= 0 ? name.slice(0, dash + 1) : ''
  const token = dash >= 0 ? name.slice(dash + 1) : name
  // Troca cada caractere do identificador preservando a "forma" (dígito, maiúscula, minúscula).
  const fresh = [...token]
    .map((c) => {
      if (/\d/.test(c)) return String(Math.floor(rnd() * 10))
      if (/[A-Z]/.test(c)) return ALNUM[Math.floor(rnd() * ALNUM.length)]
      if (/[a-z]/.test(c)) return ALNUM[Math.floor(rnd() * ALNUM.length)].toLowerCase()
      return c
    })
    .join('')
  parts[i] = `${head}${fresh}${ext}`
  u.pathname = parts.join('/')
  return u.toString()
}

/** Veículos "de fora" (não cadastrados) para o exemplo de anúncio não verificado. */
const STRANGERS: { base: string; id: 'num' | 'alnum'; tail?: string }[] = [
  { base: 'https://www.autoscout24.de/angebote/fiat-500-1-0-hybrid-benzin-weiss-', id: 'num' },
  { base: 'https://www.mobile.de/auto-inserat/opel-corsa-1-2-benzin/', id: 'num', tail: '.html' },
  { base: 'https://www.kleinanzeigen.de/s-anzeige/ford-fiesta-titanium/', id: 'num', tail: '-216-5102' },
  { base: 'https://www.leboncoin.fr/ad/voitures/', id: 'num' },
  { base: 'https://www.olx.pt/d/anuncio/renault-clio-dci-2018-', id: 'alnum', tail: '.html' },
  { base: 'https://www.standvirtual.com/carros/anuncio/peugeot-208-puretech-', id: 'alnum', tail: '.html' },
  { base: 'https://www.autoscout24.de/angebote/nissan-qashqai-dci-schwarz-', id: 'num' },
  { base: 'https://www.mobile.de/auto-inserat/hyundai-i30-kombi/', id: 'num', tail: '.html' },
]

/** Link de exemplo não cadastrado; muda de veículo, de site e de identificador a cada chamada. */
function strangeUrl(seed: number): string {
  const spec = STRANGERS[Math.abs(seed) % STRANGERS.length]
  const rnd = rngFrom(seed)
  const id =
    spec.id === 'num'
      ? String(10_000_000 + Math.floor(rnd() * 89_000_000))
      : 'ID' + Array.from({ length: 6 }, () => ALNUM[Math.floor(rnd() * ALNUM.length)]).join('')
  return `${spec.base}${id}${spec.tail ?? ''}`
}

function siteOf(url: string): string {
  return parseListingUrl(url)?.site ?? '-'
}
