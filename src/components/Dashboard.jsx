
import React, { useState } from 'react';
import CadastroArea from './CadastroArea';
import CadastroCambista from './CadastroCambista';
import TabelaMeta from './TabelaMeta';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const [tela, setTela] = useState('cadastrar-area');

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className='flex min-h-screen'>
      <aside className='w-64 bg-blue-800 text-white p-4 space-y-4'>
        <h1 className='text-2xl font-bold mb-6'>CL Riqueza</h1>
        <div>
          <p className='font-semibold text-sm mb-1'>CADASTRO</p>
          <button onClick={() => setTela('cadastrar-area')} className='block w-full text-left px-2 py-1 hover:bg-blue-700 rounded'>Áreas</button>
          <button onClick={() => setTela('cadastrar-cambista')} className='block w-full text-left px-2 py-1 hover:bg-blue-700 rounded'>Cambistas</button>
          <button onClick={() => setTela('tabela-meta')} className='block w-full text-left px-2 py-1 hover:bg-blue-700 rounded'>Tabela de Meta</button>
        </div>
        <div>
          <p className='font-semibold text-sm mb-1 mt-6'>SAIR</p>
          <button onClick={logout} className='block w-full text-left px-2 py-1 hover:bg-blue-700 rounded'>Logout</button>
        </div>
      </aside>
      <main className='flex-1 bg-gray-50 p-6'>
        {tela === 'cadastrar-area' && <CadastroArea />}
        {tela === 'cadastrar-cambista' && <CadastroCambista />}
        {tela === 'tabela-meta' && <TabelaMeta />}
      </main>
    </div>
  );
}
