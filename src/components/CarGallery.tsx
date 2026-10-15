import { useState } from 'react'
import { useI18n } from '../i18n'
import type { VehiclePhoto } from '../lib/photos'
import { CarArt, type CarView } from './CarArt'
import { PhotoCredit, VehicleImage } from './VehicleImage'

const VIEWS: CarView[] = ['side', 'front', 'rear', 'cabin']

/**
 * Galeria do anúncio; as classes `mp-*` vêm de marketplace.css.
 * Com foto real mostra a foto e o crédito; sem foto, as quatro ilustrações com setas e miniaturas.
 */
export function CarGallery({ label, body, sky, photo }: { label: string; body: string; sky: number; photo?: VehiclePhoto }) {
  const { t } = useI18n()
  const [index, setIndex] = useState(0)

  if (photo) {
    return (
      <section className="mp-gallery" aria-label={label}>
        <div className="mp-stage">
          <VehicleImage photo={photo} alt={label} body={body} sky={sky} />
        </div>
        <PhotoCredit photo={photo} className="mp-note" />
      </section>
    )
  }

  const go = (step: number) => setIndex((i) => (i + step + VIEWS.length) % VIEWS.length)
  const photoLabel = (n: number) => t('mp.photo', { n, total: VIEWS.length })

  return (
    <section className="mp-gallery" aria-label={label}>
      <div className="mp-stage">
        <CarArt view={VIEWS[index]} body={body} sky={sky} />
        <button type="button" className="mp-arrow mp-prev" onClick={() => go(-1)} aria-label={t('mp.prev')}>‹</button>
        <button type="button" className="mp-arrow mp-next" onClick={() => go(1)} aria-label={t('mp.next')}>›</button>
        <span className="mp-counter">{photoLabel(index + 1)}</span>
      </div>
      <div className="mp-thumbs">
        {VIEWS.map((v, i) => (
          <button key={v} type="button" className={i === index ? 'on' : ''} onClick={() => setIndex(i)} aria-label={photoLabel(i + 1)} aria-current={i === index}>
            <CarArt view={v} body={body} sky={sky} />
          </button>
        ))}
      </div>
      <p className="mp-note">{t('mp.photoNote')}</p>
    </section>
  )
}
