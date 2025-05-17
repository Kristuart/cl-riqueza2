
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function FolhaPagamento() {
  const [areaSelecionada, setAreaSelecionada] = useState('');
  const [dataDezena, setDataDezena] = useState('');
  const [areas, setAreas] = useState([]);
  const [cambistas, setCambistas] = useState([]);
  const [iniciar, setIniciar] = useState(false);

  useEffect(() => {
    async function fetchAreas() {
      const { data } = await supabase.from('areas').select('*');
      setAreas(data || []);
    }
    fetchAreas();
  }, []);

  const buscarCambistas = async () => {
    const { data } = await supabase.from('cambistas').select('*').eq('area', areaSelecionada);
    setCambistas(data || []);
    setIniciar(true);
  };

  return (
    <div className='bg-gray-100 p-6 rounded shadow-md'>
      <h2 className='text-xl font-bold mb-4'>Folha de Pagamento</h2>
      <div className='flex flex-col md:flex-row gap-4 mb-4'>
        <select className='border p-2 rounded w-full md:w-1/3' value={areaSelecionada} onChange={e => setAreaSelecionada(e.target.value)}>
          <option value=''>Selecione a área</option>
          {areas.map(a => (
            <option key={a.codigo} value={a.codigo}>{a.codigo}</option>
          ))}
        </select>
        <input type='date' className='border p-2 rounded w-full md:w-1/3' value={dataDezena} onChange={e => setDataDezena(e.target.value)} />
        <button className='bg-blue-600 text-white px-4 py-2 rounded' onClick={buscarCambistas}>Iniciar Pagamento</button>
      </div>

      {iniciar && (
        <div className='overflow-auto'>
          <table className='table-auto w-full text-sm bg-white rounded shadow'>
            <thead>
              <tr className='bg-gray-200 text-left'>
                <th className='p-2'>Código</th>
                <th className='p-2'>Nome</th>
                <th className='p-2'>Venda</th>
                <th className='p-2'>Tipo</th>
                <th className='p-2'>Salário</th>
                <th className='p-2'>Saldo Vale</th>
                <th className='p-2'>Vale</th>
                <th className='p-2'>Desconto</th>
                <th className='p-2'>Líquido</th>
              </tr>
            </thead>
            <tbody>
              {cambistas.map(c => (
                <tr key={c.codigo}>
                  <td className='border p-2'>{c.codigo}</td>
                  <td className='border p-2'>{c.nome}</td>
                  <td className='border p-2'><input type='number' className='border rounded p-1 w-24' /></td>
                  <td className='border p-2'>{c.tipo}</td>
                  <td className='border p-2'>--</td>
                  <td className='border p-2'>--</td>
                  <td className='border p-2'><input type='number' className='border rounded p-1 w-24' /></td>
                  <td className='border p-2'>--</td>
                  <td className='border p-2 font-bold'>--</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
