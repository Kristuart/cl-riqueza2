
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function CadastroArea() {
  const [codigo, setCodigo] = useState('');
  const [areas, setAreas] = useState([]);

  async function buscarAreas() {
    const { data } = await supabase.from('areas').select('*').order('nome', { ascending: true });
    setAreas(data || []);
  }

  async function cadastrarArea() {
    if (!codigo) return;
    await supabase.from('areas').insert([{ nome: codigo }] );
    setCodigo('');
    buscarAreas();
  }

  useEffect(() => {
    buscarAreas();
  }, []);

  return (
    <div className='bg-gray-100 p-6 rounded shadow-md'>
      <h2 className='text-xl font-bold mb-4'>Cadastro de Código da Área</h2>
      <div className='mb-4 space-y-2'>
        <input
          type='text'
          className='w-full border border-gray-300 p-2 rounded'
          placeholder='Digite o código da área'
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
        />
        <button onClick={cadastrarArea} className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'>
          Cadastrar Área
        </button>
      </div>
      <div className='bg-white p-4 rounded shadow'>
        <h3 className='font-semibold mb-2'>Códigos cadastrados:</h3>
        <ul className='space-y-1'>
          {areas.map(area => (
            <li key={area.id} className='border p-2 rounded bg-gray-50'>{area.nome}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
