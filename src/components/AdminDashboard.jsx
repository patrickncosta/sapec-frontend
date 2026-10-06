import { useState } from 'react'
import AdminVisaoGeral from './AdminVisaoGeral'
import AdminCursosSeries from './AdminCursosSeries'
import AdminParticipantes from './AdminParticipantes'
import AdminQuestoes from './AdminQuestoes'
import AdminExportar from './AdminExportar'

export default function AdminDashboard({ onSair }) {
  const [abaAtiva, setAbaAtiva] = useState('visao-geral')

  const navClass = (aba) => `nav-link ${abaAtiva === aba ? 'active' : 'text-dark'}`

  return (
    <div className="container-fluid min-vh-100 bg-light">
      <div className="row min-vh-100">
        
        {/* Menu Lateral */}
        <div className="col-md-3 col-lg-2 bg-white border-end p-3 d-flex flex-column">
          <h4 className="text-primary text-center mb-4 mt-2">
            <i className="bi bi-cpu-fill me-2"></i>SAPeC Admin
          </h4>
          
          <ul className="nav nav-pills flex-column mb-auto gap-2">
            <li className="nav-item">
              <button className={navClass('visao-geral')} onClick={() => setAbaAtiva('visao-geral')}>
                <i className="bi bi-bar-chart-fill me-2"></i>Visão Geral
              </button>
            </li>
            <li className="nav-item">
              <button className={navClass('cursos')} onClick={() => setAbaAtiva('cursos')}>
                <i className="bi bi-building me-2"></i>Cursos e Séries
              </button>
            </li>
            <li className="nav-item">
              <button className={navClass('participantes')} onClick={() => setAbaAtiva('participantes')}>
                <i className="bi bi-people-fill me-2"></i>Participantes
              </button>
            </li>
            <li className="nav-item">
              <button className={navClass('questoes')} onClick={() => setAbaAtiva('questoes')}>
                <i className="bi bi-journal-text me-2"></i>Banco de Questões
              </button>
            </li>
            <li className="nav-item">
              <button className={navClass('exportar')} onClick={() => setAbaAtiva('exportar')}>
                <i className="bi bi-download me-2"></i>Exportar Dados
              </button>
            </li>
          </ul>

          <button className="btn btn-outline-danger w-100 mt-4" onClick={onSair}>
            <i className="bi bi-box-arrow-left me-2"></i>Sair do Painel
          </button>
        </div>

        {/* Conteúdo Principal */}
        <div className="col-md-9 col-lg-10 p-5 overflow-auto" style={{ maxHeight: '100vh' }}>
          {abaAtiva === 'visao-geral' && <AdminVisaoGeral />}
          {abaAtiva === 'cursos' && <AdminCursosSeries />}
          {abaAtiva === 'participantes' && <AdminParticipantes />}
          {abaAtiva === 'questoes' && <AdminQuestoes />}
          {abaAtiva === 'exportar' && <AdminExportar />}
        </div>
      </div>
    </div>
  )
}