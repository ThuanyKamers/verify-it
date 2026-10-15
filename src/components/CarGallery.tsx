import { useState } from 'react'
import { useI18n } from '../i18n'
import { CarArt, type CarView } from './CarArt'

const VIEWS: CarView[] = ['side', 'front', 'rear', 'cabin']

/** Galeria de ilustrações de carro com setas e miniaturas; as classes `mp-*` vêm de marketplace.css. */
export function CarGallery({ label, body, sky }: { label: string; body: string; sky: number }) {
  const { t } = useI18n()
  const [index, setIndex] = useState(0)
  const go = (step: number) => setIndex((i) => (i + step + VIEWS.length) % VIEWS.length)
  const photo = (n: number) => t('mp.photo', { n, total: VIEWS.length })

  return (
    <section className="mp-gallery" aria-label={label}>
      <div className="mp-stage">
        <CarArt view={VIEWS[index]} body={body} sky={sky} />
        <button type="button" className="mp-arrow mp-prev" onClick={() => go(-1)} aria-label={t('mp.prev')}>‹</button>
        <button type="button" className="mp-arrow mp-next" onClick={() => go(1)} aria-label={t('mp.next')}>›</button>
        <span className="mp-counter">{photo(index + 1)}</span>
      </div>
      <div className="mp-thumbs">
        {VIEWS.map((v, i) => (
          <button key={v} type="button" className={i === index ? 'on' : ''} onClick={() => setIndex(i)} aria-label={photo(i + 1)} aria-current={i === index}>
            <CarArt view={v} body={body} sky={sky} />
          </button>
        ))}
      </div>
      <p className="mp-note">{t('mp.photoNote')}</p>
    </section>
  )
}
