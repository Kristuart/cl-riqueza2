
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function TabelaMeta() {
  const [faixas, setFaixas] = useState([]);
  const [minimo, setMinimo] = useState('');
  const [maximo, setMaximo] = useState('');
  const [valor, setValor] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [editFaixa, setEditFaixa] = useState({});

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

  async function salvarEdicao(id) {
    await supabase.from('tabela_meta').update(editFaixa).eq('id', id);
    setEditandoId(null);
    setEditFaixa({});
    buscarFaixas();
  }

  useEffect(() => {
    buscarFaixas();
  }, []);

  return (
    <div className='flex gap-6 bg-gray-100 p-6 rounded'>
      <div className='w-1/2'>
        <h2 className='text-xl font-bold mb-4'>Cadastrar Faixa de Meta</h2>
        <div className='space-y-3'>
          <input type='number' className='w-full border p-2 rounded' placeholder='Mínimo da venda' value={minimo} onChange={e => setMinimo(e.target.value)} />
          <input type='number' className='w-full border p-2 rounded' placeholder='Máximo da venda' value={maximo} onChange={e => setMaximo(e.target.value)} />
          <input type='number' className='w-full border p-2 rounded' placeholder='Valor pago (R$)' value={valor} onChange={e => setValor(e.target.value)} />
          <button onClick={adicionarFaixa} className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'>Adicionar Faixa</button>
        </div>
      </div>
      <div className='w-1/2 bg-white p-4 rounded shadow'>
        <h3 className='text-lg font-semibold mb-3'>Faixas cadastradas</h3>
        <ul className='space-y-2 max-h-64 overflow-y-auto'>
          {faixas.map(faixa => (
            <li key={faixa.id} className='border p-2 rounded bg-gray-50 flex justify-between items-center'>
              {editandoId === faixa.id ? (
                <div className='flex gap-2 items-center w-full'>
                  <input type='number' className='border p-1 w-1/4' value={editFaixa.minimo || ''} onChange={e => setEditFaixa({...editFaixa, minimo: e.target.value})} />
                  <input type='number' className='border p-1 w-1/4' value={editFaixa.maximo || ''} onChange={e => setEditFaixa({...editFaixa, maximo: e.target.value})} />
                  <input type='number' className='border p-1 w-1/4' value={editFaixa.valor || ''} onChange={e => setEditFaixa({...editFaixa, valor: e.target.value})} />
                  <button onClick={() => salvarEdicao(faixa.id)} className='bg-green-600 text-white px-2 rounded'>Salvar</button>
                </div>
              ) : (
                <div className='flex justify-between w-full'>
                  <span>De R$ {faixa.minimo} até R$ {faixa.maximo} → paga R$ {faixa.valor}</span>
                  <button onClick={() => { setEditandoId(faixa.id); setEditFaixa(faixa); }} className='text-blue-600 ml-4'>✏️</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
