
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function ControleDescontos() {
  const [descontos, setDescontos] = useState([]);
  const [detalhes, setDetalhes] = useState({});
  const [codigoAberto, setCodigoAberto] = useState(null);

  useEffect(() => {
    async function fetchDescontos() {
      const { data } = await supabase.from('descontos').select('*');
      setDescontos(data || []);
    }
    fetchDescontos();
  }, []);

  const codigosUnicos = [...new Set(descontos.map(d => d.codigo))];

  const calcularTotal = (codigo) => {
    return descontos
      .filter(d => d.codigo === codigo)
      .reduce((acc, curr) => acc + parseFloat(curr.valor), 0);
  };

  const verDetalhes = (codigo) => {
    const lista = descontos
      .filter(d => d.codigo === codigo)
      .sort((a, b) => new Date(b.data) - new Date(a.data));
    setDetalhes({ ...detalhes, [codigo]: lista });
    setCodigoAberto(codigo === codigoAberto ? null : codigo);
  };

  return (
    <div className='bg-gray-100 p-6 rounded shadow-md'>
      <h2 className='text-xl font-bold mb-4'>Controle de Descontos</h2>
      <ul className='grid grid-cols-2 gap-2'>
        {codigosUnicos.map(codigo => {
          const total = calcularTotal(codigo);
          const cor = total === 0 ? 'text-green-600' : 'text-red-600';
          return (
            <li key={codigo} className='bg-white px-3 py-2 rounded shadow text-sm'>
              <div className='flex justify-between items-center cursor-pointer' onClick={() => verDetalhes(codigo)}>
                <span className='font-medium'>Código: {codigo}</span>
                <span className={`${cor} font-bold`}>R$ {total.toFixed(2)}</span>
              </div>
              {codigoAberto === codigo && detalhes[codigo] && (
                <div className='mt-2 bg-gray-50 p-2 rounded'>
                  <p className='text-xs font-semibold mb-1'>Detalhamento:</p>
                  <ul className='text-xs space-y-1 max-h-32 overflow-y-auto'>
                    {detalhes[codigo].map((d, i) => (
                      <li key={i} className='border-b py-1'>
                        <strong>Data:</strong> {d.data} | <strong>R$</strong> {d.valor.toFixed(2)}<br />
                        <strong>Motivo:</strong> {d.motivo || '---'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
