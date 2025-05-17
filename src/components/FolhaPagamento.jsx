
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function FolhaPagamento() {
  const [areaSelecionada, setAreaSelecionada] = useState('');
  const [dataDezena, setDataDezena] = useState('');
  const [areas, setAreas] = useState([]);
  const [cambistas, setCambistas] = useState([]);
  const [vendas, setVendas] = useState({});
  const [dadosMeta, setDadosMeta] = useState([]);

  useEffect(() => {
    async function init() {
      const { data: areaData } = await supabase.from('areas').select('*');
      setAreas(areaData || []);
      const { data: metas } = await supabase.from('tabela_meta').select('*');
      setDadosMeta(metas || []);
      console.warn('TABELA META CARREGADA:', metas);
    }
    init();
  }, []);

  const getSalario = (cambista, vendaRaw) => {
    const venda = parseFloat((vendaRaw || '').toString().replace(',', '.')) || 0;
    const salarioFixo = parseFloat(cambista.salario || 0);
    const minimo = parseFloat(cambista.salario_minimo || 0);

    if (!dadosMeta || dadosMeta.length === 0) {
      console.warn('⚠️ TABELA META VAZIA OU NÃO CARREGADA');
      return salarioFixo;
    }

    if (cambista.tipo === 'fixo') return salarioFixo;

    if (cambista.tipo === 'meta' || cambista.tipo === 'fixo_meta') {
      const faixa = dadosMeta.find(m => {
        const min = parseFloat(m.min);
        const max = parseFloat(m.max);
        return venda >= min && venda <= max;
      });

      const valorMeta = faixa ? parseFloat(faixa.valor) : 0;
      if (cambista.tipo === 'meta') return valorMeta;
      return Math.max(valorMeta, minimo);
    }

    return 0;
  };

  const buscarCambistas = async () => {
    const { data } = await supabase.from('cambistas').select('*').eq('area', areaSelecionada);
    setCambistas(data || []);
  };

  return (
    <div className='bg-white p-6 rounded shadow'>
      <h2 className='text-xl font-bold mb-4'>Folha de Pagamento</h2>
      <div className='flex flex-col md:flex-row gap-4 mb-4'>
        <select className='border p-2 rounded w-full md:w-1/3' value={areaSelecionada} onChange={e => setAreaSelecionada(e.target.value)}>
          <option value=''>Selecione a área</option>
          {areas.map(a => (
            <option key={a.codigo} value={a.codigo}>{a.codigo}</option>
          ))}
        </select>
        <input type='date' className='border p-2 rounded w-full md:w-1/3' value={dataDezena} onChange={e => setDataDezena(e.target.value)} />
        <button className='bg-blue-600 text-white px-4 py-2 rounded' onClick={buscarCambistas}>Iniciar Pagamento</button>
      </div>

      {cambistas.length > 0 && (
        <div className='overflow-auto'>
          <table className='table-auto w-full text-sm bg-white rounded shadow'>
            <thead>
              <tr className='bg-gray-200 text-left'>
                <th className='p-2'>Código</th>
                <th className='p-2'>Nome</th>
                <th className='p-2'>Venda</th>
                <th className='p-2'>Tipo</th>
                <th className='p-2'>Salário</th>
              </tr>
            </thead>
            <tbody>
              {cambistas.map(c => {
                const venda = vendas[c.codigo] || '';
                const salario = getSalario(c, venda);
                return (
                  <tr key={c.codigo}>
                    <td className='border p-2'>{c.codigo}</td>
                    <td className='border p-2'>{c.nome}</td>
                    <td className='border p-2'>
                      <input
                        type='text'
                        className='border rounded p-1 w-24'
                        value={vendas[c.codigo] || ''}
                        onChange={e => setVendas({ ...vendas, [c.codigo]: e.target.value })}
                      />
                    </td>
                    <td className='border p-2'>{c.tipo}</td>
                    <td className='border p-2 font-bold'>R$ {salario.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
