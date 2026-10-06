import { useState } from 'react'
import { API_URL } from '../api'

export default function AdminLogin({ onLogin, onVoltar }) {
  const [isRegistrando, setIsRegistrando] = useState(false)
  const [username, setUsername] = useState("")
  const [senha, setSenha] = useState("")
  const [chaveMestra, setChaveMestra] = useState("")
  const [carregando, setCarregando] = useState(false)

  const handleAcessar = async (e) => {
    e.preventDefault()
    if (!username.trim() || !senha.trim()) return alert("Preencha o utilizador e a senha.")
    
    setCarregando(true)
    try {
      const res = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, senha })
      })
      
      if (res.ok) {
        onLogin() 
      } else {
        const errorData = await res.json()
        alert(errorData.detail || "Credenciais incorretas.")
      }
    } catch (error) { alert("Erro de conexão com o servidor.") }
    setCarregando(false)
  }

  const handleRegistrar = async (e) => {
    e.preventDefault()
    if (!username.trim() || !senha.trim() || !chaveMestra.trim()) {
      return alert("Preencha utilizador, senha e a chave de segurança do sistema.")
    }

    setCarregando(true)
    try {
      const res = await fetch(`${API_URL}/admin/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, senha, chave_criacao: chaveMestra })
      })
      
      if (res.ok) {
        alert("Administrador criado com sucesso! Faça login agora.")
        setIsRegistrando(false) // Volta para a tela de login
        setChaveMestra("")
        setSenha("")
      } else {
        const errorData = await res.json()
        alert(errorData.detail || "Erro ao registrar administrador.")
      }
    } catch (error) { alert("Erro de conexão com o servidor.") }
    setCarregando(false)
  }

  return (
    <div className="container-fluid min-vh-100 bg-light d-flex align-items-center justify-content-center py-5">
      <div className="col-11 col-sm-10 col-md-8 col-lg-5">
        
        <div className="text-center mb-4">
          <i className={`bi ${isRegistrando ? 'bi-shield-plus' : 'bi-shield-lock-fill'} text-danger`} style={{ fontSize: '3rem' }}></i>
          <h2 className="text-danger fw-bold mt-2 mb-1">{isRegistrando ? 'Novo Administrador' : 'Acesso Restrito'}</h2>
          <p className="text-muted mb-0">Painel de gestão SAPeC</p>
        </div>

        <div className="card shadow-sm border-0 rounded-4">
          <div className="card-body p-4 p-md-5">
            
            <form onSubmit={isRegistrando ? handleRegistrar : handleAcessar}>
              <div className="mb-3">
                <label className="form-label fw-bold text-secondary">Utilizador</label>
                <div className="input-group shadow-sm">
                  <span className="input-group-text bg-white text-muted border-end-0 px-3">
                    <i className="bi bi-person-fill"></i>
                  </span>
                  <input 
                    type="text" 
                    className="form-control form-control-lg border-start-0 ps-0" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    placeholder="Nome de utilizador..." 
                    autoFocus
                  />
                </div>
              </div>

              <div className={isRegistrando ? "mb-3" : "mb-4"}>
                <label className="form-label fw-bold text-secondary">Senha</label>
                <div className="input-group shadow-sm">
                  <span className="input-group-text bg-white text-muted border-end-0 px-3">
                    <i className="bi bi-key-fill"></i>
                  </span>
                  <input 
                    type="password" 
                    className="form-control form-control-lg border-start-0 ps-0" 
                    value={senha} 
                    onChange={(e) => setSenha(e.target.value)} 
                    placeholder="Digite a senha..." 
                  />
                </div>
              </div>

              {/* Campo exclusivo para o Registo */}
              {isRegistrando && (
                <div className="mb-4">
                  <label className="form-label fw-bold text-danger">Chave do sistema (Master Key)</label>
                  <div className="input-group shadow-sm border-danger">
                    <span className="input-group-text bg-danger text-white border-end-0 px-3">
                      <i className="bi bi-asterisk"></i>
                    </span>
                    <input 
                      type="password" 
                      className="form-control form-control-lg border-start-0 ps-0 border-danger" 
                      value={chaveMestra} 
                      onChange={(e) => setChaveMestra(e.target.value)} 
                      placeholder="Chave autorizada para criar admins..." 
                    />
                  </div>
                  <small className="text-muted mt-1 d-block">Solicite a chave ao arquiteto do sistema.</small>
                </div>
              )}
              
              <button type="submit" className="btn btn-danger btn-lg w-100 fw-bold shadow-sm" disabled={carregando}>
                {carregando ? (
                  <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Processando...</>
                ) : (
                  <><i className={`bi ${isRegistrando ? 'bi-person-plus-fill' : 'bi-box-arrow-in-right'} me-2`}></i>{isRegistrando ? 'Registrar Administrador' : 'Entrar no Painel'}</>
                )}
              </button>
            </form>
          </div>
          
          <div className="card-footer bg-light border-top-0 d-flex justify-content-between py-3 rounded-bottom-4">
            <button className="btn btn-link text-decoration-none text-muted small px-0" onClick={onVoltar}>
              <i className="bi bi-arrow-left me-1"></i>Voltar ao início
            </button>
            
            <button className="btn btn-link text-decoration-none text-danger small px-0" onClick={() => setIsRegistrando(!isRegistrando)}>
              <i className="bi bi-gear-fill me-1"></i>{isRegistrando ? 'Já tenho conta' : 'Criar Conta Admin'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}