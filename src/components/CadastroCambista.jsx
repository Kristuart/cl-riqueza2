import React, { useState } from 'react';
export default function CadastroCambista() {
  const [tipo, setTipo] = useState('fixo');
  return (
    <div>
      <h2>Cadastrar Cambista</h2>
      <input type='text' placeholder='Código' />
      <input type='text' placeholder='Nome' />
      <select>
        <option>Área 1</option>
        <option>Área 2</option>
      </select>
      <div>
        <label><input type='radio' checked={tipo==='fixo'} onChange={() => setTipo('fixo')} /> Fixo</label>
        <label><input type='radio' checked={tipo==='meta'} onChange={() => setTipo('meta')} /> Meta</label>
      </div>
      {tipo === 'fixo' && <input type='number' placeholder='Valor Fixo' />}
      <button>Cadastrar</button>
    </div>
  );
}