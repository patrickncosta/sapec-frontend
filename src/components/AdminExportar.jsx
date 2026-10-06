import { useState } from 'react'
import { API_URL } from '../api'

export default function AdminExportar() {
  const [baixando, setBaixando] = useState(false)

  const gerarCSV = (dados, nomeArquivo) => {
    if (dados.length === 0) return alert("Sem dados.");
    const cabecalhos = Object.keys(dados[0]).join(";");
    const linhas = dados.map(item => Object.values(item).map(valor => typeof valor === 'string' ? `"${valor.replace(/\n/g, ' ')}"` : valor).join(";"));
    const csvString = cabecalhos + "\n" + linhas.join("\n");
    const blob = new Blob(["\uFEFF" + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.setAttribute("download", `${nomeArquivo}.csv`); document.body.appendChild(link); link.click(); document.body.removeChild(link);
  }

  const handleBaixar = async (modulo) => {
    setBaixando(true);
    try {
      const res = await fetch(`${API_URL}/resultados/${modulo}`);
      if (res.ok) gerarCSV(await res.json(), `SAPeC_${modulo.toUpperCase()}`);
    } catch (error) { alert("Erro."); } setBaixando(false);
  }

  return (
    <div>
      <h2 className="mb-1 text-primary">Exportação de Dados</h2>
      <p className="text-muted mb-4">Descarregue os resultados brutos em CSV.</p>

      <div className="row">
        <div className="col-md-4 mb-3">
          <div className="card text-center shadow-sm h-100">
            <div className="card-body d-flex flex-column justify-content-center">
              <h5 className="card-title text-primary"><i className="bi bi-ui-checks-grid d-block fs-1 mb-2"></i>TPC</h5>
              <button className="btn btn-outline-primary mt-auto" onClick={() => handleBaixar('tpc')} disabled={baixando}><i className="bi bi-download me-2"></i>Baixar</button>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card text-center shadow-sm h-100">
            <div className="card-body d-flex flex-column justify-content-center">
              <h5 className="card-title text-success"><i className="bi bi-list-ol d-block fs-1 mb-2"></i>EPC</h5>
              <button className="btn btn-outline-success mt-auto" onClick={() => handleBaixar('epc')} disabled={baixando}><i className="bi bi-download me-2"></i>Baixar</button>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card text-center shadow-sm h-100">
            <div className="card-body d-flex flex-column justify-content-center">
              <h5 className="card-title" style={{ color: '#8a2be2' }}><i className="bi bi-pencil-square d-block fs-1 mb-2"></i>Discursivas</h5>
              <button className="btn mt-auto text-white" style={{ backgroundColor: '#8a2be2' }} onClick={() => handleBaixar('discursivas')} disabled={baixando}><i className="bi bi-download me-2"></i>Baixar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}