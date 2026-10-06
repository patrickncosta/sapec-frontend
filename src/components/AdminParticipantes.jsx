import { useState, useEffect } from 'react'
import { API_URL } from '../api'

export default function AdminParticipantes() {
  const [participantes, setParticipantes] = useState([]); 
  const [cursos, setCursos] = useState([]); 
  const [series, setSeries] = useState([]);
  
  const [identificacao, setIdentificacao] = useState(""); 
  const [cursoId, setCursoId] = useState(""); 
  const [serieId, setSerieId] = useState("");
  const [salvando, setSalvando] = useState(false);

  const carregarDados = async () => {
    try {
      const [resP, resC, resS] = await Promise.all([fetch(`${API_URL}/participantes`), fetch(`${API_URL}/cursos`), fetch(`${API_URL}/series`)]);
      if (resP.ok) setParticipantes(await resP.json()); 
      if (resC.ok) setCursos(await resC.json()); 
      if (resS.ok) setSeries(await resS.json());
    } catch (error) { console.error("Erro ao carregar dados.") }
  }

  useEffect(() => { carregarDados() }, [])

  const handleCadastrar = async (e) => {
    e.preventDefault();
    if (!identificacao.trim() || !cursoId || !serieId) return alert("Preencha todos os campos.");
    setSalvando(true)
    try {
      const res = await fetch(`${API_URL}/participantes`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ identificacao: identificacao.toUpperCase(), curso_id: parseInt(cursoId), serie_id: parseInt(serieId) }) 
      });
      if (res.ok) { 
        setIdentificacao(""); setCursoId(""); setSerieId(""); carregarDados(); 
      } else { alert("Erro. Identificação já existente na base de dados?"); }
    } catch (error) { alert("Erro de conexão."); }
    setSalvando(false)
  }

  const handleExcluir = async (id, identificacao_aluno) => {
    if (!window.confirm(`ATENÇÃO: Deseja apagar o aluno ${identificacao_aluno}? Todas as respostas dele (se existirem) poderão ser perdidas.`)) return;
    
    try {
      const res = await fetch(`${API_URL}/participantes/${id}`, { method: 'DELETE' });
      if (res.ok) carregarDados();
    } catch (error) { alert("Erro ao tentar excluir participante."); }
  }

  // Função para pegar o nome do curso/série pelo ID para exibir na tabela
  const getNomeCurso = (id) => cursos.find(c => c.id === id)?.nome || id;
  const getNomeSerie = (id) => series.find(s => s.id === id)?.nome || id;

  return (
    <div>
      <h2 className="mb-1 text-primary">Participantes</h2>
      <p className="text-muted mb-4">Gere e faça a gestão dos códigos de acesso para as turmas.</p>

      <div className="card shadow-sm border-0 mb-4 bg-light">
        <div className="card-body p-4">
          <h6 className="mb-3 text-primary fw-bold"><i className="bi bi-person-plus-fill me-2"></i>Gerar Novo Acesso</h6>
          <form className="row g-3 align-items-center" onSubmit={handleCadastrar}>
            <div className="col-md-3">
              <input type="text" className="form-control border-0 shadow-sm" placeholder="ID (Ex: 3I001)" value={identificacao} onChange={e => setIdentificacao(e.target.value)} />
            </div>
            <div className="col-md-4">
              <select className="form-select border-0 shadow-sm" value={cursoId} onChange={e => setCursoId(e.target.value)}>
                <option value="">Selecione o Curso...</option>
                {cursos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select border-0 shadow-sm" value={serieId} onChange={e => setSerieId(e.target.value)}>
                <option value="">Selecione a Série...</option>
                {series.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-primary w-100 fw-bold shadow-sm" disabled={salvando}>
                {salvando ? "A salvar..." : "Cadastrar"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white pt-3 pb-2">
          <h6 className="mb-0 text-secondary fw-bold">Lista de Acessos Ativos ({participantes.length})</h6>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-muted">
                <tr>
                  <th className="ps-4">Identificação</th>
                  <th>Curso Vinculado</th>
                  <th>Série Vinculada</th>
                  <th className="text-end pe-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {participantes.length === 0 && <tr><td colSpan="4" className="text-center text-muted py-4">Nenhum registo encontrado.</td></tr>}
                {participantes.map(p => (
                  <tr key={p.id}>
                    <td className="ps-4 fw-bold text-primary">{p.identificacao}</td>
                    <td>{getNomeCurso(p.curso_id)}</td>
                    <td>{getNomeSerie(p.serie_id)}</td>
                    <td className="text-end pe-4">
                      <button 
                        className="btn btn-sm btn-outline-danger border-0" 
                        onClick={() => handleExcluir(p.id, p.identificacao)}
                        title="Excluir Aluno"
                      >
                        <i className="bi bi-trash3"></i> Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}