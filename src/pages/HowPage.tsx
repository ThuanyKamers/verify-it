import { useI18n, type MessageKey } from '../i18n'

const STEPS = ['seller', 'check', 'buyer'] as const

export function HowPage() {
  const { t, locale } = useI18n()
  const money = new Intl.NumberFormat(locale, { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 }).format(2.7e9)
  const victims = new Intl.NumberFormat(locale).format(91000)

  return (
    <section>
      <h1>{t('how.title')}</h1>
      <ol className="steps">
        {STEPS.map((step) => (
          <li key={step} className="card">
            <h2>{t(`how.${step}.title` as MessageKey)}</h2>
            <p>{t(`how.${step}.body` as MessageKey)}</p>
          </li>
        ))}
      </ol>

      <div className="card note-card">
        <h2>{t('how.noSeal.title')}</h2>
        <p>{t('how.noSeal.body')}</p>
      </div>

      <h2>{t('how.stats.title')}</h2>
      <div className="stats">
        <div className="stat"><strong>{money}</strong><span>{t('how.stats.loss')}</span></div>
        <div className="stat"><strong>{victims}</strong><span>{t('how.stats.victims')}</span></div>
        <div className="stat"><strong>80%</strong><span>{t('how.stats.attempts')}</span></div>
        <div className="stat"><strong>100%</strong><span>{t('how.stats.would')}</span></div>
      </div>
      <p className="source">{t('how.stats.source')}</p>
    </section>
  )
}
