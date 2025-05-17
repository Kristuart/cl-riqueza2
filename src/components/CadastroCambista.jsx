
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function CadastroCambista() {
  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [area, setArea] = useState('');
  const [tipo, setTipo] = useState('');
  const [salario, setSalario] = useState('');
  const [salarioMinimo, setSalarioMinimo] = useState('');
  const [areas, setAreas] = useState([]);
  const [cambistas, setCambistas] = useState([]);

  useEffect(() => {
    async function fetchAreas() {
      const { data } = await supabase.from('areas').select('*');
      setAreas(data || []);
    }
    async function fetchCambistas() {
      const { data } = await supabase.from('cambistas').select('*');
      setCambistas(data || []);
    }
    fetchAreas();
    fetchCambistas();
  }, []);

  const handleSubmit = async () => {
    if (!codigo || !nome || !area || !tipo) return;
    const payload = {
      codigo,
      nome,
      area,
      tipo,
      salario: tipo === 'fixo' ? parseFloat(salario) : null,
      salario_minimo: tipo === 'fixo_meta' ? parseFloat(salarioMinimo) : null,
    };
    const { error } = await supabase.from('cambistas').insert([payload]);
    if (!error) {
      setCodigo('');
      setNome('');
      setArea('');
      setTipo('');
      setSalario('');
      setSalarioMinimo('');
      const { data: novosCambistas } = await supabase.from('cambistas').select('*');
      setCambistas(novosCambistas || []);
    }
  };

  return (
    <div className='bg-gray-100 p-6 rounded shadow-md'>
      <h2 className='text-xl font-bold mb-4'>Cadastro de Cambistas</h2>
      <div className='grid grid-cols-1 gap-2 max-w-md'>
        <input className='border p-2 rounded' placeholder='Código' value={codigo} onChange={e => setCodigo(e.target.value)} />
        <input className='border p-2 rounded' placeholder='Nome' value={nome} onChange={e => setNome(e.target.value)} />
        <select className='border p-2 rounded' value={area} onChange={e => setArea(e.target.value)}>
          <option value=''>Selecione a área</option>
          {areas.map(a => (
            <option key={a.codigo} value={a.codigo}>{a.codigo}</option>
          ))}
        </select>
        <select className='border p-2 rounded' value={tipo} onChange={e => setTipo(e.target.value)}>
          <option value=''>Tipo de pagamento</option>
          <option value='fixo'>Fixo</option>
          <option value='meta'>Tabela de Meta</option>
          <option value='fixo_meta'>Fixo com Meta</option>
        </select>
        {tipo === 'fixo' && (
          <input className='border p-2 rounded' placeholder='Salário (R$)' type='number' value={salario} onChange={e => setSalario(e.target.value)} />
        )}
        {tipo === 'fixo_meta' && (
          <input className='border p-2 rounded' placeholder='Salário Mínimo (R$)' type='number' value={salarioMinimo} onChange={e => setSalarioMinimo(e.target.value)} />
        )}
        <button className='bg-blue-600 text-white px-4 py-2 rounded' onClick={handleSubmit}>Cadastrar</button>
      </div>

      <div className='mt-6'>
        <h3 className='font-bold mb-2'>Cambistas cadastrados:</h3>
        <ul className='text-sm max-h-64 overflow-y-auto space-y-1'>
          {cambistas.map(c => (
            <li key={c.codigo} className='bg-white px-3 py-2 rounded shadow flex justify-between'>
              <span>{c.codigo} - {c.nome}</span>
              <span className='italic text-gray-500 text-xs'>{c.tipo}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
