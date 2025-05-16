
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function LancarVale() {
  const [codigo, setCodigo] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState('');
  const [obs, setObs] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = async () => {
    if (!codigo || !valor || !data) {
      setMsg("Preencha todos os campos.");
      return;
    }
    const { error } = await supabase.from('vales').insert([{ codigo, valor: parseFloat(valor), data, obs }]);
    if (!error) {
      setMsg("Vale lançado com sucesso!");
      setCodigo('');
      setValor('');
      setData('');
      setObs('');
    } else {
      setMsg("Erro ao lançar vale.");
    }
  };

  return (
    <div className='bg-gray-100 p-6 rounded shadow-md max-w-md'>
      <h2 className='text-xl font-bold mb-4'>Lançar Vale</h2>
      <input className='border p-2 rounded w-full mb-2' placeholder='Código do cambista' value={codigo} onChange={e => setCodigo(e.target.value)} />
      <input className='border p-2 rounded w-full mb-2' placeholder='Valor (R$)' type='number' value={valor} onChange={e => setValor(e.target.value)} />
      <input className='border p-2 rounded w-full mb-2' type='date' value={data} onChange={e => setData(e.target.value)} />
      <input className='border p-2 rounded w-full mb-2' placeholder='Observações' value={obs} onChange={e => setObs(e.target.value)} />
      <button className='bg-blue-600 text-white px-4 py-2 rounded' onClick={handleSubmit}>Confirmar Lançamento</button>
      {msg && <p className='mt-4 font-semibold'>{msg}</p>}
    </div>
  );
}
