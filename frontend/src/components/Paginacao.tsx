interface Props {
  paginaAtual: number;
  totalPaginas: number;
  onMudar: (pagina: number)=>void;
}

export default function Paginacao({paginaAtual, totalPaginas, onMudar}: Props){

    const paginas = Array.from({ length: totalPaginas }, (_, index) => index + 1);

    return(<div className="w-full justify-center">
        <div className="flex justify-center gap-2">

            <button className={`text-sm hover:bg-blue-900 px-3 py-1.5 rounded transition bg-gray-100`} disabled={paginaAtual === 1} onClick={()=>{onMudar(paginaAtual - 1)}}>
                ←
            </button>

            {paginas.map((pagina)=>(
                <button className={`text-sm hover:bg-blue-900 px-3 py-1.5 rounded transition ${pagina == paginaAtual ? 'bg-blue-700 text-white' : 'bg-gray-100'}`} onClick={()=>{onMudar(pagina)}}>
                    {pagina}
                </button>
            ))}

            <button className={`text-sm hover:bg-blue-900 px-3 py-1.5 rounded transition bg-gray-100`} disabled={paginaAtual === totalPaginas} onClick={()=>{onMudar(paginaAtual + 1)}}>
                →
            </button>

        </div>
    </div>);
}