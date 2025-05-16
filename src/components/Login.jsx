import React from 'react';
export default function Login({ onLogin }) {
  return (
    <div>
      <h2>Login</h2>
      <input type='email' placeholder='Email' />
      <input type='password' placeholder='Senha' />
      <button onClick={onLogin}>Entrar</button>
    </div>
  );
}