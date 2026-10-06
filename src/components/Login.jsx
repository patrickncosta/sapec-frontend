import { useState } from 'react'
import { API_URL } from '../api'

export default function Login({ onLogin, onAdminClick }) {
  const [codigoAcesso, setCodigoAcesso] = useState("")
  const [buscando, setBuscando] = useState(false)

  const handleAcessar = async (e) => {
    e.preventDefault()
    if (!codigoAcesso.trim()) return alert("Por favor, digite o seu código de identificação.")
    setBuscando(true)
    try {
      const res = await fetch(`${API_URL}/participantes/${codigoAcesso}`)
      if (res.ok) { onLogin(await res.json()) } 
      else { alert("Código não encontrado. Verifique a sua identificação e tente novamente.") }
    } catch (error) { alert("Erro de conexão com o servidor.") }
    setBuscando(false)
  }

  return (
    <div className="container-fluid min-vh-100 bg-light d-flex align-items-center justify-content-center py-5">
      {/* Coluna mais larga (col-lg-5 em vez de col-lg-4) */}
      <div className="col-11 col-sm-10 col-md-8 col-lg-5">
        
        <div className="text-center mb-4">
          <i className="bi bi-cpu text-primary" style={{ fontSize: '3rem' }}></i>
          <h2 className="text-primary fw-bold mt-2 mb-1">SAPeC</h2>
          <p className="text-muted mb-0">Sistema de Avaliação de Pensamento Computacional</p>
        </div>

        <div className="card shadow-sm border-0 rounded-4">
          <div className="card-body p-4 p-md-5">
            <h5 className="text-center mb-4 text-dark fw-semibold">Acesse a plataforma</h5>
            
            <form onSubmit={handleAcessar}>
              <div className="input-group mb-4 shadow-sm">
                <span className="input-group-text bg-white text-primary border-end-0 px-3">
                  <i className="bi bi-person-badge fs-5"></i>
                </span>
                <input 
                  type="text" 
                  className="form-control form-control-lg border-start-0 ps-0" 
                  value={codigoAcesso} 
                  onChange={(e) => setCodigoAcesso(e.target.value.toUpperCase())} 
                  placeholder="ID de acesso (Ex: 3I001)" 
                  autoFocus
                />
              </div>
              
              <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold" disabled={buscando}>
                {buscando ? (
                  <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>A verificar...</>
                ) : (
                  <><i className="bi bi-box-arrow-in-right me-2"></i>Entrar</>
                )}
              </button>
            </form>
          </div>
          
          <div className="card-footer bg-light border-top-0 text-center py-3 rounded-bottom-4">
            <button className="btn btn-link text-decoration-none text-muted small" onClick={onAdminClick}>
              <i className="bi bi-lock-fill me-1"></i>Painel Administrativo
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}