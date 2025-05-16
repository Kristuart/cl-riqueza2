
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function CadastroCambista() {
  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [areaId, setAreaId] = useState('');
  const [tipo, setTipo] = useState('fixo');
  const [salario, setSalario] = useState('');
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    async function fetchAreas() {
      const { data } = await supabase.from('areas').select('*').order('nome', { ascending: true });
      setAreas(data || []);
    }
    fetchAreas();
  }, []);

  async function cadastrarCambista() {
    if (!codigo || !nome || !areaId) return;
    await supabase.from('cambistas').insert([{
      codigo,
      nome,
      area: areaId,
      tipo,
      salario: tipo === 'fixo' ? salario : null
    }]);
    setCodigo('');
    setNome('');
    setAreaId('');
    setTipo('fixo');
    setSalario('');
  }

  return (
    <div className='bg-gray-100 p-6 rounded shadow-md'>
      <h2 className='text-xl font-bold mb-4'>Cadastro de Cambista</h2>
      <div className='grid gap-4'>
        <input type='text' placeholder='Código' value={codigo} onChange={e => setCodigo(e.target.value)} className='border p-2 rounded' />
        <input type='text' placeholder='Nome' value={nome} onChange={e => setNome(e.target.value)} className='border p-2 rounded' />
        <select value={areaId} onChange={e => setAreaId(e.target.value)} className='border p-2 rounded'>
          <option value=''>Selecione uma área</option>
          {areas.map(area => (
            <option key={area.id} value={area.nome}>{area.nome}</option>
          ))}
        </select>
        <div className='space-x-4'>
          <label><input type='radio' checked={tipo === 'fixo'} onChange={() => setTipo('fixo')} /> Fixo</label>
          <label><input type='radio' checked={tipo === 'meta'} onChange={() => setTipo('meta')} /> Tabela de Meta</label>
        </div>
        {tipo === 'fixo' && (
          <input type='number' placeholder='Salário fixo (R$)' value={salario} onChange={e => setSalario(e.target.value)} className='border p-2 rounded' />
        )}
        <button onClick={cadastrarCambista} className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'>
          Cadastrar Cambista
        </button>
      </div>
    </div>
  );
}
