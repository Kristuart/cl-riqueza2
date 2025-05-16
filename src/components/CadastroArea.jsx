import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function CadastroArea() {
  const [nome, setNome] = useState('');
  const [areas, setAreas] = useState([]);

  async function cadastrarArea() {
    if (!nome) return;
    await supabase.from('areas').insert([{ nome }]);
    setNome('');
    buscarAreas();
  }

  async function buscarAreas() {
    const { data } = await supabase.from('areas').select();
    setAreas(data || []);
  }

  useEffect(() => { buscarAreas(); }, []);

  return (
    <div>
      <h2>Cadastrar Área</h2>
      <input value={nome} onChange={e => setNome(e.target.value)} placeholder='Nome da Área' />
      <button onClick={cadastrarArea}>Cadastrar</button>
      <ul>{areas.map(a => <li key={a.id}>{a.nome}</li>)}</ul>
    </div>
  );
}