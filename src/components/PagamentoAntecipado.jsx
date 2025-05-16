
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function PagamentoAntecipado() {
  const [codigo, setCodigo] = useState('');
  const [saldo, setSaldo] = useState(null);
  const [valor, setValor] = useState('');
  const [data, setData] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const fetchSaldo = async () => {
      if (!codigo) return;
      const { data } = await supabase.from('vales').select('*').eq('codigo', codigo);
      const total = data.reduce((acc, v) => acc + parseFloat(v.valor), 0);
      setSaldo(total);
    };
    fetchSaldo();
  }, [codigo]);

  const handleSubmit = async () => {
    if (!confirm("Confirmar pagamento antecipado?")) return;
    const usuario = (await supabase.auth.getUser()).data.user.email;
    await supabase.from('vale_pagamentos').insert([{ codigo, valor: parseFloat(valor), data, usuario }]);
    await supabase.from('vales').insert([{ codigo, valor: -parseFloat(valor), data, obs: "Pagamento antecipado" }]);
    setMsg("Pagamento registrado!");
    setCodigo('');
    setValor('');
    setData('');
    setSaldo(null);
  };

  return (
    <div className='bg-gray-100 p-6 rounded shadow-md max-w-md'>
      <h2 className='text-xl font-bold mb-4'>Pagamento Antecipado de Vale</h2>
      <input className='border p-2 rounded w-full mb-2' placeholder='Código do cambista' value={codigo} onChange={e => setCodigo(e.target.value)} />
      {saldo !== null && <p className='text-sm mb-2'>Saldo atual: R$ {saldo.toFixed(2)}</p>}
      <input className='border p-2 rounded w-full mb-2' placeholder='Valor pago (R$)' type='number' value={valor} onChange={e => setValor(e.target.value)} />
      <input className='border p-2 rounded w-full mb-2' type='date' value={data} onChange={e => setData(e.target.value)} />
      <button className='bg-blue-600 text-white px-4 py-2 rounded' onClick={handleSubmit}>Confirmar Pagamento</button>
      {msg && <p className='mt-4 font-semibold'>{msg}</p>}
    </div>
  );
}
