
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function ExcluirVale() {
  const [codigo, setCodigo] = useState('');
  const [vales, setVales] = useState([]);
  const [msg, setMsg] = useState('');

  const buscarVales = async () => {
    const { data } = await supabase.from('vales').select('*').eq('codigo', codigo);
    setVales(data || []);
  };

  const excluir = async (id, valor, dataOriginal) => {
    if (!confirm("Deseja realmente excluir este vale?")) return;
    const usuario = (await supabase.auth.getUser()).data.user.email;
    const original = vales.find(v => v.id === id);
    await supabase.from('vale_exclusoes').insert([{
      codigo, valor, data: dataOriginal, usuario
    }]);
    await supabase.from('vales').delete().eq('id', id);
    setMsg("Vale excluído.");
    buscarVales();
  };

  return (
    <div className='bg-gray-100 p-6 rounded shadow-md max-w-xl'>
      <h2 className='text-xl font-bold mb-4'>Excluir Vale</h2>
      <input className='border p-2 rounded w-full mb-2' placeholder='Código do cambista' value={codigo} onChange={e => setCodigo(e.target.value)} />
      <button className='bg-blue-600 text-white px-4 py-2 rounded mb-4' onClick={buscarVales}>Buscar Vales</button>
      {vales.map(v => (
        <div key={v.id} className='bg-white rounded shadow p-3 mb-2 flex justify-between'>
          <span>R$ {v.valor} - {v.data}</span>
          <button className='text-red-600' onClick={() => excluir(v.id, v.valor, v.data)}>Excluir</button>
        </div>
      ))}
      {msg && <p className='mt-4 font-semibold'>{msg}</p>}
    </div>
  );
}
