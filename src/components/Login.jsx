import React from 'react';
export default function Login({ onLogin }) {
  return (
    <div>
      <h2>Login</h2>
      <button onClick={onLogin}>Entrar (simulado)</button>
    </div>
  );
}