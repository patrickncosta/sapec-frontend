import { useState, useEffect, useRef } from 'react'
import { API_URL } from '../api'

export default function Discursivas({ participante, onVoltarMenu, onLerContexto }) {
  const [questoes, setQuestoes] = useState([])
  const [indiceAtual, setIndiceAtual] = useState(0)
  const [respostas, setRespostas] = useState({})
  
  const [tempos, setTempos] = useState({}) 
  const tempoInicioRef = useRef(Date.now())

  const [finalizado, setFinalizado] = useState(false)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/questoes/discursivas`).then(res => res.json()).then(data => setQuestoes(data))
  }, [])

  const contabilizarTempoDaQuestao = () => {
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
      for (const [questaoId, texto] of Object.entries(respostas)) {
        if (!texto.trim()) continue;
        await fetch(`${API_URL}/respostas/discursivas`, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ 
            participante_id: participante.id, 
            questao_discursiva_id: parseInt(questaoId), 
            respostaEscrita: texto,
            tempo_segundos: temposFinais[questaoId] || 0 
          }) 
        })
      }
      setFinalizado(true)
    } catch (error) { alert("Erro ao salvar respostas.") }
    setSalvando(false)
  }

  if (questoes.length === 0) return <div className="text-center mt-5"><div className="spinner-border" style={{ color: '#8a2be2' }}></div></div>

  if (finalizado) {
    return (
      <div className="container my-4">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <i className="bi bi-stars mb-2" style={{ fontSize: '3.5rem', color: '#8a2be2' }}></i>
            <h3 className="mb-2">Pesquisa Totalmente Concluída!</h3>
            <p className="text-muted mb-4">Muito obrigado pela sua participação e contribuição para o estudo.</p>
            <button className="btn btn-outline-secondary w-100 py-2 fw-bold" onClick={onVoltarMenu}>
              Voltar à Tela Inicial
            </button>
          </div>
        </div>
      </div>
    )
  }

  const q = questoes[indiceAtual]
  const textoDigitado = respostas[q.id] || ""
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
              <div>
                <h5 className="fw-bold mb-0" style={{ color: '#8a2be2' }}>Discursivas - Questão {indiceAtual + 1}</h5>
              </div>
              <span className="badge bg-light text-dark border">ID: {participante.identificacao}</span>
            </div>
            
            <div className="progress mb-3" style={{ height: '5px' }}>
              <div className="progress-bar" role="progressbar" style={{ width: `${progresso}%`, backgroundColor: '#8a2be2' }}></div>
            </div>

            <p className="fs-6 mb-3 text-dark fw-medium">{q.enunciado}</p>
            
            <textarea 
              className="form-control mb-4 shadow-sm" 
              rows="5"
              placeholder="A sua resposta..."
              value={textoDigitado}
              onChange={(e) => setRespostas({...respostas, [q.id]: e.target.value})}
            ></textarea>
            
            <div className="d-flex justify-content-between border-top pt-3">
              <button className="btn btn-light px-4" onClick={() => { contabilizarTempoDaQuestao(); setIndiceAtual(indiceAtual - 1); }} disabled={indiceAtual === 0}>
                <i className="bi bi-chevron-left me-1"></i>Voltar
              </button>
              
              {indiceAtual + 1 === questoes.length ? (
                <button className="btn text-white px-4 fw-bold" style={{ backgroundColor: '#8a2be2' }} onClick={handleFinalizar} disabled={salvando}>
                  {salvando ? "A salvar..." : <><i className="bi bi-check2-all me-1"></i>Finalizar Pesquisa</>}
                </button>
              ) : (
                <button className="btn text-white px-4 fw-bold" style={{ backgroundColor: '#8a2be2' }} onClick={() => { contabilizarTempoDaQuestao(); setIndiceAtual(indiceAtual + 1); }}>
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