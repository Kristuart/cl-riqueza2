import React from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

export default function App() {
  const [loggedIn, setLoggedIn] = React.useState(false);
  return loggedIn ? <Dashboard /> : <Login onLogin={() => setLoggedIn(true)} />;
}