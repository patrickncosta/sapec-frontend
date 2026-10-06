import { useState, useEffect } from 'react'
import { API_URL } from '../api'

export default function AdminQuestoes() {
  const [moduloAtivo, setModuloAtivo] = useState('tpc')
  const [salvando, setSalvando] = useState(false)
  const [listaQuestoes, setListaQuestoes] = useState([])

  const [tpc, setTpc] = useState({ enunciado: '', habilidade: '', dificuldade: '', gabarito: 'A', fundamentacao: '' })
  const [alts, setAlts] = useState({ A: '', B: '', C: '', D: '', E: '' })
  const [epc, setEpc] = useState({ numero: '', habilidade: '', afirmacao: '' })
  const [disc, setDisc] = useState({ enunciado: '', objetivo: '' })

  const carregarLista = async (modulo) => {
    try { const res = await fetch(`${API_URL}/questoes/${modulo}`); if (res.ok) setListaQuestoes(await res.json()); } catch (e) { console.error(e) }
  }

  useEffect(() => { carregarLista(moduloAtivo) }, [moduloAtivo])

  const handleSalvarTPC = async () => {
    if (!tpc.enunciado || !alts.A) return alert("Preencha os campos obrigatórios."); setSalvando(true);
    try {
      const res = await fetch(`${API_URL}/questoes/tpc`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...tpc, alternativas: alts }) });
      if (res.ok) { alert("Inserida!"); setTpc({ enunciado: '', habilidade: '', dificuldade: '', gabarito: 'A', fundamentacao: '' }); setAlts({ A: '', B: '', C: '', D: '', E: '' }); carregarLista('tpc'); }
    } catch (e) { alert("Erro"); } setSalvando(false);
  }

  // Lógica de Salvar EPC e Disc (resumida para manter concisão - adapte os alertas se necessário)
  const handleSalvarEPC = async () => {
    setSalvando(true);
    const res = await fetch(`${API_URL}/questoes/epc`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ numero: parseInt(epc.numero), habilidade: epc.habilidade, afirmacao: epc.afirmacao }) });
    if (res.ok) { setEpc({ numero: '', habilidade: '', afirmacao: '' }); carregarLista('epc'); } setSalvando(false);
  }
  const handleSalvarDisc = async () => {
    setSalvando(true);
    const res = await fetch(`${API_URL}/questoes/discursivas`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(disc) });
    if (res.ok) { setDisc({ enunciado: '', objetivo: '' }); carregarLista('discursivas'); } setSalvando(false);
  }

  return (
    <div>
      <h2 className="mb-1 text-primary">Banco de Questões</h2>
      <p className="text-muted mb-4">Gerencie os itens de avaliação da plataforma.</p>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item"><button className={`nav-link ${moduloAtivo === 'tpc' ? 'active' : ''}`} onClick={() => setModuloAtivo('tpc')}>TPC</button></li>
        <li className="nav-item"><button className={`nav-link ${moduloAtivo === 'epc' ? 'active' : ''}`} onClick={() => setModuloAtivo('epc')}>EPC</button></li>
        <li className="nav-item"><button className={`nav-link ${moduloAtivo === 'discursivas' ? 'active' : ''}`} onClick={() => setModuloAtivo('discursivas')}>Discursivas</button></li>
      </ul>

      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white"><h5 className="mb-0">Nova Questão</h5></div>
            <div className="card-body">
              
              {moduloAtivo === 'tpc' && (
                <div className="d-flex flex-column gap-3">
                  <textarea className="form-control" rows="3" placeholder="Enunciado..." value={tpc.enunciado} onChange={e => setTpc({...tpc, enunciado: e.target.value})} />
                  <div className="row">
                    <div className="col-6"><input className="form-control" placeholder="Habilidade" value={tpc.habilidade} onChange={e => setTpc({...tpc, habilidade: e.target.value})} /></div>
                    <div className="col-6"><input className="form-control" placeholder="Dificuldade" value={tpc.dificuldade} onChange={e => setTpc({...tpc, dificuldade: e.target.value})} /></div>
                  </div>
                  <div className="p-3 bg-light rounded">
                    <strong>Alternativas:</strong>
                    {['A', 'B', 'C', 'D', 'E'].map(letra => (
                      <div key={letra} className="input-group input-group-sm mt-2">
                        <span className="input-group-text fw-bold">{letra})</span>
                        <input type="text" className="form-control" value={alts[letra]} onChange={e => setAlts({...alts, [letra]: e.target.value})} />
                      </div>
                    ))}
                  </div>
                  <select className="form-select" value={tpc.gabarito} onChange={e => setTpc({...tpc, gabarito: e.target.value})}>
                    {['A', 'B', 'C', 'D', 'E'].map(l => <option key={l} value={l}>Gabarito: {l}</option>)}
                  </select>
                  <button className="btn btn-primary" onClick={handleSalvarTPC} disabled={salvando}>Salvar Questão</button>
                </div>
              )}

              {/* Formulários EPC e Discursivas simplificados com classes BS5 */}
              {moduloAtivo === 'epc' && (
                <div className="d-flex flex-column gap-3">
                  <input className="form-control" type="number" placeholder="Nº do Item" value={epc.numero} onChange={e => setEpc({...epc, numero: e.target.value})} />
                  <input className="form-control" placeholder="Habilidade" value={epc.habilidade} onChange={e => setEpc({...epc, habilidade: e.target.value})} />
                  <textarea className="form-control" rows="3" placeholder="Afirmação" value={epc.afirmacao} onChange={e => setEpc({...epc, afirmacao: e.target.value})} />
                  <button className="btn btn-success" onClick={handleSalvarEPC} disabled={salvando}>Salvar Item</button>
                </div>
              )}

              {moduloAtivo === 'discursivas' && (
                <div className="d-flex flex-column gap-3">
                  <textarea className="form-control" rows="4" placeholder="Enunciado" value={disc.enunciado} onChange={e => setDisc({...disc, enunciado: e.target.value})} />
                  <input className="form-control" placeholder="Objetivo" value={disc.objetivo} onChange={e => setDisc({...disc, objetivo: e.target.value})} />
                  <button className="btn text-white" style={{ backgroundColor: '#8a2be2' }} onClick={handleSalvarDisc} disabled={salvando}>Salvar Discursiva</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white"><h5 className="mb-0">Lista ({listaQuestoes.length})</h5></div>
            <ul className="list-group list-group-flush overflow-auto" style={{ maxHeight: '500px' }}>
              {listaQuestoes.map(q => (
                <li key={q.id} className="list-group-item">
                  <small className="text-muted d-block">ID: {q.id} | Hab: {q.habilidade || q.objetivo}</small>
                  <span>{q.enunciado || q.afirmacao}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}