import { useI18n, type MessageKey } from '../i18n'

const STEPS = ['seller', 'check', 'buyer'] as const

// Estudos publicados mais recentes sobre golpes na compra e venda de veículos.
// Não há API pública em tempo real; quando sair uma edição nova, atualize aqui.
const SOURCES = {
  olx2023: { label: 'OLX, 2023', url: 'https://www.autoo.com.br/mais-de-90-mil-golpes-em-compra-e-venda-de-carros-foram-aplicados-em-2023/' },
  olx2023kinds: { label: 'OLX, 2023', url: 'https://olhardigital.com.br/2024/05/24/carros-e-tecnologia/golpes-envolvendo-carros-tiraram-quase-r-3-bilhoes-de-brasileiros-em-2023/' },
  olx2024: { label: 'OLX e Fenauto, 2024', url: 'https://mecanicaonline.com.br/2024/12/golpes-em-revendas-online-de-veiculos-geram-prejuizo-de-r-25-bilhoes-em-2024' },
  lloyds: { label: 'Lloyds Bank, 2023', url: 'https://www.itv.com/news/2023-09-25/vehicle-scam-reports-surged-by-74-in-the-first-half-of-2023-says-lloyds-bank' },
}

/** Tipo de veículo nos golpes registrados no Brasil em 2023 (OLX). */
const KINDS: [MessageKey, number][] = [['how.kind.car', 64], ['how.kind.moto', 31], ['how.kind.truck', 5]]

/** Pesquisa da equipe no Startup Weekend: 15 pessoas, uma resposta cada. */
const SURVEY_TOTAL = 15
const SURVEY_ATTEMPT = 12
const SURVEY_SCAM = 3
const SURVEY_WOULD = 15
const FEATURES: [MessageKey, number][] = [
  ['how.survey.feat.fraud', 5],
  ['how.survey.feat.ratings', 3],
  ['how.survey.feat.docs', 3],
  ['how.survey.feat.compare', 1],
  ['how.survey.feat.origin', 1],
  ['how.survey.feat.history', 1],
  ['how.survey.feat.unsure', 1],
]

type Source = (typeof SOURCES)[keyof typeof SOURCES]

function SourceLink({ source }: { source: Source }) {
  const { t } = useI18n()
  return (
    <span className="source">
      {t('how.source')}: <a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a>
    </span>
  )
}

/** Barras horizontais de uma série só; o valor fica escrito ao lado de cada barra. */
function Bars({ rows, max, format, describe }: { rows: [string, number][]; max: number; format: (v: number) => string; describe: (v: number) => string }) {
  return (
    <ul className="bars">
      {rows.map(([label, value]) => (
        <li key={label} tabIndex={0} data-tip={describe(value)}>
          <span className="bar-label">{label}</span>
          <span className="bar-track" aria-hidden="true"><span className="bar" style={{ width: `${(value / max) * 100}%` }} /></span>
          <span className="bar-value">{format(value)}</span>
          <span className="visually-hidden">: {describe(value)}</span>
        </li>
      ))}
    </ul>
  )
}

export function HowPage() {
  const { t, locale } = useI18n()
  const brl = (v: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 }).format(v)
  const compact = new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 0 }).format(91000)
  const pct = (v: number) => new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 }).format(v)
  const ofTotal = (count: number) => t('how.survey.of', { count, total: SURVEY_TOTAL, pct: pct(count / SURVEY_TOTAL) })

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
        <div><dt>{t('how.stats.loss2023', { count: compact })} <SourceLink source={SOURCES.olx2023} /></dt><dd>{brl(2.7e9)}</dd></div>
        <div><dt>{t('how.stats.loss2024')} <SourceLink source={SOURCES.olx2024} /></dt><dd>{brl(2.5e9)}</dd></div>
        <div><dt>{t('how.stats.uk')} <SourceLink source={SOURCES.lloyds} /></dt><dd>+74%</dd></div>
      </dl>

      <figure className="chart">
        <figcaption><h3>{t('how.kind.title')}</h3></figcaption>
        <Bars rows={KINDS.map(([k, v]) => [t(k), v])} max={100} format={(v) => pct(v / 100)} describe={(v) => pct(v / 100)} />
        <p className="chart-note">{t('how.kind.note')} <SourceLink source={SOURCES.olx2023kinds} /></p>
      </figure>
      <p className="muted small live-note">{t('how.stats.live')}</p>

      <h2 className="section-title">{t('how.survey.title')}</h2>
      <p className="muted">{t('how.survey.lead', { n: SURVEY_TOTAL })}</p>

      <div className="survey">
        <figure className="chart">
          <figcaption><h3>{t('how.survey.exp.title')}</h3></figcaption>
          <div className="stack" aria-hidden="true">
            <span className="seg seg-1" style={{ flexGrow: SURVEY_ATTEMPT }} data-tip={ofTotal(SURVEY_ATTEMPT)}>{pct(SURVEY_ATTEMPT / SURVEY_TOTAL)}</span>
            <span className="seg seg-2" style={{ flexGrow: SURVEY_SCAM }} data-tip={ofTotal(SURVEY_SCAM)}>{pct(SURVEY_SCAM / SURVEY_TOTAL)}</span>
          </div>
          <ul className="legend">
            <li><span className="key seg-1" aria-hidden="true" />{t('how.survey.attempt')}: {ofTotal(SURVEY_ATTEMPT)}</li>
            <li><span className="key seg-2" aria-hidden="true" />{t('how.survey.scam')}: {ofTotal(SURVEY_SCAM)}</li>
          </ul>
        </figure>

        <dl className="figures survey-tile">
          <div><dt>{t('how.survey.would')} <span className="source">{ofTotal(SURVEY_WOULD)}</span></dt><dd>{pct(SURVEY_WOULD / SURVEY_TOTAL)}</dd></div>
        </dl>
      </div>

      <figure className="chart">
        <figcaption><h3>{t('how.survey.feat.title')}</h3></figcaption>
        <Bars rows={FEATURES.map(([k, v]) => [t(k), v])} max={SURVEY_TOTAL} format={(v) => pct(v / SURVEY_TOTAL)} describe={ofTotal} />
        <p className="chart-note">{t('how.survey.note')}</p>
      </figure>
    </section>
  )
}
