import { useState, useEffect } from 'react'
import { API_URL } from '../api'

export default function AdminCursosSeries() {
  const [cursos, setCursos] = useState([]); 
  const [series, setSeries] = useState([]);
  const [novoCurso, setNovoCurso] = useState(""); 
  const [novaSerie, setNovaSerie] = useState("");
  const [carregando, setCarregando] = useState(false);
  
  // Controles de Edição
  const [editando, setEditando] = useState({ tipo: null, id: null, nome: "" });

  const carregarDados = async () => {
    try {
      const resCursos = await fetch(`${API_URL}/cursos`); setCursos(await resCursos.json());
      const resSeries = await fetch(`${API_URL}/series`); setSeries(await resSeries.json());
    } catch (e) { console.error("Erro ao carregar dados", e); }
  }

  useEffect(() => { carregarDados() }, [])

  const handleAdicionar = async (tipo, valor, setValor) => {
    if (!valor.trim()) return;
    setCarregando(true)
    try {
      const res = await fetch(`${API_URL}/${tipo}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome: valor }) })
      if (res.ok) { setValor(""); carregarDados(); }
    } catch (error) { alert("Erro ao adicionar."); }
    setCarregando(false)
  }

  const handleExcluir = async (tipo, id) => {
    if (!window.confirm("Tem certeza que deseja excluir? Isso pode afetar participantes vinculados a este registo.")) return;
    try {
      const res = await fetch(`${API_URL}/${tipo}/${id}`, { method: 'DELETE' });
      if (res.ok) carregarDados();
    } catch (error) { alert("Erro ao excluir."); }
  }

  const handleSalvarEdicao = async () => {
    try {
      const res = await fetch(`${API_URL}/${editando.tipo}/${editando.id}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ nome: editando.nome }) 
      });
      if (res.ok) {
        setEditando({ tipo: null, id: null, nome: "" });
        carregarDados();
      }
    } catch (error) { alert("Erro ao salvar alteração."); }
  }

  const renderItem = (item, tipo) => {
    const isEditando = editando.tipo === tipo && editando.id === item.id;
    return (
      <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center py-3">
        {isEditando ? (
          <div className="input-group input-group-sm w-75">
            <input type="text" className="form-control" value={editando.nome} onChange={e => setEditando({...editando, nome: e.target.value})} />
            <button className="btn btn-success" onClick={handleSalvarEdicao}><i className="bi bi-check-lg"></i></button>
            <button className="btn btn-outline-secondary" onClick={() => setEditando({tipo: null, id: null, nome: ""})}><i className="bi bi-x-lg"></i></button>
          </div>
        ) : (
          <div>
            <span className="fw-medium me-2">{item.nome}</span>
            <span className="badge bg-light text-secondary border border-secondary-subtle rounded-pill">ID: {item.id}</span>
          </div>
        )}

        {!isEditando && (
          <div className="btn-group">
            <button className="btn btn-sm btn-outline-primary border-0" onClick={() => setEditando({ tipo, id: item.id, nome: item.nome })} title="Editar">
              <i className="bi bi-pencil-square"></i>
            </button>
            <button className="btn btn-sm btn-outline-danger border-0" onClick={() => handleExcluir(tipo, item.id)} title="Excluir">
              <i className="bi bi-trash3"></i>
            </button>
          </div>
        )}
      </li>
    )
  }

  return (
    <div>
      <h2 className="mb-1 text-primary">Cursos e Séries</h2>
      <p className="text-muted mb-4">Faça a gestão das turmas ativas na plataforma.</p>

      <div className="row">
        {/* COLUNA CURSOS */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-header bg-primary bg-opacity-10 border-0 pt-3 pb-2">
              <h5 className="mb-0 text-primary fw-bold"><i className="bi bi-book me-2"></i>Cursos Registados</h5>
            </div>
            <div className="card-body bg-light">
              <div className="input-group mb-3 shadow-sm">
                <input type="text" className="form-control border-0" placeholder="Novo curso (Ex: Informática)" value={novoCurso} onChange={e => setNovoCurso(e.target.value)} />
                <button className="btn btn-primary px-4 fw-bold" onClick={() => handleAdicionar('cursos', novoCurso, setNovoCurso)} disabled={carregando}>Adicionar</button>
              </div>
              <div className="card border-0 shadow-sm">
                <ul className="list-group list-group-flush">
                  {cursos.length === 0 && <li className="list-group-item text-muted text-center py-4">Nenhum curso registado.</li>}
                  {cursos.map(c => renderItem(c, 'cursos'))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA SÉRIES */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-header bg-success bg-opacity-10 border-0 pt-3 pb-2">
              <h5 className="mb-0 text-success fw-bold"><i className="bi bi-calendar3 me-2"></i>Séries / Anos Registados</h5>
            </div>
            <div className="card-body bg-light">
              <div className="input-group mb-3 shadow-sm">
                <input type="text" className="form-control border-0" placeholder="Nova série (Ex: 3º Ano)" value={novaSerie} onChange={e => setNovaSerie(e.target.value)} />
                <button className="btn btn-success px-4 fw-bold" onClick={() => handleAdicionar('series', novaSerie, setNovaSerie)} disabled={carregando}>Adicionar</button>
              </div>
              <div className="card border-0 shadow-sm">
                <ul className="list-group list-group-flush">
                  {series.length === 0 && <li className="list-group-item text-muted text-center py-4">Nenhuma série registada.</li>}
                  {series.map(s => renderItem(s, 'series'))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}