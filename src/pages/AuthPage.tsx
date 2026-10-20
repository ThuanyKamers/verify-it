import { useState, type FormEvent } from 'react'
import { useI18n, type Lang } from '../i18n'
import { getAuthProvider, isValidTwoFactorCode, type Account, type AuthErrorCode, type AuthResult, type NotifyChannel } from '../lib/auth'
import { missingDocuments, SELLER_DOCUMENTS, type DocumentFiles, type DocumentKind } from '../lib/documents'
import type { Role } from '../lib/session'

/** Textos da tela de conta, por idioma (recurso autocontido). */
const COPY: Record<Lang, Record<string, string>> = {
  pt: {
    signinTab: 'Entrar',
    signupTab: 'Criar conta',
    name: 'Nome',
    enable2fa: 'Ativar verificação em duas etapas (2FA)',
    submitSignin: 'Entrar',
    submitSignup: 'Criar conta',
    twoFaTitle: 'Verificação em duas etapas',
    twoFaLead: 'Digite o código de 6 dígitos do seu aplicativo autenticador.',
    code: 'Código de 6 dígitos',
    verify: 'Confirmar',
    back: 'Voltar',
    docsTitle: 'Documentos do vendedor',
    docsLead: 'Para anunciar, comprove sua identidade uma vez: identidade (frente e verso) e uma selfie segurando o documento. Ficam guardados na sua conta.',
    docChoose: 'Enviar arquivo',
    docReplace: 'Trocar',
    docPending: 'Pendente',
    notifyTitle: 'Como quer receber o aviso da análise?',
    notifyEmail: 'Por e-mail',
    notifySms: 'Por SMS no celular',
    phone: 'Celular (com DDD)',
    demo: 'Demonstração: a conta fica só no seu navegador; nenhuma senha é guardada e, no 2FA, qualquer código de 6 dígitos funciona.',
    'err.invalidEmail': 'E-mail inválido.',
    'err.weakPassword': 'A senha precisa de pelo menos 8 caracteres.',
    'err.emailInUse': 'Já existe uma conta com esse e-mail.',
    'err.missingDocuments': 'Envie os documentos do vendedor para criar a conta.',
    'err.invalidCredentials': 'E-mail ou senha incorretos.',
    'err.invalidCode': 'Código inválido.',
    'err.generic': 'Não foi possível concluir. Tente de novo.',
  },
  en: {
    signinTab: 'Sign in',
    signupTab: 'Create account',
    name: 'Name',
    enable2fa: 'Enable two-factor authentication (2FA)',
    submitSignin: 'Sign in',
    submitSignup: 'Create account',
    twoFaTitle: 'Two-factor verification',
    twoFaLead: 'Enter the 6-digit code from your authenticator app.',
    code: '6-digit code',
    verify: 'Confirm',
    back: 'Back',
    docsTitle: 'Seller documents',
    docsLead: 'To list a vehicle, prove your identity once: your ID (front and back) and a selfie holding it. They are kept on your account.',
    docChoose: 'Upload file',
    docReplace: 'Replace',
    docPending: 'Missing',
    notifyTitle: 'How do you want to hear the result?',
    notifyEmail: 'By email',
    notifySms: 'By SMS on your phone',
    phone: 'Mobile number',
    demo: 'Demo: your account stays in this browser; no password is stored and, for 2FA, any 6-digit code works.',
    'err.invalidEmail': 'Invalid email.',
    'err.weakPassword': 'Password must be at least 8 characters.',
    'err.emailInUse': 'An account with this email already exists.',
    'err.missingDocuments': 'Upload the seller documents to create the account.',
    'err.invalidCredentials': 'Wrong email or password.',
    'err.invalidCode': 'Invalid code.',
    'err.generic': 'Could not complete. Please try again.',
  },
  de: {
    signinTab: 'Anmelden',
    signupTab: 'Konto erstellen',
    name: 'Name',
    enable2fa: 'Zwei-Faktor-Authentifizierung (2FA) aktivieren',
    submitSignin: 'Anmelden',
    submitSignup: 'Konto erstellen',
    twoFaTitle: 'Zwei-Faktor-Bestätigung',
    twoFaLead: 'Geben Sie den 6-stelligen Code aus Ihrer Authenticator-App ein.',
    code: '6-stelliger Code',
    verify: 'Bestätigen',
    back: 'Zurück',
    docsTitle: 'Verkäufer-Dokumente',
    docsLead: 'Um zu inserieren, weisen Sie Ihre Identität einmal nach: Ausweis (Vorder- und Rückseite) und ein Selfie mit dem Ausweis. Sie bleiben in Ihrem Konto.',
    docChoose: 'Datei hochladen',
    docReplace: 'Ersetzen',
    docPending: 'Fehlt',
    notifyTitle: 'Wie möchten Sie das Ergebnis erfahren?',
    notifyEmail: 'Per E-Mail',
    notifySms: 'Per SMS aufs Handy',
    phone: 'Handynummer',
    demo: 'Demo: Ihr Konto bleibt in diesem Browser; es wird kein Passwort gespeichert und bei 2FA funktioniert jeder 6-stellige Code.',
    'err.invalidEmail': 'Ungültige E-Mail.',
    'err.weakPassword': 'Das Passwort braucht mindestens 8 Zeichen.',
    'err.emailInUse': 'Mit dieser E-Mail existiert bereits ein Konto.',
    'err.missingDocuments': 'Laden Sie die Verkäufer-Dokumente hoch, um das Konto zu erstellen.',
    'err.invalidCredentials': 'E-Mail oder Passwort falsch.',
    'err.invalidCode': 'Ungültiger Code.',
    'err.generic': 'Konnte nicht abgeschlossen werden. Bitte erneut versuchen.',
  },
}

/** Tela de conta: criar conta, entrar e segundo fator (2FA). */
export function AuthPage({ onAuthenticated }: { onAuthenticated: (account: Account) => void }) {
  const { t, lang } = useI18n()
  const c = COPY[lang]
  const auth = getAuthProvider()

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('buyer')
  const [enable2fa, setEnable2fa] = useState(false)
  const [documents, setDocuments] = useState<DocumentFiles>({})
  const [notifyBy, setNotifyBy] = useState<NotifyChannel>('email')
  const [phone, setPhone] = useState('')
  const [challengeId, setChallengeId] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState<AuthErrorCode | null>(null)
  const [busy, setBusy] = useState(false)

  // O vendedor comprova a identidade no cadastro; o comprador não precisa.
  const needDocs = mode === 'signup' && role === 'seller'
  const docsMissing = missingDocuments(documents, SELLER_DOCUMENTS)
  const setDocument = (kind: DocumentKind, fileName: string) => setDocuments((d) => ({ ...d, [kind]: fileName }))

  function resolve(res: AuthResult) {
    setBusy(false)
    if (res.status === 'ok') onAuthenticated(res.account)
    else if (res.status === 'two_factor') setChallengeId(res.challenge.id)
    else setError(res.error)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    const res =
      mode === 'signup'
        ? await auth.signUp({
            name,
            email,
            password,
            role,
            enableTwoFactor: enable2fa,
            documents: role === 'seller' ? documents : undefined,
            ...(role === 'seller' ? { notifyBy, phone: notifyBy === 'sms' ? phone : undefined } : {}),
          })
        : await auth.signIn({ email, password })
    resolve(res)
  }

  async function onVerify(e: FormEvent) {
    e.preventDefault()
    if (!challengeId) return
    setError(null)
    setBusy(true)
    resolve(await auth.verifyTwoFactor({ challengeId, code }))
  }

  const errorText = error ? (c[`err.${error}`] ?? c['err.generic']) : null

  if (challengeId) {
    return (
      <section className="welcome">
        <div className="welcome-copy">
          <h1 className="display">{t('hero.title')}</h1>
          <p className="lead">{t('hero.lede')}</p>
        </div>
        <form className="form sheet" onSubmit={onVerify}>
          <h2>{c.twoFaTitle}</h2>
          <p className="muted">{c.twoFaLead}</p>
          <label className="field">
            {c.code}
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
            />
          </label>
          {errorText && <p className="muted small" role="alert">{errorText}</p>}
          <button type="submit" disabled={busy || !isValidTwoFactorCode(code)}>{c.verify}</button>
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setChallengeId(null)
              setCode('')
              setError(null)
            }}
          >
            {c.back}
          </button>
        </form>
      </section>
    )
  }

  return (
    <section className="welcome">
      <div className="welcome-copy">
        <h1 className="display">{t('hero.title')}</h1>
        <p className="lead">{t('hero.lede')}</p>
      </div>

      <form className="form sheet" onSubmit={onSubmit}>
        <div className="lang-switch" role="group" aria-label={c.signinTab + ' / ' + c.signupTab}>
          <button type="button" aria-pressed={mode === 'signin'} onClick={() => { setMode('signin'); setError(null) }}>{c.signinTab}</button>
          <button type="button" aria-pressed={mode === 'signup'} onClick={() => { setMode('signup'); setError(null) }}>{c.signupTab}</button>
        </div>

        <div className="role-buttons">
          <button type="button" className="role" aria-pressed={role === 'buyer'} onClick={() => setRole('buyer')}>
            <strong>{t('login.buyer')}</strong>
            <span>{t('login.buyerDesc')}</span>
          </button>
          <button type="button" className="role" aria-pressed={role === 'seller'} onClick={() => setRole('seller')}>
            <strong>{t('login.seller')}</strong>
            <span>{t('login.sellerDesc')}</span>
          </button>
        </div>

        {mode === 'signup' && (
          <label className="field">
            {c.name}
            <input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
        )}
        <label className="field">
          {t('login.email')}
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </label>
        <label className="field">
          {t('login.password')}
          <input
            type="password"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {mode === 'signup' && (
          <label className="check">
            <input type="checkbox" checked={enable2fa} onChange={(e) => setEnable2fa(e.target.checked)} />
            {c.enable2fa}
          </label>
        )}

        {needDocs && (
          <fieldset className="docs">
            <legend>{c.docsTitle}</legend>
            <p className="docs-lead">{c.docsLead}</p>
            <ul className="docs-list">
              {SELLER_DOCUMENTS.map((kind) => {
                const file = documents[kind]
                return (
                  <li key={kind} className={file ? 'doc doc-done' : 'doc'}>
                    <span className="doc-mark" aria-hidden="true">{file ? '✓' : ''}</span>
                    <div className="doc-text">
                      <strong>{t(`doc.${kind}`)}</strong>
                      <small>{file ?? t(`doc.${kind}.hint`)}</small>
                    </div>
                    <label className="button button-quiet doc-upload">
                      {file ? c.docReplace : c.docChoose}
                      <span className="visually-hidden">: {t(`doc.${kind}`)}</span>
                      <input
                        type="file"
                        className="visually-hidden"
                        accept={kind === 'selfie' ? 'image/*' : 'application/pdf,image/*'}
                        capture={kind === 'selfie' ? 'user' : undefined}
                        onChange={(e) => setDocument(kind, e.target.files?.[0]?.name ?? '')}
                      />
                    </label>
                  </li>
                )
              })}
            </ul>
          </fieldset>
        )}

        {needDocs && (
          <fieldset className="docs">
            <legend>{c.notifyTitle}</legend>
            <label className="check">
              <input type="radio" name="notifyBy" checked={notifyBy === 'email'} onChange={() => setNotifyBy('email')} />
              {c.notifyEmail}
            </label>
            <label className="check">
              <input type="radio" name="notifyBy" checked={notifyBy === 'sms'} onChange={() => setNotifyBy('sms')} />
              {c.notifySms}
            </label>
            {notifyBy === 'sms' && (
              <label className="field">
                {c.phone}
                <input type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+55 11 90000-0000" />
              </label>
            )}
          </fieldset>
        )}

        {errorText && <p className="muted small" role="alert">{errorText}</p>}
        <button type="submit" disabled={busy || (needDocs && docsMissing.length > 0)}>{mode === 'signup' ? c.submitSignup : c.submitSignin}</button>
        <p className="muted small">{c.demo}</p>
      </form>
    </section>
  )
}
