import { useState } from 'react'
import './styles.css'
import Login from './components/Login'
import Menu from './components/Menu'
import TPC from './components/TPC'
import EPC from './components/EPC'
import Discursivas from './components/Discursivas'
import Contexto from './components/Contexto'
import AdminLogin from './components/AdminLogin'
import AdminDashboard from './components/AdminDashboard'

function App() {
  const [participanteLogado, setParticipanteLogado] = useState(null)
  const [telaAtual, setTelaAtual] = useState('menu')
  const [mostrarContexto, setMostrarContexto] = useState(false)
  
  // Controle de Estado do Administrador
  const [adminLogado, setAdminLogado] = useState(false)

  // 1. Se for o Admin, domina a tela inteira com o Dashboard
  if (adminLogado) {
    return <AdminDashboard onSair={() => { setAdminLogado(false); setTelaAtual('menu'); }} />
  }

  // 2. Se o usuário clicou em "Acesso Restrito"
  if (telaAtual === 'admin-login') {
    return <AdminLogin onLogin={() => setAdminLogado(true)} onVoltar={() => setTelaAtual('menu')} />
  }

  // 3. Se o participante não está logado, mostra o Login comum
  if (!participanteLogado) {
    return (
      <Login 
        onLogin={(dados) => setParticipanteLogado(dados)} 
        onAdminClick={() => setTelaAtual('admin-login')} 
      />
    )
  }

  // 4. Fluxo normal do Aluno
  return (
    <div>
      {telaAtual === 'menu' && (
        <Menu 
          participante={participanteLogado} 
          onStartTPC={() => setTelaAtual('tpc')} 
          onStartEPC={() => setTelaAtual('epc')} 
          onStartDiscursivas={() => setTelaAtual('discursivas')}
          onLerContexto={() => setMostrarContexto(true)} 
        />
      )}
      
      {telaAtual === 'tpc' && (
        <TPC participante={participanteLogado} onVoltarMenu={() => setTelaAtual('menu')} onLerContexto={() => setMostrarContexto(true)} onContinuarEPC={() => setTelaAtual('epc')} />
      )}
      
      {telaAtual === 'epc' && (
        <EPC participante={participanteLogado} onVoltarMenu={() => setTelaAtual('menu')} onLerContexto={() => setMostrarContexto(true)} onContinuarDiscursiva={() => setTelaAtual('discursivas')} />
      )}

      {telaAtual === 'discursivas' && (
        <Discursivas participante={participanteLogado} onVoltarMenu={() => setTelaAtual('menu')} onLerContexto={() => setMostrarContexto(true)} />
      )}

      <Contexto visivel={mostrarContexto} onClose={() => setMostrarContexto(false)} />
    </div>
  )
}

export default App