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
      const { data } = await supabase.from('areas').select();
      setAreas(data || []);
    }
    fetchAreas();
  }, []);

  async function cadastrar() {
    await supabase.from('cambistas').insert([{
      codigo, nome, area_id: areaId, tipo_pagamento: tipo, salario_fixo: tipo === 'fixo' ? salario : null
    }]);
    setCodigo(''); setNome(''); setAreaId(''); setTipo('fixo'); setSalario('');
  }

  return (
    <div>
      <h2>Cadastrar Cambista</h2>
      <input value={codigo} onChange={e => setCodigo(e.target.value)} placeholder='Código' />
      <input value={nome} onChange={e => setNome(e.target.value)} placeholder='Nome' />
      <select value={areaId} onChange={e => setAreaId(e.target.value)}>
        <option value=''>Selecione a área</option>
        {areas.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
      </select>
      <div>
        <label><input type='radio' checked={tipo==='fixo'} onChange={() => setTipo('fixo')} /> Fixo</label>
        <label><input type='radio' checked={tipo==='meta'} onChange={() => setTipo('meta')} /> Por Meta</label>
      </div>
      {tipo === 'fixo' && <input value={salario} onChange={e => setSalario(e.target.value)} placeholder='Salário Fixo' />}
      <button onClick={cadastrar}>Cadastrar</button>
    </div>
  );
}