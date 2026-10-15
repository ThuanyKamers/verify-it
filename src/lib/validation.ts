// Validações de formato dos documentos do veículo.
// No protótipo a verificação de propriedade é simulada: conferimos apenas
// se os dados são bem formados. A consulta real (DETRAN/SENATRAN) fica para depois.

/** Remove espaços, hífens e pontos e deixa em maiúsculas. */
export function clean(value: string): string {
  return value.replace(/[\s.-]/g, '').toUpperCase()
}

/** Placa antiga (ABC1234) ou Mercosul (ABC1D23). */
export function isValidPlate(value: string): boolean {
  return /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(clean(value))
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

/** Mostra só parte da placa para o comprador (ex.: ABC-1**3). */
export function maskPlate(plate: string): string {
  const p = clean(plate)
  return `${p.slice(0, 3)}-${p[3]}**${p[6]}`
}
