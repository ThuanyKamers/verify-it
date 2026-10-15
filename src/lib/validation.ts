// Validações de formato dos documentos do veículo.
// No protótipo a verificação de propriedade é simulada: conferimos apenas
// se os dados são bem formados. A consulta real (DETRAN/SENATRAN, KBA) fica para depois.

/** Remove espaços, hífens e pontos e deixa em maiúsculas. */
export function clean(value: string): string {
  return value.replace(/[\s.-]/g, '').toUpperCase()
}

const PLATE_PATTERN = /^([A-ZÄÖÜ]{1,3})[\s-]*([A-Z]{1,2})[\s-]*([1-9][0-9]{0,3})([EH]?)$/

/** Placa alemã no formato canônico "B AB 1234" (distrito, letras, números, E/H opcional), ou null se for inválida. */
export function normalizePlate(value: string): string | null {
  const m = PLATE_PATTERN.exec(value.trim().toUpperCase())
  return m ? `${m[1]} ${m[2]} ${m[3]}${m[4]}` : null
}

export function isValidPlate(value: string): boolean {
  return normalizePlate(value) !== null
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

/** Mostra só parte da placa para o comprador (ex.: B AB 12**). */
export function maskPlate(plate: string): string {
  const m = PLATE_PATTERN.exec(plate.toUpperCase())
  if (!m) return plate
  const digits = m[3].length > 2 ? `${m[3].slice(0, -2)}**` : '**'
  return `${m[1]} ${m[2]} ${digits}${m[4]}`
}
