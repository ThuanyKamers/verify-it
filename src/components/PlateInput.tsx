import { useId } from 'react'
import { useI18n } from '../i18n'
import { PLATE_COUNTRIES, PLATES, type PlateCountry } from '../lib/validation'

interface Props {
  value: string
  onChange: (value: string) => void
  country: PlateCountry
  onCountryChange: (country: PlateCountry) => void
  label: string
  hint?: string
  invalid?: boolean
}

/** Letra do país na faixa azul da UE. */
const EU_CODE: Partial<Record<PlateCountry, string>> = { DE: 'D', PT: 'P', FR: 'F' }

function EuBand({ code }: { code: string }) {
  return (
    <span className="plate-band" aria-hidden="true">
      <svg viewBox="0 0 24 24"><circle cx="12.00" cy="5.00" r="1.15" /><circle cx="15.50" cy="5.94" r="1.15" /><circle cx="18.06" cy="8.50" r="1.15" /><circle cx="19.00" cy="12.00" r="1.15" /><circle cx="18.06" cy="15.50" r="1.15" /><circle cx="15.50" cy="18.06" r="1.15" /><circle cx="12.00" cy="19.00" r="1.15" /><circle cx="8.50" cy="18.06" r="1.15" /><circle cx="5.94" cy="15.50" r="1.15" /><circle cx="5.00" cy="12.00" r="1.15" /><circle cx="5.94" cy="8.50" r="1.15" /><circle cx="8.50" cy="5.94" r="1.15" /></svg>
      {code}
    </span>
  )
}

/** Faixa do Mercosul: "BRASIL" sobre azul, com a bandeira à direita. */
function MercosulBand() {
  return (
    <span className="plate-mercosul" aria-hidden="true">
      <span>BRASIL</span>
      <svg viewBox="0 0 20 14"><rect width="20" height="14" fill="#009c3b" /><path d="M10 2 18 7 10 12 2 7z" fill="#ffdf00" /><circle cx="10" cy="7" r="3" fill="#002776" /></svg>
    </span>
  )
}

/**
 * Campo de placa desenhado como a placa do país escolhido (Alemanha, Portugal, França ou Brasil).
 * É o campo de verdade, não uma imagem; o seletor ao lado troca o país e o formato aceito.
 */
export function PlateInput({ value, onChange, country, onCountryChange, label, hint, invalid }: Props) {
  const id = useId()
  const { t, locale } = useI18n()
  const names = new Intl.DisplayNames([locale], { type: 'region' })
  const euCode = EU_CODE[country]

  const input = (
    <input
      id={id}
      className="plate-input"
      value={value}
      maxLength={country === 'DE' ? 11 : 9}
      placeholder={PLATES[country].example}
      autoCapitalize="characters"
      autoComplete="off"
      spellCheck={false}
      aria-invalid={invalid || undefined}
      aria-describedby={hint ? `${id}-hint` : undefined}
      onChange={(e) => onChange(e.target.value.replace(/[^a-zA-ZÄÖÜäöü0-9\s-]/g, '').toUpperCase())}
    />
  )

  return (
    <div className="plate-field">
      <div className="plate-head">
        <label htmlFor={id}>{label}</label>
        <label className="plate-country">
          <span className="visually-hidden">{t('plate.country')}</span>
          <select value={country} onChange={(e) => onCountryChange(e.target.value as PlateCountry)} title={t('plate.country')}>
            {PLATE_COUNTRIES.map((c) => <option key={c} value={c}>{names.of(c)}</option>)}
          </select>
        </label>
      </div>
      <div className={`plate plate-${country.toLowerCase()}${invalid ? ' plate-invalid' : ''}`} data-country={country}>
        {country === 'BR' && <MercosulBand />}
        <div className="plate-row">
          {euCode && <EuBand code={euCode} />}
          {input}
          {country === 'FR' && <span className="plate-region" aria-hidden="true">75</span>}
        </div>
      </div>
      {hint && <small id={`${id}-hint`}>{hint}</small>}
    </div>
  )
}
