import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircleWarning,
  Plus,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { BrandMark } from '@/components/BrandMark'
import { useAuth } from '@/contexts/AuthContext'
import { firstName, initials, roleLabels } from '@/lib/crm'
import { cn } from '@/lib/utils'

const navigation = [
  { label: 'Painel', to: '/painel', icon: LayoutDashboard },
  { label: 'Novo atendimento', to: '/atendimentos/novo', icon: Plus },
  { label: 'Handoff de turno', to: '/handoff', icon: ClipboardCheck },
  { label: 'Reclamações', to: '/reclamacoes', icon: MessageCircleWarning },
  { label: 'Escala', to: '/escala', icon: CalendarDays },
  { label: 'Modelos', to: '/modelos', icon: FileText },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-blue-900/40 px-6 py-6">
        <BrandMark inverse />
      </div>

      <nav className="flex-1 space-y-1 px-3 py-6">
        <p className="mb-3 px-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-blue-300">
          Central de atendimento
        </p>
        {navigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition',
                isActive
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-blue-100 hover:bg-white/10 hover:text-white',
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn('h-[18px] w-[18px]', isActive ? 'text-primary' : 'text-blue-300')}
                />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="h-4 w-4" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="m-3 rounded-2xl border border-white/10 bg-white/10 p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-white/20">
            <AvatarFallback className="bg-[#ffca1a] text-xs font-extrabold text-blue-950">
              {initials(user?.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white">{user?.name}</p>
            <p className="truncate text-[11px] font-medium text-blue-200">
              {user?.role ? roleLabels[user.role] : 'Equipe'}
            </p>
          </div>
          <button
            onClick={() => {
              logout()
              navigate('/login')
            }}
            className="rounded-lg p-2 text-blue-200 transition hover:bg-white/10 hover:text-white"
            aria-label="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function AppLayout() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const today = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }).format(new Date())

  return (
    <div className="min-h-screen bg-[#f6f8fb] lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] bg-primary lg:block">
        <SidebarContent />
      </aside>

      <div className="min-w-0 lg:col-start-2">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-lg">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] border-0 bg-primary p-0 text-white">
                <SidebarContent onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>

            <div className="flex min-w-0 flex-1 items-center gap-3">
              <BrandMark compact className="lg:hidden" />
              <div className="hidden sm:block">
                <p className="text-xs font-semibold capitalize text-slate-500">{today}</p>
                <p className="text-sm font-bold text-slate-900">Olá, {firstName(user?.name)}</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/painel')}
              className="hidden h-9 w-64 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-left text-xs font-medium text-slate-400 transition hover:border-blue-200 sm:flex"
            >
              <Search className="h-4 w-4" />
              Busque no painel de casos
            </button>
            <Avatar className="h-9 w-9 border border-blue-100">
              <AvatarFallback className="bg-blue-50 text-xs font-extrabold text-primary">
                {initials(user?.name)}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main key={location.pathname} className="animate-page-in px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-[1400px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
