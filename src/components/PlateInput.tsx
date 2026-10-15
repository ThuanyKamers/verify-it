import { useId } from 'react'

interface Props {
  value: string
  onChange: (value: string) => void
  label: string
  hint?: string
}

/** Campo de placa desenhado como uma placa Mercosul: é o campo de verdade, não uma imagem. */
export function PlateInput({ value, onChange, label, hint }: Props) {
  const id = useId()
  return (
    <div className="plate-field">
      <label htmlFor={id}>{label}</label>
      <div className="plate">
        <span className="plate-band" aria-hidden="true">BRASIL</span>
        <input
          id={id}
          className="plate-input"
          value={value}
          maxLength={7}
          placeholder="ABC1D23"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          aria-describedby={hint ? `${id}-hint` : undefined}
          onChange={(e) => onChange(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())}
        />
      </div>
      {hint && <small id={`${id}-hint`}>{hint}</small>}
    </div>
  )
}
