import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, LockKeyhole, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BrandMark } from '@/components/BrandMark'
import { useAuth } from '@/contexts/AuthContext'
import { requestPasswordReset } from '@/services/auth'
import { useToast } from '@/hooks/use-toast'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const [email, setEmail] = useState('paulogleo@gmail.com')
  const [password, setPassword] = useState('Skip@Pass')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [resetMode, setResetMode] = useState(false)

  if (user) return <Navigate to="/painel" replace />

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (resetMode) {
        await requestPasswordReset(email.trim())
        toast({
          title: 'E-mail enviado',
          description: 'Confira sua caixa de entrada para criar uma nova senha.',
        })
        setResetMode(false)
      } else {
        await login(email.trim(), password)
        const destination = (location.state as { from?: string } | null)?.from || '/painel'
        navigate(destination, { replace: true })
      }
    } catch {
      setError(
        resetMode
          ? 'Não foi possível enviar o e-mail. Confira o endereço e tente novamente.'
          : 'E-mail ou senha incorretos. Confira os dados e tente novamente.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f9fc] lg:grid lg:grid-cols-[1.08fr_0.92fr]">
      <section className="relative hidden overflow-hidden bg-primary px-14 py-12 text-white lg:flex lg:flex-col">
        <div className="absolute -right-28 -top-32 h-96 w-96 rounded-full border-[70px] border-white/5" />
        <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-[#ffca1a] opacity-95" />
        <div className="absolute bottom-8 left-44 h-64 w-24 rotate-[38deg] rounded-full border-[32px] border-primary/30" />
        <BrandMark inverse className="relative z-10" />
        <div className="relative z-10 my-auto max-w-xl">
          <span className="mb-7 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-50">
            Atendimento com contexto
          </span>
          <h1 className="font-display text-5xl font-bold leading-[1.04] tracking-[-0.045em] xl:text-6xl">
            Cada conversa bem cuidada, do início ao fim.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-blue-100">
            Organize o turno, acompanhe os retornos e passe cada caso adiante sem perder nenhum
            detalhe.
          </p>
          <div className="mt-10 flex items-center gap-3 text-sm font-semibold text-blue-100">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffca1a]" />
            Diretriz Azul Banana sempre à mão
          </div>
        </div>
        <p className="relative z-10 text-xs text-blue-200">Azul Banana • CRM de atendimento</p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <BrandMark className="mb-12 lg:hidden" />
          <div className="mb-8">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.15em] text-primary">
              {resetMode ? 'Recuperar acesso' : 'Bem-vinda de volta'}
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-950">
              {resetMode ? 'Redefina sua senha' : 'Entre no seu turno'}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {resetMode
                ? 'Digite seu e-mail e enviaremos as instruções de recuperação.'
                : 'Use seu e-mail de equipe para acessar os atendimentos.'}
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6 rounded-xl">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="voce@azulbanana.com.br"
                  className="h-12 rounded-xl pl-10"
                  required
                />
              </div>
            </div>

            {!resetMode && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <button
                    type="button"
                    onClick={() => {
                      setError('')
                      setResetMode(true)
                    }}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Esqueci minha senha
                  </button>
                </div>
                <div className="relative">
                  <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-12 rounded-xl px-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="h-12 w-full rounded-xl font-bold shadow-lg shadow-blue-600/15"
              disabled={submitting}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {resetMode ? 'Enviar instruções' : 'Entrar no CRM'}
            </Button>

            {resetMode && (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setError('')
                  setResetMode(false)
                }}
              >
                Voltar para o login
              </Button>
            )}
          </form>

          <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-xs leading-relaxed text-blue-800">
            <strong>Acesso inicial da Direção:</strong> paulogleo@gmail.com
            <br />
            <strong>Senha:</strong> Skip@Pass
          </div>
        </div>
      </section>
    </main>
  )
}
