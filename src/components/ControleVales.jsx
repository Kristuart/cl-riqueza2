
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function ControleVales() {
  const [cambistas, setCambistas] = useState([]);
  const [vales, setVales] = useState([]);
  const [detalhes, setDetalhes] = useState({});
  const [codigoSelecionado, setCodigoSelecionado] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const { data: cambistasData } = await supabase.from('cambistas').select('codigo');
      const { data: valesData } = await supabase.from('vales').select('*');
      setCambistas(cambistasData || []);
      setVales(valesData || []);
    }
    fetchData();
  }, []);

  function calcularSaldo(codigo) {
    return vales
      .filter(v => v.codigo === codigo)
      .reduce((acc, curr) => acc + parseFloat(curr.valor), 0);
  }

  function verDetalhes(codigo) {
    const lista = vales
      .filter(v => v.codigo === codigo)
      .sort((a, b) => new Date(b.data) - new Date(a.data));
    setDetalhes({ ...detalhes, [codigo]: lista });
    setCodigoSelecionado(codigo === codigoSelecionado ? null : codigo);
  }

  return (
    <div className='bg-gray-100 p-6 rounded shadow-md'>
      <h2 className='text-xl font-bold mb-4'>Controle de Vales</h2>
      <ul className='grid grid-cols-2 gap-2'>
        {cambistas.map(c => {
          const saldo = calcularSaldo(c.codigo);
          const cor = saldo === 0 ? 'text-green-600' : 'text-red-600';
          return (
            <li key={c.codigo} className='bg-white px-3 py-2 rounded shadow text-sm'>
              <div className='flex justify-between items-center cursor-pointer' onClick={() => verDetalhes(c.codigo)}>
                <span className='font-medium'>Código: {c.codigo}</span>
                <span className={`${cor} font-bold`}>R$ {saldo.toFixed(2)}</span>
              </div>
              {codigoSelecionado === c.codigo && detalhes[c.codigo] && (
                <div className='mt-2 bg-gray-50 p-2 rounded'>
                  <p className='text-xs font-semibold mb-1'>Detalhamento:</p>
                  <ul className='text-xs space-y-1 max-h-32 overflow-y-auto'>
                    {detalhes[c.codigo].map((v, i) => (
                      <li key={i} className='border-b py-1'>
                        <strong>Data:</strong> {v.data} | <strong>R$</strong> {v.valor.toFixed(2)}<br />
                        <strong>Obs:</strong> {v.obs || '---'}
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
