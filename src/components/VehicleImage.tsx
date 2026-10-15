import { useI18n } from '../i18n'
import type { VehiclePhoto } from '../lib/photos'
import { photoSrc } from '../lib/photos'
import { CarArt, type CarView } from './CarArt'

interface Props {
  photo?: VehiclePhoto
  alt: string
  view?: CarView
  body: string
  sky: number
}

/** Foto real do veículo quando houver; senão, a ilustração desenhada. */
export function VehicleImage({ photo, alt, view = 'side', body, sky }: Props) {
  if (!photo) return <CarArt view={view} body={body} sky={sky} />
  return <img className="vehicle-photo" src={photoSrc(photo)} alt={alt} loading="lazy" decoding="async" />
}

/** Crédito curto exigido pela licença, mostrado junto da foto. */
export function PhotoCredit({ photo, className }: { photo: VehiclePhoto; className?: string }) {
  const { t } = useI18n()
  return (
    <p className={className}>
      {t('photo.by')} <a href={photo.sourceUrl} target="_blank" rel="noopener noreferrer">{photo.author}</a>
      {' · '}
      <a href={photo.licenseUrl} target="_blank" rel="noopener noreferrer license">{photo.license}</a>
      {' · '}Wikimedia Commons
    </p>
  )
}
