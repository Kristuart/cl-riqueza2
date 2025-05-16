
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function LancarDesconto() {
  const [codigo, setCodigo] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState('');
  const [motivo, setMotivo] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = async () => {
    if (!confirm("Confirmar lançamento do desconto?")) return;
    const { error } = await supabase.from('descontos').insert([{ codigo, valor: parseFloat(valor), data, motivo }]);
    if (!error) {
      setMsg("Desconto lançado!");
      setCodigo('');
      setValor('');
      setData('');
      setMotivo('');
    } else {
      setMsg("Erro ao lançar desconto.");
    }
  };

  return (
    <div className='bg-gray-100 p-6 rounded shadow-md max-w-md'>
      <h2 className='text-xl font-bold mb-4'>Lançar Desconto</h2>
      <input className='border p-2 rounded w-full mb-2' placeholder='Código do cambista' value={codigo} onChange={e => setCodigo(e.target.value)} />
      <input className='border p-2 rounded w-full mb-2' placeholder='Valor (R$)' type='number' value={valor} onChange={e => setValor(e.target.value)} />
      <input className='border p-2 rounded w-full mb-2' type='date' value={data} onChange={e => setData(e.target.value)} />
      <input className='border p-2 rounded w-full mb-2' placeholder='Motivo' value={motivo} onChange={e => setMotivo(e.target.value)} />
      <button className='bg-blue-600 text-white px-4 py-2 rounded' onClick={handleSubmit}>Lançar Desconto</button>
      {msg && <p className='mt-4 font-semibold'>{msg}</p>}
    </div>
  );
}
