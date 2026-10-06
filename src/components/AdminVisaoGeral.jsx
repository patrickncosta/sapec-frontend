import { useState, useEffect } from 'react'
import { API_URL } from '../api'

export default function AdminVisaoGeral() {
  const [carregando, setCarregando] = useState(true)
  const [turmas, setTurmas] = useState([])
  const [totalQuestoesTpc, setTotalQuestoesTpc] = useState(0)
  
  const [resumo, setResumo] = useState({ totalParticipantes: 0, concluiramTPC: 0, concluiramEPC: 0, concluiramDisc: 0 })
  const [turmaSelecionada, setTurmaSelecionada] = useState(null)
  const [termoBuscaAluno, setTermoBuscaAluno] = useState("")

  useEffect(() => {
    const buscarDadosProcessados = async () => {
      try {
        const [reqPart, reqCursos, reqSeries, reqTpc, reqEpc, reqDisc, reqQTpc, reqQDisc] = await Promise.all([
          fetch(`${API_URL}/participantes`),
          fetch(`${API_URL}/cursos`),
          fetch(`${API_URL}/series`),
          fetch(`${API_URL}/resultados/tpc`),
          fetch(`${API_URL}/resultados/epc`),
          fetch(`${API_URL}/resultados/discursivas`),
          fetch(`${API_URL}/questoes/tpc`),
          fetch(`${API_URL}/questoes/discursivas`)
        ]);

        const part = await reqPart.json();
        const cursos = await reqCursos.json();
        const series = await reqSeries.json();
        const resTpc = await reqTpc.json();
        const resEpc = await reqEpc.json();
        const resDisc = await reqDisc.json();
        const qTpc = await reqQTpc.json();
        const qDisc = await reqQDisc.json();

        setTotalQuestoesTpc(qTpc.length);

        const alunosProcessados = part.map(p => {
          const curso = cursos.find(c => c.id === p.curso_id)?.nome || 'Desconhecido';
          const serie = series.find(s => s.id === p.serie_id)?.nome || 'Desconhecido';
          const nomeTurma = `${serie} - ${curso}`;

          // --- PROCESSAMENTO TPC ---
          const respostasTpcAluno = resTpc.filter(r => r.participante_id === p.id);
          let corretasTpc = 0;
          respostasTpcAluno.forEach(r => {
            const questao = qTpc.find(q => q.id === r.questao_tpc_id);
            if (questao && questao.gabarito === r.respostaSelecionada) corretasTpc++;
          });
          const fezTpc = respostasTpcAluno.length > 0;

          // --- PROCESSAMENTO EPC (CORRIGIDO E À PROVA DE FALHAS) ---
          const respostasEpcAluno = resEpc.filter(r => r.participante_id === p.id);
          let somaEpc = 0;
          
          respostasEpcAluno.forEach(r => {
            // Tenta adivinhar qual é o nome da coluna no seu SQLAlchemy (main.py)
            let valorLikert = r.resposta_escala ?? r.valor ?? r.resposta ?? r.respostaEscala ?? r.escala;
            
            // Se mesmo assim não encontrar, varre o objeto procurando por um número solto (1 a 5)
            if (valorLikert === undefined || isNaN(valorLikert)) {
               const provavelValor = Object.values(r).find(v => typeof v === 'number' && v >= 1 && v <= 5 && v !== r.id && v !== r.participante_id && v !== r.questao_epc_id);
               valorLikert = provavelValor || 0;
            }
            somaEpc += Number(valorLikert);
          });
          const fezEpc = respostasEpcAluno.length > 0;

          // --- PROCESSAMENTO DISCURSIVAS ---
          const respostasDiscAluno = resDisc.filter(r => r.participante_id === p.id);
          const discursivas = respostasDiscAluno.map(r => {
            const questao = qDisc.find(q => q.id === r.questao_discursiva || q.id === r.questao_discursiva_id); 
            return {
              pergunta: questao ? questao.enunciado : 'Questão não encontrada',
              resposta: r.respostaEscrita || r.resposta || r.texto
            };
          });
          const fezDisc = respostasDiscAluno.length > 0;

          return {
            id: p.id,
            identificacao: p.identificacao,
            turma: nomeTurma,
            tpc: { fez: fezTpc, corretas: corretasTpc },
            epc: { fez: fezEpc, soma: somaEpc },
            disc: { fez: fezDisc, respostas: discursivas }
          };
        });

        // Atualiza a barra global de progresso (Resumo Superior)
        setResumo({
          totalParticipantes: part.length,
          concluiramTPC: alunosProcessados.filter(a => a.tpc.fez).length,
          concluiramEPC: alunosProcessados.filter(a => a.epc.fez).length,
          concluiramDisc: alunosProcessados.filter(a => a.disc.fez).length
        });

        // Agrupamento por turmas para a tabela
        const turmasAgrupadas = {};
        alunosProcessados.forEach(aluno => {
          if (!turmasAgrupadas[aluno.turma]) {
            turmasAgrupadas[aluno.turma] = { nome: aluno.turma, alunos: [], somaNotasTpc: 0, countTpc: 0, somaNotasEpc: 0, countEpc: 0 };
          }
          
          const grupo = turmasAgrupadas[aluno.turma];
          grupo.alunos.push(aluno);
          
          if (aluno.tpc.fez) {
            grupo.somaNotasTpc += aluno.tpc.corretas;
            grupo.countTpc++;
          }
          if (aluno.epc.fez) {
            grupo.somaNotasEpc += aluno.epc.soma;
            grupo.countEpc++;
          }
        });

        const listaFinalTurmas = Object.values(turmasAgrupadas).map(t => ({
          ...t,
          mediaTpc: t.countTpc > 0 ? (t.somaNotasTpc / t.countTpc).toFixed(1) : '-',
          mediaEpc: t.countEpc > 0 ? (t.somaNotasEpc / t.countEpc).toFixed(1) : '-'
        })).sort((a, b) => a.nome.localeCompare(b.nome));

        setTurmas(listaFinalTurmas);
        setCarregando(false);
      } catch (error) {
        console.error("Erro ao processar dados de visão geral:", error);
        setCarregando(false);
      }
    };

    buscarDadosProcessados();
  }, []);

  if (carregando) return <div className="spinner-border text-primary m-4" role="status"></div>;

  return (
    <div>
      <h2 className="mb-1 text-primary">Análise por Turmas</h2>
      <p className="text-muted mb-4">Acompanhe as médias de desempenho por classe e inspecione resultados individuais.</p>

      {/* BLOCO: Progresso Geral (Barras) */}
      <div className="card shadow-sm mb-4 border-0">
        <div className="card-body bg-light rounded">
          <h6 className="card-title text-secondary border-bottom pb-2 mb-3">Conclusão Geral na Plataforma</h6>
          <div className="row">
            <div className="col-md-4 mb-3 mb-md-0">
              <div className="d-flex justify-content-between small fw-bold mb-1">
                <span className="text-primary">Módulo TPC</span>
                <span>{resumo.concluiramTPC} / {resumo.totalParticipantes}</span>
              </div>
              <div className="progress" style={{ height: '6px' }}>
                <div className="progress-bar bg-primary" style={{ width: `${resumo.totalParticipantes ? (resumo.concluiramTPC/resumo.totalParticipantes)*100 : 0}%` }}></div>
              </div>
            </div>
            <div className="col-md-4 mb-3 mb-md-0">
              <div className="d-flex justify-content-between small fw-bold mb-1">
                <span className="text-success">Módulo EPC</span>
                <span>{resumo.concluiramEPC} / {resumo.totalParticipantes}</span>
              </div>
              <div className="progress" style={{ height: '6px' }}>
                <div className="progress-bar bg-success" style={{ width: `${resumo.totalParticipantes ? (resumo.concluiramEPC/resumo.totalParticipantes)*100 : 0}%` }}></div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="d-flex justify-content-between small fw-bold mb-1">
                <span style={{ color: '#8a2be2' }}>Discursivas</span>
                <span>{resumo.concluiramDisc} / {resumo.totalParticipantes}</span>
              </div>
              <div className="progress" style={{ height: '6px' }}>
                <div className="progress-bar" style={{ backgroundColor: '#8a2be2', width: `${resumo.totalParticipantes ? (resumo.concluiramDisc/resumo.totalParticipantes)*100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela Resumo das Turmas */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-secondary">
                <tr>
                  <th className="ps-4">Série e Curso</th>
                  <th className="text-center">Total de Alunos</th>
                  <th className="text-center">Média TPC (Corretas)</th>
                  <th className="text-center">Média EPC (Soma Likert)</th>
                  <th className="text-end pe-4">Ação</th>
                </tr>
              </thead>
              <tbody>
                {turmas.length === 0 && <tr><td colSpan="5" className="text-center py-4 text-muted">Nenhuma turma registada.</td></tr>}
                {turmas.map((turma, idx) => (
                  <tr key={idx}>
                    <td className="ps-4 fw-bold text-primary">{turma.nome}</td>
                    <td className="text-center">{turma.alunos.length}</td>
                    <td className="text-center fw-semibold">
                      {turma.mediaTpc !== '-' ? <span className="text-dark">{turma.mediaTpc} <small className="text-muted">/ {totalQuestoesTpc}</small></span> : <span className="text-muted">-</span>}
                    </td>
                    <td className="text-center fw-semibold text-success">{turma.mediaEpc}</td>
                    <td className="text-end pe-4">
                      <button 
                        className="btn btn-sm btn-outline-primary fw-bold" 
                        onClick={() => { setTurmaSelecionada(turma); setTermoBuscaAluno(""); }}
                      >
                        <i className="bi bi-search me-1"></i> Ver Alunos
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL DE DETALHES INDIVIDUAIS DA TURMA */}
      {turmaSelecionada && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050, padding: '20px' }}>
          
          <div className="card shadow-lg border-0 d-flex flex-column" style={{ maxWidth: '900px', width: '100%', maxHeight: '90vh' }}>
            
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center pt-3 pb-3 flex-shrink-0">
              <h5 className="mb-0"><i className="bi bi-people-fill me-2"></i>Resultados: {turmaSelecionada.nome}</h5>
              <button className="btn-close btn-close-white" onClick={() => setTurmaSelecionada(null)}></button>
            </div>

            <div className="card-body overflow-auto bg-light p-4">
              
              <div className="mb-4">
                <input 
                  type="text" 
                  className="form-control shadow-sm border-0" 
                  placeholder="Pesquisar identificação do aluno..." 
                  value={termoBuscaAluno}
                  onChange={(e) => setTermoBuscaAluno(e.target.value)}
                />
              </div>

              <div className="d-flex flex-column gap-3">
                {turmaSelecionada.alunos
                  .filter(a => a.identificacao.toLowerCase().includes(termoBuscaAluno.toLowerCase()))
                  .map(aluno => (
                  <div key={aluno.id} className="card border-0 shadow-sm">
                    <div className="card-header bg-white d-flex flex-column flex-md-row justify-content-between align-items-md-center pt-3 pb-2 border-bottom-0">
                      <h5 className="text-primary fw-bold mb-2 mb-md-0">{aluno.identificacao}</h5>
                      
                      {/* Alertas de não preenchimento */}
                      <div className="d-flex gap-2 flex-wrap">
                        {!aluno.tpc.fez && <span className="badge bg-danger bg-opacity-10 text-danger border border-danger">Falta TPC</span>}
                        {!aluno.epc.fez && <span className="badge bg-danger bg-opacity-10 text-danger border border-danger">Falta EPC</span>}
                        {!aluno.disc.fez && <span className="badge bg-danger bg-opacity-10 text-danger border border-danger">Falta Discursivas</span>}
                      </div>
                    </div>
                    
                    <div className="card-body pt-0">
                      <div className="row mb-3">
                        <div className="col-md-6 mb-2 mb-md-0">
                          <div className="p-3 rounded bg-light border border-primary border-opacity-25">
                            <span className="text-muted d-block small mb-1">Módulo TPC</span>
                            {aluno.tpc.fez 
                              ? <span className="fw-bold fs-5 text-primary">{aluno.tpc.corretas} <span className="fs-6 text-muted fw-normal">/ {totalQuestoesTpc} corretas</span></span> 
                              : <span className="text-muted fst-italic">Não respondeu</span>}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="p-3 rounded bg-light border border-success border-opacity-25">
                            <span className="text-muted d-block small mb-1">Módulo EPC</span>
                            {aluno.epc.fez 
                              ? <span className="fw-bold fs-5 text-success">{aluno.epc.soma} <span className="fs-6 text-muted fw-normal">pontos (soma)</span></span> 
                              : <span className="text-muted fst-italic">Não respondeu</span>}
                          </div>
                        </div>
                      </div>

                      {/* Secção de Discursivas */}
                      <div className="mt-4">
                        <h6 className="border-bottom pb-2" style={{ color: '#8a2be2' }}><i className="bi bi-pencil-square me-2"></i>Respostas Discursivas</h6>
                        {!aluno.disc.fez && <p className="text-muted small fst-italic mt-2">Nenhuma resposta submetida.</p>}
                        
                        {aluno.disc.respostas.map((disc, i) => (
                          <div key={i} className="mt-3">
                            <strong className="d-block text-dark small mb-1">Q{i+1}. {disc.pergunta}</strong>
                            <div className="p-3 bg-light rounded text-muted fst-italic" style={{ fontSize: '0.95rem' }}>
                              "{disc.resposta}"
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  </div>
                ))}
                
                {turmaSelecionada.alunos.filter(a => a.identificacao.toLowerCase().includes(termoBuscaAluno.toLowerCase())).length === 0 && (
                  <div className="text-center py-4 text-muted">Nenhum aluno encontrado com essa identificação.</div>
                )}
              </div>
            </div>

            <div className="card-footer bg-white text-end p-3 flex-shrink-0">
              <button className="btn btn-secondary px-4 fw-bold" onClick={() => setTurmaSelecionada(null)}>Fechar</button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  )
}