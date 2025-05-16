import React from 'react';
import Login from './components/Login';
export default function App() {
  const [loggedIn, setLoggedIn] = React.useState(false);
  return loggedIn ? <div>Bem-vindo ao Sistema CL Riqueza</div> : <Login onLogin={() => setLoggedIn(true)} />;
}