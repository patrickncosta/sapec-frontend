export default function Contexto({ visivel, onClose }) {
  if (!visivel) return null;

  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 1050, padding: '15px' }}
    >
      {/* max-height de 90vh garante que não ultrapassa a tela */}
      <div className="card shadow-lg border-0 d-flex flex-column" style={{ maxWidth: '750px', width: '100%', maxHeight: '90vh' }}>
        
        <div className="card-header bg-white border-bottom-0 pt-4 pb-2 text-center flex-shrink-0">
          <i className="bi bi-info-circle text-info mb-2" style={{ fontSize: '2rem' }}></i>
          <h4 className="text-primary mb-0">Imagine o seguinte cenário</h4>
        </div>
        
        {/* overflow-auto permite rolar apenas o texto, preservando os botões */}
        <div className="card-body p-4 text-muted overflow-auto" style={{ fontSize: '1rem', lineHeight: '1.6' }}>
          <p className="text-justify">
            Uma escola pretende realizar uma feira cultural, a fim de divulgar seus cursos, seus ambientes, os professores e todas as oportunidades que futuros alunos terão nesse lugar. O evento será totalmente organizado e executado pelos atuais estudantes, que devem organizar todos os espaços, horários, atividades e proporcionar a melhor experiência para os visitantes.
          </p>
          <p className="text-justify">
            A escola conta com diversos cursos, cada um com 3 anos de duração. É imprescindível que todos os cursos e todas as séries se apresentem, para que os futuros alunos possam ter um vislumbre de toda oferta, além da atuação de cada ramo de estudo. Além disso, existem diversas salas e espaços que devem ser utilizados, além de equipamentos computacionais, experimentais, didáticos e decorativos que deverão compor a feira. 
          </p>
          <p className="text-justify">
            Além da organização dos espaços, apresentação dos trabalhos e necessidade de apresentação de todos os cursos e séries, existem outras restrições na organização da feira. Os espaços disponíveis e previamente agendados e ornamentados possuem tamanhos e estruturas distintas; alguns equipamentos estão disponíveis apenas em locais específicos e certas atividades não podem ocorrer de forma simultânea. É necessário que o horário das apresentações seja organizado, bem como a distribuição dos estudantes responsáveis por cada atividade e apresentação, além da garantia de que os visitantes possam conhecer todos os cursos e atividades durante o evento.
          </p>
          <p className="text-justify">
            Os responsáveis pela organização da feira possuem as informações relacionadas aos ambientes disponíveis, horários de realização, equipamentos a serem utilizados, atividades e apresentações que serão realizadas e organização do lanche para os visitantes. Entretanto, essas informações são extensas, numerosas e nem todas são necessárias para a tomada de decisões. Os estudantes, então, deverão organizar essas informações a fim de estabelecer prioridades e organizar as atividades de forma que a feira aconteça da melhor forma possível e proporcione uma ótima experiência aos visitantes.
          </p>
          <p className="text-justify">
            Durante o planejamento surgirão diferentes situações que exigem a análise das informações disponíveis para a tomada de decisões que solucionem os problemas apresentados. Diante deste cenário, serão apresentadas situações relacionadas à organização da feira cultural que devem ser solucionadas.
          </p>
          
        </div>

        <div className="card-footer bg-light border-top-0 p-3 text-center flex-shrink-0">
          <button className="btn btn-primary px-5 py-2 fw-bold" onClick={onClose}>
            <i className="bi bi-check2 me-2"></i>Compreendi, Voltar à Avaliação
          </button>
        </div>

      </div>
    </div>
  )
}