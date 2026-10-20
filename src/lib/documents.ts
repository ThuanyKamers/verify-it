// Taxonomia dos documentos do Verify It, compartilhada entre a conta (auth) e o
// anúncio (verify), para não acoplar os dois módulos.
//
// Dois grupos:
//  - do VENDEDOR (identidade): enviados no cadastro da CONTA, uma vez.
//  - do VEÍCULO: enviados a cada anúncio no marketplace.

/** Documentos pessoais do vendedor, enviados no cadastro da conta. */
export const SELLER_DOCUMENTS = ['idFront', 'idBack', 'selfie'] as const
/** Documentos do veículo, enviados a cada anúncio. */
export const VEHICLE_DOCUMENTS = ['registration', 'title', 'inspection'] as const
/** Todos os tipos de documento (vendedor + veículo). */
export const DOCUMENTS = [...SELLER_DOCUMENTS, ...VEHICLE_DOCUMENTS] as const
export type DocumentKind = (typeof DOCUMENTS)[number]

/** O laudo de inspeção (TÜV/HU) é opcional; os demais são obrigatórios. */
export const OPTIONAL_DOCUMENTS: readonly DocumentKind[] = ['inspection']

/** Nome do arquivo enviado para cada documento (no protótipo, só o nome). */
export type DocumentFiles = Partial<Record<DocumentKind, string>>

/** Documentos obrigatórios que ainda faltam, dentre os `kinds` pedidos. */
export function missingDocuments(
  files: DocumentFiles,
  kinds: readonly DocumentKind[] = DOCUMENTS,
): DocumentKind[] {
  return kinds.filter((d) => !OPTIONAL_DOCUMENTS.includes(d) && !files[d]?.trim())
}

/** Mantém só os documentos pedidos que têm arquivo (descarta vazios e extras). */
export function pickDocuments(files: DocumentFiles, kinds: readonly DocumentKind[]): DocumentFiles {
  return Object.fromEntries(kinds.flatMap((k) => (files[k]?.trim() ? [[k, files[k] as string]] : []))) as DocumentFiles
}
