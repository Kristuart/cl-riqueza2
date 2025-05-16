
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErro('E-mail ou senha incorretos.');
    }
    setLoading(false);
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100'>
      <form onSubmit={handleLogin} className='bg-white p-6 rounded shadow-md w-full max-w-sm'>
        <h2 className='text-2xl font-bold mb-4 text-center'>Login CL Riqueza</h2>
        <input
          type='email'
          className='w-full mb-3 p-2 border rounded'
          placeholder='E-mail'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type='password'
          className='w-full mb-3 p-2 border rounded'
          placeholder='Senha'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {erro && <div className='text-red-500 text-sm mb-2'>{erro}</div>}
        <button
          type='submit'
          disabled={loading}
          className='w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition'
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
