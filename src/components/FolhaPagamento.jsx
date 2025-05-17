
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function FolhaPagamento() {
  const [areaSelecionada, setAreaSelecionada] = useState('');
  const [dataDezena, setDataDezena] = useState('');
  const [areas, setAreas] = useState([]);
  const [cambistas, setCambistas] = useState([]);
  const [vendas, setVendas] = useState({});
  const [vales, setVales] = useState({});
  const [descontos, setDescontos] = useState({});
  const [dadosMeta, setDadosMeta] = useState([]);
  const [saldosVale, setSaldosVale] = useState({});

  useEffect(() => {
    async function init() {
      const { data: areaData } = await supabase.from('areas').select('*');
      setAreas(areaData || []);
      const { data: metas } = await supabase.from('tabela_meta').select('*');
      setDadosMeta(metas || []);
      const { data: valesData } = await supabase.from('vales').select('*');
      const saldoMap = {};
      valesData.forEach(v => {
        if (!saldoMap[v.codigo]) saldoMap[v.codigo] = 0;
        saldoMap[v.codigo] += parseFloat(v.valor);
      });
      setSaldosVale(saldoMap);
      const { data: descontosData } = await supabase.from('descontos').select('*');
      const descontoMap = {};
      descontosData.forEach(d => {
        if (!descontoMap[d.codigo]) descontoMap[d.codigo] = 0;
        descontoMap[d.codigo] += parseFloat(d.valor);
      });
      setDescontos(descontoMap);
    }
    init();
  }, []);

  const getSalario = (cambista, vendaRaw) => {
    const venda = parseFloat((vendaRaw || '').toString().replace(',', '.')) || 0;
    const salarioFixo = parseFloat(cambista.salario || 0);
    const minimo = parseFloat(cambista.salario_minimo || 0);

    if (!dadosMeta || dadosMeta.length === 0) return salarioFixo;

    if (cambista.tipo === 'fixo') return salarioFixo;

    if (cambista.tipo === 'meta' || cambista.tipo === 'fixo_meta') {
      const faixa = dadosMeta.find(m => {
        const min = parseFloat(m.minimo);
        const max = parseFloat(m.maximo);
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

  const calcularLinha = (c) => {
    const venda = parseFloat((vendas[c.codigo] || '0').replace(',', '.')) || 0;
    const valeLancado = parseFloat((vales[c.codigo] || '0').replace(',', '.')) || 0;
    const desconto = descontos[c.codigo] || 0;
    const salario = getSalario(c, venda);
    const liquido = salario - valeLancado - desconto;
    return {
      codigo: c.codigo,
      nome: c.nome,
      salario,
      valeLancado,
      desconto,
      liquido: liquido < 0 ? 0 : liquido
    };
  };

  const imprimirERegistrar = async () => {
    if (!window.confirm('Deseja realmente registrar e imprimir a folha da dezena selecionada?')) return;
    const linhas = cambistas.map(c => calcularLinha(c));
    const totalLiquido = linhas.reduce((acc, l) => acc + l.liquido, 0);

    // REGISTRAR no banco
    for (let l of linhas) {
      await supabase.from('folha_pagamento').insert({
        codigo: l.codigo,
        nome: l.nome,
        area: areaSelecionada,
        data: dataDezena,
        salario: l.salario,
        vale_lancado: l.valeLancado,
        desconto: l.desconto,
        liquido: l.liquido
      });
    }

    // VISUALIZAÇÃO
    const html = `
      <html>
      <head>
        <title>Folha ${areaSelecionada} - ${dataDezena}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #000; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #000; padding: 8px; text-align: left; }
          th { background-color: #f0f0f0; }
          h2 { margin-bottom: 0; }
        </style>
      </head>
      <body>
        <h2>CL Riqueza - Área ${areaSelecionada} (${dataDezena})</h2>
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nome</th>
              <th>Salário</th>
              <th>Vale</th>
              <th>Desconto</th>
              <th>Líquido</th>
            </tr>
          </thead>
          <tbody>
            ${linhas.map(l => `
              <tr>
                <td>${l.codigo}</td>
                <td>${l.nome}</td>
                <td>R$ ${l.salario.toFixed(2)}</td>
                <td>R$ ${l.valeLancado.toFixed(2)}</td>
                <td>R$ ${l.desconto.toFixed(2)}</td>
                <td>R$ ${l.liquido.toFixed(2)}</td>
              </tr>
            `).join('')}
            <tr>
              <td colspan="5"><strong>Total líquido da área:</strong></td>
              <td><strong>R$ ${totalLiquido.toFixed(2)}</strong></td>
            </tr>
          </tbody>
        </table>
        <script>window.print()</script>
      </body>
      </html>
    `;
    const newWin = window.open('', '_blank');
    newWin.document.write(html);
    newWin.document.close();
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
        <>
        <div className='overflow-auto'>
          <table className='table-auto w-full text-sm bg-white rounded shadow'>
            <thead>
              <tr className='bg-gray-200 text-left'>
                <th className='p-2'>Código</th>
                <th className='p-2'>Nome</th>
                <th className='p-2'>Venda</th>
                <th className='p-2'>Tipo</th>
                <th className='p-2'>Salário</th>
                <th className='p-2'>Saldo Vale</th>
                <th className='p-2'>Vale Lançado</th>
                <th className='p-2'>Desconto</th>
                <th className='p-2'>Líquido</th>
              </tr>
            </thead>
            <tbody>
              {cambistas.map(c => {
                const venda = vendas[c.codigo] || '';
                const salario = getSalario(c, venda);
                const saldoVale = saldosVale[c.codigo] || 0;
                const valeLancado = parseFloat((vales[c.codigo] || '0').replace(',', '.')) || 0;
                const desconto = descontos[c.codigo] || 0;
                const liquido = salario - valeLancado - desconto;
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
                    <td className='border p-2'>{(c.tipo || '').toUpperCase()}</td>
                    <td className='border p-2 font-bold'>R$ {salario.toFixed(2)}</td>
                    <td className={`border p-2 font-bold ${saldoVale > 0 ? 'text-red-600' : 'text-green-600'}`}>R$ {saldoVale.toFixed(2)}</td>
                    <td className='border p-2'>
                      <input
                        type='text'
                        className='border rounded p-1 w-24'
                        value={vales[c.codigo] || ''}
                        onChange={e => setVales({ ...vales, [c.codigo]: e.target.value })}
                      />
                    </td>
                    <td className='border p-2'>R$ {desconto.toFixed(2)}</td>
                    <td className='border p-2 font-bold'>R$ {liquido.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className='mt-4 flex justify-end'>
          <button className='bg-black text-white px-4 py-2 rounded' onClick={imprimirERegistrar}>
            Imprimir e Registrar
          </button>
        </div>
        <div className='mt-2 flex justify-end'>
          <button className='bg-gray-700 text-white px-4 py-2 rounded' onClick={() => {
            const linhas = cambistas.map(c => calcularLinha(c));
            const totalLiquido = linhas.reduce((acc, l) => acc + l.liquido, 0);
            const html = `
              <html><head><title>Visualizar Folha</title>
              <style>body{font-family:Arial,sans-serif;padding:20px;}table{width:100%;border-collapse:collapse;margin-top:20px;}th,td{border:1px solid #000;padding:8px;text-align:left;}th{background:#eee;}</style>
              </head><body>
              <h2>CL Riqueza - Área ${areaSelecionada} (${dataDezena})</h2>
              <table><thead><tr>
              <th>Código</th><th>Nome</th><th>Salário</th><th>Vale</th><th>Desconto</th><th>Líquido</th>
              </tr></thead><tbody>
              ${linhas.map(l => `
              <tr>
              <td>${l.codigo}</td><td>${l.nome}</td>
              <td>R$ ${l.salario.toFixed(2)}</td><td>R$ ${l.valeLancado.toFixed(2)}</td>
              <td>R$ ${l.desconto.toFixed(2)}</td><td>R$ ${l.liquido.toFixed(2)}</td>
              </tr>`).join('')}
              <tr><td colspan="5"><strong>Total líquido da área:</strong></td><td><strong>R$ ${totalLiquido.toFixed(2)}</strong></td></tr>
              </tbody></table></body></html>`;
            const newWin = window.open('', '_blank');
            newWin.document.write(html);
            newWin.document.close();
          }}>
            Visualizar Folha
          </button>
        </div>
      )}
    </div>
  );
}
