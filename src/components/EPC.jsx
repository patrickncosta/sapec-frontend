import { useState, useEffect, useRef } from 'react'
import { API_URL } from '../api'

export default function EPC({ participante, onVoltarMenu, onLerContexto, onContinuarDiscursiva }) {
  const [questoes, setQuestoes] = useState([])
  const [indiceAtual, setIndiceAtual] = useState(0)
  const [respostas, setRespostas] = useState({})
  
  const [tempos, setTempos] = useState({}) 
  const tempoInicioRef = useRef(Date.now())

  const [finalizado, setFinalizado] = useState(false)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/questoes/epc`).then(res => res.json()).then(data => setQuestoes(data))
  }, [])

  const contabilizarTempo = () => {
    if (questoes.length === 0) return;
    const idAtual = questoes[indiceAtual].id;
    const tempoGastoSecs = Math.floor((Date.now() - tempoInicioRef.current) / 1000);
    setTempos(prev => ({ ...prev, [idAtual]: (prev[idAtual] || 0) + tempoGastoSecs }));
    tempoInicioRef.current = Date.now(); 
  }

  const handleFinalizar = async () => {
    setSalvando(true)
    const idUltima = questoes[indiceAtual].id;
    const tempoGastoSecs = Math.floor((Date.now() - tempoInicioRef.current) / 1000);
    const temposFinais = { ...tempos, [idUltima]: (tempos[idUltima] || 0) + tempoGastoSecs };

    try {
      for (const [questaoId, valor] of Object.entries(respostas)) {
        await fetch(`${API_URL}/respostas/epc`, { // <-- Ajustado para "resultados"
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ 
            participante_id: participante.id, 
            questao_epc_id: parseInt(questaoId), 
            resposta_escala: valor,
            tempo_segundos: temposFinais[questaoId] || 0 
          }) 
        })
      }
      setFinalizado(true)
    } catch (error) { alert("Erro ao salvar dados.") }
    setSalvando(false)
  }

  if (questoes.length === 0) return <div className="text-center mt-5"><div className="spinner-border text-success"></div></div>

  if (finalizado) {
    return (
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <i className="bi bi-check-circle-fill text-success mb-3" style={{ fontSize: '4rem' }}></i>
            <h3 className="mb-3">Escala Concluída!</h3>
            <p className="text-muted mb-4">Sua percepção foi registrada com sucesso.</p>
            
            <button className="btn btn-success w-100 py-3 mb-3 fw-bold" onClick={onContinuarDiscursiva}>
              Continuar para Discursivas <i className="bi bi-arrow-right ms-2"></i>
            </button>
            <button className="btn btn-outline-secondary w-100" onClick={onVoltarMenu}>Voltar ao Menu</button>
          </div>
        </div>
      </div>
    )
  }

  const q = questoes[indiceAtual]
  const selecionada = respostas[q.id]
  const progresso = Math.round((indiceAtual / questoes.length) * 100)

  return (
    <div className="container my-3">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          
          <div className="d-flex justify-content-between align-items-center mb-2">
            <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={onVoltarMenu}>
              <i className="bi bi-arrow-left me-1"></i>Sair
            </button>
            <button className="btn btn-outline-info btn-sm rounded-pill px-3" onClick={onLerContexto}>
              <i className="bi bi-info-circle me-1"></i>Contexto
            </button>
          </div>

          <div className="bg-white rounded-4 shadow-sm p-3 p-md-4">
            
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="text-success fw-bold mb-0">Item {indiceAtual + 1} de {questoes.length}</h5>
              <span className="badge bg-light text-dark border">ID: {participante.identificacao}</span>
            </div>
            
            <div className="progress mb-3" style={{ height: '5px' }}>
              <div className="progress-bar bg-success" role="progressbar" style={{ width: `${progresso}%` }}></div>
            </div>

            <h5 className="my-4 text-center lh-base fw-normal text-dark">"{q.afirmacao}"</h5>
            
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 mb-4 px-md-4">
              <span className="text-muted small fw-bold">Não concordo</span>
              <div className="d-flex gap-2">
                {[1, 2, 3, 4, 5].map(v => (
                  <button 
                    key={v} 
                    className={`btn ${selecionada === v ? 'btn-success text-white border-success' : 'btn-outline-secondary border-2'} rounded-circle fw-bold d-flex align-items-center justify-content-center`}
                    style={{ width: '45px', height: '45px' }}
                    onClick={() => setRespostas({...respostas, [q.id]: v})}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <span className="text-muted small fw-bold">Concordo totalmente</span>
            </div>
            
            <div className="d-flex justify-content-between border-top pt-3">
              <button className="btn btn-light px-4" onClick={() => { contabilizarTempo(); setIndiceAtual(indiceAtual - 1); }} disabled={indiceAtual === 0}>
                <i className="bi bi-chevron-left me-1"></i>Voltar
              </button>
              
              {indiceAtual + 1 === questoes.length ? (
                <button className="btn btn-success px-4 fw-bold" onClick={handleFinalizar} disabled={salvando}>
                  {salvando ? "Salvando..." : <><i className="bi bi-check-lg me-1"></i>Finalizar EPC</>}
                </button>
              ) : (
                <button className="btn btn-success px-4 fw-bold" onClick={() => { if(selecionada) { contabilizarTempo(); setIndiceAtual(indiceAtual + 1); } else alert("Selecione um valor na escala.") }}>
                  Próxima <i className="bi bi-chevron-right ms-1"></i>
                </button>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  )
}