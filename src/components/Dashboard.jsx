import React, { useState } from 'react';
import CadastroArea from './CadastroArea';
import CadastroCambista from './CadastroCambista';

export default function Dashboard() {
  const [tela, setTela] = useState('areas');
  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={() => setTela('areas')}>Cadastro de Áreas</button>
      <button onClick={() => setTela('cambistas')}>Cadastro de Cambistas</button>
      {tela === 'areas' ? <CadastroArea /> : <CadastroCambista />}
    </div>
  );
}