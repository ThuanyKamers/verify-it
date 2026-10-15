import type { ReactNode } from 'react'

/** Lista de dados com linha pontilhada entre o nome e o valor, como num documento. */
export function Leaders({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="leaders">
      {rows.map((row) => (
        <div key={row.label}>
          <dt>{row.label}</dt>
          <span className="fill" aria-hidden="true" />
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}
