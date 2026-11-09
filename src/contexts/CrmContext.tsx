import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AtendimentoRecord, EscalaRecord, ModeloRecord, UserRecord } from '@/types/crm'
import { listAtendimentos } from '@/services/atendimentos'
import { listEscala, listModelos } from '@/services/resources'
import { listUsers } from '@/services/users'
import { useAuth } from '@/contexts/AuthContext'

interface CrmContextValue {
  atendimentos: AtendimentoRecord[]
  equipe: UserRecord[]
  escala: EscalaRecord[]
  modelos: ModeloRecord[]
  loading: boolean
  error: string
  refresh: () => Promise<void>
  replaceAtendimento: (record: AtendimentoRecord) => void
}

const CrmContext = createContext<CrmContextValue | null>(null)

export function CrmProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [atendimentos, setAtendimentos] = useState<AtendimentoRecord[]>([])
  const [equipe, setEquipe] = useState<UserRecord[]>([])
  const [escala, setEscala] = useState<EscalaRecord[]>([])
  const [modelos, setModelos] = useState<ModeloRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      const [cases, users, shifts, templates] = await Promise.all([
        listAtendimentos(),
        listUsers(),
        listEscala(),
        listModelos(),
      ])
      setAtendimentos(cases)
      setEquipe(users)
      setEscala(shifts)
      setModelos(templates)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível carregar os dados.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) void refresh()
    else {
      setAtendimentos([])
      setEquipe([])
      setEscala([])
      setModelos([])
    }
  }, [refresh, user])

  const value = useMemo<CrmContextValue>(
    () => ({
      atendimentos,
      equipe,
      escala,
      modelos,
      loading,
      error,
      refresh,
      replaceAtendimento: (record) =>
        setAtendimentos((current) =>
          current.map((item) => (item.id === record.id ? record : item)),
        ),
    }),
    [atendimentos, equipe, error, escala, loading, modelos, refresh],
  )

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>
}

export function useCrm() {
  const context = useContext(CrmContext)
  if (!context) throw new Error('useCrm deve ser usado dentro de CrmProvider')
  return context
}
