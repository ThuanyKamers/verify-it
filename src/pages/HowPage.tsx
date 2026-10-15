import { useI18n, type MessageKey } from '../i18n'

const STEPS = ['seller', 'check', 'buyer'] as const

export function HowPage() {
  const { t, locale } = useI18n()
  const money = new Intl.NumberFormat(locale, { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 }).format(2.7e9)
  const victims = new Intl.NumberFormat(locale).format(91000)

  return (
    <section className="page">
      <h1>{t('how.title')}</h1>

      <ol className="steps">
        {STEPS.map((step) => (
          <li key={step}>
            <h2>{t(`how.${step}.title` as MessageKey).replace(/^\d+\.\s*/, '')}</h2>
            <p>{t(`how.${step}.body` as MessageKey)}</p>
          </li>
        ))}
      </ol>

      <h2 className="section-title">{t('how.stats.title')}</h2>
      <dl className="figures">
        <div><dt>{t('how.stats.loss')}</dt><dd>{money}</dd></div>
        <div><dt>{t('how.stats.victims')}</dt><dd>{victims}</dd></div>
        <div><dt>{t('how.stats.attempts')}</dt><dd>80%</dd></div>
        <div><dt>{t('how.stats.would')}</dt><dd>100%</dd></div>
      </dl>
      <p className="muted small">{t('how.stats.source')}</p>
    </section>
  )
}
