
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function ControleVales() {
  const [cambistas, setCambistas] = useState([]);
  const [vales, setVales] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const { data: cambistasData } = await supabase.from('cambistas').select('codigo');
      const { data: valesData } = await supabase.from('vales').select('*');
      setCambistas(cambistasData || []);
      setVales(valesData || []);
    }
    fetchData();
  }, []);

  function calcularSaldo(codigo) {
    const total = vales
      .filter(v => v.codigo === codigo)
      .reduce((acc, curr) => acc + parseFloat(curr.valor), 0);
    return total;
  }

  return (
    <div className='bg-gray-100 p-6 rounded shadow-md'>
      <h2 className='text-xl font-bold mb-4'>Controle de Vales</h2>
      <ul className='space-y-3'>
        {cambistas.map(c => {
          const saldo = calcularSaldo(c.codigo);
          return (
            <li key={c.codigo} className='bg-white p-4 rounded shadow flex justify-between items-center'>
              <span className='font-medium'>Código: {c.codigo}</span>
              <span className={saldo === 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                Saldo: R$ {saldo.toFixed(2)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
