import { useState, useEffect, useRef } from 'react'
import { API_URL } from '../api'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function TPC({ participante, onVoltarMenu, onLerContexto, onContinuarEPC }) {
  const [questoes, setQuestoes] = useState([])
  const [indiceAtual, setIndiceAtual] = useState(0)
  const [respostas, setRespostas] = useState({})
  
  // Controle de Tempo
  const [tempos, setTempos] = useState({}) 
  const tempoInicioRef = useRef(Date.now())

  const [finalizado, setFinalizado] = useState(false)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/questoes/tpc`).then(res => res.json()).then(data => setQuestoes(data))
  }, [])

  const contabilizarTempo = () => {
    if (questoes.length === 0) return;
    const idAtual = questoes[indiceAtual].id;
    const tempoGastoSecs = Math.floor((Date.now() - tempoInicioRef.current) / 1000);
    setTempos(prev => ({ ...prev, [idAtual]: (prev[idAtual] || 0) + tempoGastoSecs }));
    tempoInicioRef.current = Date.now();
  }

  const handleProxima = () => { contabilizarTempo(); setIndiceAtual(indiceAtual + 1); }
  const handleAnterior = () => { contabilizarTempo(); setIndiceAtual(indiceAtual - 1); }

  const handleFinalizar = async () => {
    setSalvando(true)
    const idUltima = questoes[indiceAtual].id;
    const tempoGastoSecs = Math.floor((Date.now() - tempoInicioRef.current) / 1000);
    const temposFinais = { ...tempos, [idUltima]: (tempos[idUltima] || 0) + tempoGastoSecs };

    try {
      for (const [questaoId, letra] of Object.entries(respostas)) {
        await fetch(`${API_URL}/respostas/tpc`, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ 
            participante_id: participante.id, 
            questao_tpc_id: parseInt(questaoId), 
            respostaSelecionada: letra,
            tempo_segundos: temposFinais[questaoId] || 0 
          }) 
        })
      }
      setFinalizado(true)
    } catch (error) { alert("Erro ao salvar teste.") }
    setSalvando(false)
  }

  if (questoes.length === 0) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>

  if (finalizado) {
    return (
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <i className="bi bi-check-circle-fill text-success mb-3" style={{ fontSize: '4rem' }}></i>
            <h3 className="mb-3">Teste Concluído!</h3>
            <p className="text-muted mb-4">Suas respostas foram registradas com sucesso, {participante.identificacao}. Agradecemos sua participação nesta etapa.</p>
            
            <button className="btn btn-success w-100 py-3 mb-3 fw-bold" onClick={onContinuarEPC}>
              Continuar para a Escala (EPC) <i className="bi bi-arrow-right ms-2"></i>
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
              <h5 className="text-primary fw-bold mb-0">Questão {indiceAtual + 1} de {questoes.length}</h5>
              <span className="badge bg-light text-dark border">ID: {participante.identificacao}</span>
            </div>
            
            <div className="progress mb-4" style={{ height: '5px' }}>
              <div className="progress-bar bg-primary" role="progressbar" style={{ width: `${progresso}%` }}></div>
            </div>

            {/* MÁGICA ACONTECE AQUI: Renderização do Markdown com injeção de CSS do Bootstrap */}
            <div className="fs-6 mb-4 text-dark fw-medium">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  // Tabela continua centralizada e bonita
                  table: ({node, ...props}) => (
                    <div className="table-responsive my-4">
                      <table className="table table-bordered table-striped table-hover align-middle text-center shadow-sm" style={{ width: '100%' }} {...props} />
                    </div>
                  ),
                  thead: ({node, ...props}) => <thead className="table-dark" {...props} />,
                  th: ({node, ...props}) => <th className="p-3" {...props} />,
                  td: ({node, ...props}) => <td className="p-3" {...props} />,
                  
                  // Listas agora blindadas com text-start (alinhamento à esquerda)
                  ul: ({node, ...props}) => <ul className="mb-3 lh-lg text-start" style={{ paddingLeft: '2.5rem' }} {...props} />,
                  ol: ({node, ...props}) => <ol className="mb-3 lh-lg text-start" style={{ paddingLeft: '2.5rem' }} {...props} />,
                  li: ({node, ...props}) => <li className="mb-2 text-start" {...props} />,
                  
                  // Parágrafos garantidos à esquerda/justificados
                  p: ({node, ...props}) => <p className="mb-3 text-start" style={{ textAlign: 'justify' }} {...props} />
                  
                }}
              >
                {q.enunciado}
              </ReactMarkdown>
            </div>
            
            <div className="list-group gap-2 border-0 mb-4">
              {Object.entries(q.alternativas).map(([letra, texto]) => (
                <button 
                  key={letra} type="button" 
                  className={`list-group-item list-group-item-action rounded-3 border p-3 ${selecionada === letra ? 'active border-primary bg-primary bg-opacity-10 text-dark' : 'border-secondary-subtle'}`}
                  onClick={() => setRespostas({...respostas, [q.id]: letra})}
                >
                  <div className="d-flex align-items-start gap-3">
                    <span className={`fw-bold ${selecionada === letra ? 'text-primary' : 'text-muted'}`}>{letra})</span>
                    <span>{texto}</span>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="d-flex justify-content-between border-top pt-4">
              <button className="btn btn-light px-4" onClick={handleAnterior} disabled={indiceAtual === 0}>
                <i className="bi bi-chevron-left me-1"></i>Voltar
              </button>
              
              {indiceAtual + 1 === questoes.length ? (
                <button className="btn btn-primary px-4 fw-bold" onClick={handleFinalizar} disabled={salvando}>
                  {salvando ? "Salvando..." : <><i className="bi bi-check-lg me-1"></i>Finalizar TPC</>}
                </button>
              ) : (
                <button className="btn btn-primary px-4 fw-bold" onClick={() => { if(selecionada) handleProxima(); else alert("Selecione uma alternativa.") }}>
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