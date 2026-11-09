import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/contexts/AuthContext'
import { CrmProvider } from '@/contexts/CrmContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AppLayout } from '@/components/AppLayout'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import NewCase from '@/pages/NewCase'
import CaseDetail from '@/pages/CaseDetail'
import Handoff from '@/pages/Handoff'
import Complaints from '@/pages/Complaints'
import Schedule from '@/pages/Schedule'
import Templates from '@/pages/Templates'
import Diretriz from '@/pages/Diretriz'
import NotFound from '@/pages/NotFound'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CrmProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/painel" replace />} />
              <Route path="/painel" element={<Dashboard />} />
              <Route path="/atendimentos/novo" element={<NewCase />} />
              <Route path="/atendimentos/:id" element={<CaseDetail />} />
              <Route path="/handoff" element={<Handoff />} />
              <Route path="/reclamacoes" element={<Complaints />} />
              <Route path="/escala" element={<Schedule />} />
              <Route path="/modelos" element={<Templates />} />
              <Route path="/diretriz" element={<Diretriz />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </CrmProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
