
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function TabelaMeta() {
  const [faixas, setFaixas] = useState([]);
  const [minimo, setMinimo] = useState('');
  const [maximo, setMaximo] = useState('');
  const [valor, setValor] = useState('');

  async function buscarFaixas() {
    const { data } = await supabase.from('tabela_meta').select('*').order('minimo', { ascending: true });
    setFaixas(data || []);
  }

  async function adicionarFaixa() {
    if (!minimo || !maximo || !valor) return;
    await supabase.from('tabela_meta').insert([{ minimo: Number(minimo), maximo: Number(maximo), valor: Number(valor) }]);
    setMinimo('');
    setMaximo('');
    setValor('');
    buscarFaixas();
  }

  useEffect(() => {
    buscarFaixas();
  }, []);

  return (
    <div className='p-4'>
      <h2 className='text-xl font-bold mb-4'>Cadastro de Tabela de Meta</h2>
      <div className='flex gap-2 mb-4'>
        <input type='number' className='border p-2' placeholder='Mínimo' value={minimo} onChange={e => setMinimo(e.target.value)} />
        <input type='number' className='border p-2' placeholder='Máximo' value={maximo} onChange={e => setMaximo(e.target.value)} />
        <input type='number' className='border p-2' placeholder='Valor (R$)' value={valor} onChange={e => setValor(e.target.value)} />
        <button onClick={adicionarFaixa} className='bg-blue-600 text-white px-4 rounded'>Adicionar</button>
      </div>
      <ul className='space-y-2'>
        {faixas.map(faixa => (
          <li key={faixa.id} className='bg-gray-100 p-2 rounded'>
            De R$ {faixa.minimo} a R$ {faixa.maximo} → Paga R$ {faixa.valor}
          </li>
        ))}
      </ul>
    </div>
  );
}
