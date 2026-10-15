// Sessão simulada: guarda apenas o perfil escolhido na tela de login.

export type Role = 'seller' | 'buyer'

const ROLE_KEY = 'verify-it:role'

export function loadRole(): Role | null {
  try {
    const saved = localStorage.getItem(ROLE_KEY)
    return saved === 'seller' || saved === 'buyer' ? saved : null
  } catch {
    return null
  }
}

export function saveRole(role: Role | null) {
  try {
    if (role) localStorage.setItem(ROLE_KEY, role)
    else localStorage.removeItem(ROLE_KEY)
  } catch {
    // sem armazenamento: o login vale só nesta visita
  }
}
