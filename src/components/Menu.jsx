import { useState, useEffect } from 'react'
import { API_URL } from '../api'

export default function Menu({ participante, onStartTPC, onStartEPC, onStartDiscursivas, onLerContexto }) {
  const [status, setStatus] = useState({ tpc_concluido: false, epc_concluido: false, disc_concluido: false })
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/participantes/${participante.id}/status`)
      .then(res => res.json())
      .then(data => {
        setStatus(data)
        setCarregando(false)
      })
      .catch(() => setCarregando(false))
  }, [participante.id])

  if (carregando) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>

  return (
    <div className="container py-5">
      <header className="text-center mb-5">
        <h2 className="text-primary fw-bold mb-2"><i className="bi bi-cpu me-2"></i>SAPeC</h2>
        <p className="text-muted mb-4">Sistema de Avaliação de Pensamento Computacional</p>
        <div className="alert alert-light border shadow-sm d-inline-block px-4 py-2 mb-0">
          <h5 className="mb-0">Bem-vindo(a), <span className="text-primary fw-bold">{participante.identificacao}</span></h5>
        </div>
      </header>

      <div className="row justify-content-center mb-5">
        <div className="col-md-10 col-lg-8">
          <button className="btn btn-outline-info w-100 py-3 fw-bold shadow-sm d-flex justify-content-center align-items-center" onClick={onLerContexto}>
            <i className="bi bi-book-half fs-5 me-2"></i>Ler Contextualização da Pesquisa
          </button>
        </div>
      </div>

      <div className="row g-4 justify-content-center">
        
        {/* TPC */}
        <div className="col-md-4 col-lg-4">
          <div className={`card h-100 shadow-sm text-center ${status.tpc_concluido ? 'border-success bg-light' : 'border-primary'}`}>
            <div className="card-body d-flex flex-column p-4">
              <i className={`bi ${status.tpc_concluido ? 'bi-check-circle-fill text-success' : 'bi-ui-checks-grid text-primary'} mb-3`} style={{ fontSize: '3rem' }}></i>
              <h5 className={`card-title fw-bold ${status.tpc_concluido ? 'text-success' : 'text-primary'}`}>1. Módulo TPC</h5>
              <p className="card-text text-muted flex-grow-1 small">Questões de múltipla escolha.</p>
              <button 
                className={`btn w-100 mt-3 fw-bold ${status.tpc_concluido ? 'btn-success disabled' : 'btn-primary'}`} 
                onClick={onStartTPC} disabled={status.tpc_concluido}
              >
                {status.tpc_concluido ? <><i className="bi bi-check2 me-1"></i>Concluído</> : <><i className="bi bi-play-fill me-1"></i>Iniciar TPC</>}
              </button>
            </div>
          </div>
        </div>

        {/* EPC */}
        <div className="col-md-4 col-lg-4">
          <div className={`card h-100 shadow-sm text-center ${status.epc_concluido ? 'border-success bg-light' : (!status.tpc_concluido ? 'border-secondary bg-light opacity-75' : 'border-success')}`}>
            <div className="card-body d-flex flex-column p-4">
              <i className={`bi ${status.epc_concluido ? 'bi-check-circle-fill text-success' : (!status.tpc_concluido ? 'bi-lock-fill text-secondary' : 'bi-list-ol text-success')} mb-3`} style={{ fontSize: '3rem' }}></i>
              <h5 className={`card-title fw-bold ${status.epc_concluido ? 'text-success' : (!status.tpc_concluido ? 'text-secondary' : 'text-success')}`}>2. Módulo EPC</h5>
              <p className="card-text text-muted flex-grow-1 small">Autoavaliação de habilidades.</p>
              <button 
                className={`btn w-100 mt-3 fw-bold ${status.epc_concluido ? 'btn-success disabled' : (!status.tpc_concluido ? 'btn-secondary disabled' : 'btn-success')}`} 
                onClick={onStartEPC} disabled={status.epc_concluido || !status.tpc_concluido}
              >
                {status.epc_concluido ? <><i className="bi bi-check2 me-1"></i>Concluído</> : (!status.tpc_concluido ? <><i className="bi bi-lock-fill me-1"></i>Bloqueado</> : <><i className="bi bi-play-fill me-1"></i>Iniciar EPC</>)}
              </button>
            </div>
          </div>
        </div>

        {/* DISCURSIVAS */}
        <div className="col-md-4 col-lg-4">
          <div className={`card h-100 shadow-sm text-center ${status.disc_concluido ? 'border-success bg-light' : (!status.epc_concluido ? 'border-secondary bg-light opacity-75' : 'border-primary')} `} style={{ borderColor: status.epc_concluido && !status.disc_concluido ? '#8a2be2' : '' }}>
            <div className="card-body d-flex flex-column p-4">
              <i className={`bi ${status.disc_concluido ? 'bi-check-circle-fill text-success' : (!status.epc_concluido ? 'bi-lock-fill text-secondary' : 'bi-pencil-square')} mb-3`} style={{ fontSize: '3rem', color: status.epc_concluido && !status.disc_concluido ? '#8a2be2' : '' }}></i>
              <h5 className={`card-title fw-bold ${status.disc_concluido ? 'text-success' : (!status.epc_concluido ? 'text-secondary' : '')}`} style={{ color: status.epc_concluido && !status.disc_concluido ? '#8a2be2' : '' }}>3. Discursivas</h5>
              <p className="card-text text-muted flex-grow-1 small">Perguntas abertas qualitativas.</p>
              <button 
                className={`btn text-white w-100 mt-3 fw-bold ${status.disc_concluido ? 'btn-success disabled' : (!status.epc_concluido ? 'btn-secondary disabled' : '')}`} 
                style={{ backgroundColor: status.epc_concluido && !status.disc_concluido ? '#8a2be2' : '' }}
                onClick={onStartDiscursivas} disabled={status.disc_concluido || !status.epc_concluido}
              >
                {status.disc_concluido ? <><i className="bi bi-check2 me-1"></i>Concluído</> : (!status.epc_concluido ? <><i className="bi bi-lock-fill me-1"></i>Bloqueado</> : <><i className="bi bi-play-fill me-1"></i>Iniciar</>)}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}