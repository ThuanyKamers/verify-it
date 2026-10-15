import { useId } from 'react'

interface Props {
  value: string
  onChange: (value: string) => void
  label: string
  hint?: string
  invalid?: boolean
}

/** Campo de placa desenhado como uma placa europeia (faixa azul da UE e "D"): é o campo de verdade, não uma imagem. */
export function PlateInput({ value, onChange, label, hint, invalid }: Props) {
  const id = useId()
  return (
    <div className="plate-field">
      <label htmlFor={id}>{label}</label>
      <div className={invalid ? 'plate plate-invalid' : 'plate'}>
        <span className="plate-band" aria-hidden="true">
          <svg viewBox="0 0 24 24"><circle cx="12.00" cy="5.00" r="1.15" /><circle cx="15.50" cy="5.94" r="1.15" /><circle cx="18.06" cy="8.50" r="1.15" /><circle cx="19.00" cy="12.00" r="1.15" /><circle cx="18.06" cy="15.50" r="1.15" /><circle cx="15.50" cy="18.06" r="1.15" /><circle cx="12.00" cy="19.00" r="1.15" /><circle cx="8.50" cy="18.06" r="1.15" /><circle cx="5.94" cy="15.50" r="1.15" /><circle cx="5.00" cy="12.00" r="1.15" /><circle cx="5.94" cy="8.50" r="1.15" /><circle cx="8.50" cy="5.94" r="1.15" /></svg>
          D
        </span>
        <input
          id={id}
          className="plate-input"
          value={value}
          maxLength={11}
          placeholder="B AB 1234"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          aria-invalid={invalid || undefined}
          aria-describedby={hint ? `${id}-hint` : undefined}
          onChange={(e) => onChange(e.target.value.replace(/[^a-zA-ZÄÖÜäöü0-9\s-]/g, '').toUpperCase())}
        />
      </div>
      {hint && <small id={`${id}-hint`}>{hint}</small>}
    </div>
  )
}
