
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function ExcluirDesconto() {
  const [codigo, setCodigo] = useState('');
  const [descontos, setDescontos] = useState([]);
  const [msg, setMsg] = useState('');

  const buscarDescontos = async () => {
    const { data } = await supabase.from('descontos').select('*').eq('codigo', codigo);
    setDescontos(data || []);
  };

  const excluir = async (id, valor, dataDesconto, motivo) => {
    if (!confirm("Deseja realmente excluir este desconto?")) return;
    const usuario = (await supabase.auth.getUser()).data.user.email;
    await supabase.from('descontos_excluidos').insert([{
      codigo, valor, data: dataDesconto, motivo, usuario
    }]);
    await supabase.from('descontos').delete().eq('id', id);
    setMsg("Desconto excluído.");
    buscarDescontos();
  };

  return (
    <div className='bg-gray-100 p-6 rounded shadow-md max-w-xl'>
      <h2 className='text-xl font-bold mb-4'>Excluir Desconto</h2>
      <input className='border p-2 rounded w-full mb-2' placeholder='Código do cambista' value={codigo} onChange={e => setCodigo(e.target.value)} />
      <button className='bg-blue-600 text-white px-4 py-2 rounded mb-4' onClick={buscarDescontos}>Buscar Descontos</button>
      {descontos.map(d => (
        <div key={d.id} className='bg-white rounded shadow p-3 mb-2 flex justify-between'>
          <span>R$ {d.valor} - {d.data} | {d.motivo}</span>
          <button className='text-red-600' onClick={() => excluir(d.id, d.valor, d.data, d.motivo)}>Excluir</button>
        </div>
      ))}
      {msg && <p className='mt-4 font-semibold'>{msg}</p>}
    </div>
  );
}
