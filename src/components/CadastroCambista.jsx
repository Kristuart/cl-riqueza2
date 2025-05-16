
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function CadastroCambista() {
  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [areaId, setAreaId] = useState('');
  const [tipo, setTipo] = useState('fixo');
  const [salario, setSalario] = useState('');
  const [areas, setAreas] = useState([]);
  const [cambistas, setCambistas] = useState([]);
  const [editando, setEditando] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    async function fetchData() {
      const { data: areasData } = await supabase.from('areas').select('*').order('codigo', { ascending: true });
      const { data: cambistasData } = await supabase.from('cambistas').select('*').order('codigo');
      setAreas(areasData || []);
      setCambistas(cambistasData || []);
    }
    fetchData();
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
    const { data } = await supabase.from('cambistas').select('*').order('codigo');
    setCambistas(data || []);
  }

  async function salvarEdicao(id) {
    await supabase.from('cambistas').update(editForm).eq('id', id);
    setEditando(null);
    setEditForm({});
    const { data } = await supabase.from('cambistas').select('*').order('codigo');
    setCambistas(data || []);
  }

  return (
    <div className='bg-gray-100 p-6 rounded shadow-md'>
      <h2 className='text-xl font-bold mb-4'>Cadastro de Cambista</h2>
      <div className='grid gap-4 mb-6'>
        <input type='text' placeholder='Código' value={codigo} onChange={e => setCodigo(e.target.value)} className='border p-2 rounded' />
        <input type='text' placeholder='Nome' value={nome} onChange={e => setNome(e.target.value)} className='border p-2 rounded' />
        <select value={areaId} onChange={e => setAreaId(e.target.value)} className='border p-2 rounded'>
          <option value=''>Selecione uma área</option>
          {areas.map(area => (
            <option key={area.id} value={area.codigo}>{area.codigo}</option>
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

      <h3 className='text-lg font-semibold mb-2'>Cambistas Cadastrados</h3>
      <ul className='space-y-2'>
        {cambistas.map(c => (
          <li key={c.id} className='bg-white p-4 rounded shadow flex justify-between items-center'>
            {editando === c.id ? (
              <div className='grid gap-2 w-full'>
                <input type='text' value={editForm.nome} onChange={e => setEditForm({...editForm, nome: e.target.value})} className='border p-1 rounded' />
                <select value={editForm.area} onChange={e => setEditForm({...editForm, area: e.target.value})} className='border p-1 rounded'>
                  {areas.map(area => (
                    <option key={area.id} value={area.codigo}>{area.codigo}</option>
                  ))}
                </select>
                <select value={editForm.tipo} onChange={e => setEditForm({...editForm, tipo: e.target.value})} className='border p-1 rounded'>
                  <option value='fixo'>Fixo</option>
                  <option value='meta'>Tabela de Meta</option>
                </select>
                {editForm.tipo === 'fixo' && (
                  <input type='number' value={editForm.salario || ''} onChange={e => setEditForm({...editForm, salario: e.target.value})} className='border p-1 rounded' />
                )}
                <button onClick={() => salvarEdicao(c.id)} className='bg-green-600 text-white px-2 py-1 rounded'>Salvar</button>
              </div>
            ) : (
              <div className='w-full flex justify-between items-center'>
                <span>{c.codigo} - {c.nome} - Área: {c.area} - Tipo: {c.tipo} {c.tipo === 'fixo' ? `- R$${c.salario}` : ''}</span>
                <button onClick={() => { setEditando(c.id); setEditForm(c); }} className='text-blue-600 text-lg ml-4'>✏️</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
