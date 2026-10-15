// Validações de formato dos documentos do veículo.
// No protótipo a verificação de propriedade é simulada: conferimos apenas
// se os dados são bem formados. A consulta real (DETRAN/SENATRAN, KBA) fica para depois.

/** Remove espaços, hífens e pontos e deixa em maiúsculas. */
export function clean(value: string): string {
  return value.replace(/[\s.-]/g, '').toUpperCase()
}

const DE_PATTERN = /^([A-ZÄÖÜ]{1,3})[\s-]*([A-Z]{1,2})[\s-]*([1-9][0-9]{0,3})([EH]?)$/

/** Países de placa aceitos: os dos sites de anúncio que o protótipo cobre. */
export const PLATE_COUNTRIES = ['DE', 'PT', 'FR', 'BR'] as const
export type PlateCountry = (typeof PLATE_COUNTRIES)[number]

interface PlateSpec {
  /** Exemplo no formato canônico, usado como placeholder e na mensagem de erro. */
  example: string
  /** Formato canônico da placa, ou null se não for deste país. */
  normalize(value: string): string | null
}

/** Portugal: três pares, cada um só de letras ou só de números (AA-00-AA, 00-AA-00...). */
function normalizePt(value: string): string | null {
  const m = /^([A-Z0-9]{2})[\s-]*([A-Z0-9]{2})[\s-]*([A-Z0-9]{2})$/.exec(value)
  if (!m) return null
  const kinds = m.slice(1).map((g) => (/^[A-Z]{2}$/.test(g) ? 'L' : /^\d{2}$/.test(g) ? 'D' : 'X')).join('')
  return ['LDD', 'DLD', 'DDL', 'LDL'].includes(kinds) ? m.slice(1).join('-') : null
}

export const PLATES: Record<PlateCountry, PlateSpec> = {
  DE: {
    example: 'B AB 1234',
    normalize(v) {
      const m = DE_PATTERN.exec(v)
      return m ? `${m[1]} ${m[2]} ${m[3]}${m[4]}` : null
    },
  },
  PT: { example: 'AA-00-AA', normalize: normalizePt },
  FR: {
    example: 'AB-123-CD',
    normalize(v) {
      const m = /^([A-Z]{2})[\s-]*(\d{3})[\s-]*([A-Z]{2})$/.exec(v)
      return m ? `${m[1]}-${m[2]}-${m[3]}` : null
    },
  },
  // Mercosul (ABC1D23) e o modelo antigo (ABC-1234), escritos sem hífen.
  BR: {
    example: 'ABC1D23',
    normalize(v) {
      const m = /^([A-Z]{3})[\s-]*(\d[A-Z0-9]\d{2})$/.exec(v)
      return m ? `${m[1]}${m[2]}` : null
    },
  },
}

/**
 * Placa no formato canônico do país (ex.: "B AB 1234" na Alemanha), ou null se for inválida.
 * Sem país, aceita o formato de qualquer país da lista.
 */
export function normalizePlate(value: string, country?: PlateCountry): string | null {
  const v = value.trim().toUpperCase()
  const countries = country ? [country] : PLATE_COUNTRIES
  for (const c of countries) {
    const plate = PLATES[c].normalize(v)
    if (plate) return plate
  }
  return null
}

export function isValidPlate(value: string, country?: PlateCountry): boolean {
  return normalizePlate(value, country) !== null
}

/** Chassi (VIN): 17 caracteres, sem I, O ou Q. */
export function isValidVin(value: string): boolean {
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(clean(value))
}

/** Calcula o dígito verificador do RENAVAM a partir dos 10 primeiros dígitos. */
export function renavamCheckDigit(base: string): number {
  const weights = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const sum = base.split('').reduce((acc, d, i) => acc + Number(d) * weights[i], 0)
  const digit = (sum * 10) % 11
  return digit === 10 ? 0 : digit
}

/** RENAVAM: 11 dígitos com dígito verificador válido. Aceita o formato antigo de 9 dígitos. */
export function isValidRenavam(value: string): boolean {
  let digits = value.replace(/\D/g, '')
  if (digits.length === 9) digits = digits.padStart(11, '0')
  if (!/^\d{11}$/.test(digits) || /^(\d)\1{10}$/.test(digits)) return false
  return renavamCheckDigit(digits.slice(0, 10)) === Number(digits[10])
}

export function normalizeRenavam(value: string): string {
  const digits = value.replace(/\D/g, '')
  return digits.length === 9 ? digits.padStart(11, '0') : digits
}

/** Mostra só parte da placa para o comprador (ex.: B AB 12**, AB-123-**). */
export function maskPlate(plate: string): string {
  const m = DE_PATTERN.exec(plate.toUpperCase())
  if (m) {
    const digits = m[3].length > 2 ? `${m[3].slice(0, -2)}**` : '**'
    return `${m[1]} ${m[2]} ${digits}${m[4]}`
  }
  if (!normalizePlate(plate)) return plate
  return plate.replace(/[A-Z0-9]{2}$/i, '**')
}
