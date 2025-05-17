
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function FolhaPagamento() {
  const [areaSelecionada, setAreaSelecionada] = useState('');
  const [dataDezena, setDataDezena] = useState('');
  const [areas, setAreas] = useState([]);
  const [cambistas, setCambistas] = useState([]);
  const [vendas, setVendas] = useState({});
  const [valesLançados, setValesLançados] = useState({});
  const [saldosVale, setSaldosVale] = useState({});
  const [dadosMeta, setDadosMeta] = useState([]);
  const [descontosPendentes, setDescontosPendentes] = useState({});
  const [usuario, setUsuario] = useState('');
  const [folhaGerada, setFolhaGerada] = useState([]);

  useEffect(() => {
    async function init() {
      const { data: areaData } = await supabase.from('areas').select('*');
      setAreas(areaData || []);

      const { data: metas } = await supabase.from('tabela_meta').select('*');
      setDadosMeta(metas || []);

      const { data: user } = await supabase.auth.getUser();
      setUsuario(user?.user?.email || '');
    }
    init();
  }, []);

  const buscarCambistas = async () => {
    const { data } = await supabase.from('cambistas').select('*').eq('area', areaSelecionada);
    setCambistas(data || []);

    const { data: descontos } = await supabase.from('descontos').select('*');
    const descontosMap = {};
    for (let d of descontos) {
      if (!descontosMap[d.codigo]) descontosMap[d.codigo] = 0;
      descontosMap[d.codigo] += parseFloat(d.valor);
    }
    setDescontosPendentes(descontosMap);

    const { data: valesData } = await supabase.from('vales').select('*');
    const saldos = {};
    for (let v of valesData) {
      if (!saldos[v.codigo]) saldos[v.codigo] = 0;
      saldos[v.codigo] += parseFloat(v.valor);
    }
    setSaldosVale(saldos);
  };

  const getSalario = (cambista, venda) => {
    if (cambista.tipo === 'fixo') return parseFloat(cambista.salario || 0);
    if (cambista.tipo === 'meta') {
      const valorMeta = dadosMeta.find(m => venda >= m.min && venda <= m.max);
      return valorMeta ? parseFloat(valorMeta.valor) : 0;
    }
    if (cambista.tipo === 'fixo_meta') {
      const valorMeta = dadosMeta.find(m => venda >= m.min && venda <= m.max);
      const valorMetaNum = valorMeta ? parseFloat(valorMeta.valor) : 0;
      return Math.max(valorMetaNum, parseFloat(cambista.salario_minimo || 0));
    }
    return 0;
  };

  const calcularLinha = (c) => {
    const vendaRaw = vendas[c.codigo] || '0';
    const valeRaw = valesLançados[c.codigo] || '0';
    const venda = parseFloat(vendaRaw.replace(',', '.')) || 0;
    const vale = parseFloat(valeRaw.replace(',', '.')) || 0;
    const salario = getSalario(c, venda);
    const desconto = descontosPendentes[c.codigo] || 0;
    const saldoValeAtual = saldosVale[c.codigo] || 0;
    const liquido = salario - vale - desconto;
    return {
      codigo: c.codigo,
      nome: c.nome,
      tipo_pagamento: c.tipo,
      venda,
      salario,
      vale_lancado: vale,
      desconto,
      saldo_vale: saldoValeAtual,
      liquido: Math.max(liquido, 0)
    };
  };

  
  const visualizarFolha = () => {
    const folha = cambistas.map(c => calcularLinha(c));
    const totalLiquido = folha.reduce((acc, item) => acc + item.liquido, 0);
    const html = `
      <html>
        <head>
          <title>Folha de Pagamento - ${areaSelecionada}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #000; background: #fff; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #000; padding: 6px; font-size: 14px; }
            th { background: #eee; }
            tfoot td { font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>Folha de Pagamento - Área ${areaSelecionada} (${dataDezena})</h2>
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
              ${folha.map(f => `
                <tr>
                  <td>${f.codigo}</td>
                  <td>${f.nome}</td>
                  <td>R$ ${f.salario.toFixed(2)}</td>
                  <td>R$ ${f.vale_lancado.toFixed(2)}</td>
                  <td>R$ ${f.desconto.toFixed(2)}</td>
                  <td>R$ ${f.liquido.toFixed(2)}</td>
                </tr>`).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="5">Total líquido da área:</td>
                <td>R$ ${totalLiquido.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </body>
      </html>`;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
    } else {
      alert("Por favor, permita pop-ups para visualizar a folha.");
    }
  };

    const folha = cambistas.map(c => calcularLinha(c));
    setFolhaGerada(folha);
  };

  const registrarFolha = async () => {
    const payload = folhaGerada.map(f => ({
      ...f,
      area: areaSelecionada,
      data_dezena: dataDezena,
      registrado_em: new Date(),
      usuario
    }));
    const { error } = await supabase.from('folhas_pagamento').insert(payload);
    if (!error) alert("Folha registrada com sucesso!");
  };

  return (
    <div className='bg-gray-100 p-6 rounded shadow-md'>
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
                  const dados = calcularLinha(c);
                  return (
                    <tr key={c.codigo}>
                      <td className='border p-2'>{c.codigo}</td>
                      <td className='border p-2'>{c.nome}</td>
                      <td className='border p-2'>
                        <input type='text' className='border rounded p-1 w-24' value={vendas[c.codigo] || ''} onChange={e => setVendas({ ...vendas, [c.codigo]: e.target.value })} />
                      </td>
                      <td className='border p-2'>{c.tipo}</td>
                      <td className='border p-2'>R$ {dados.salario.toFixed(2)}</td>
                      <td className={`border p-2 font-bold ${dados.saldo_vale > 0 ? 'text-red-600' : 'text-green-600'}`}>R$ {dados.saldo_vale.toFixed(2)}</td>
                      <td className='border p-2'>
                        <input type='text' className='border rounded p-1 w-24' value={valesLançados[c.codigo] || ''} onChange={e => setValesLançados({ ...valesLançados, [c.codigo]: e.target.value })} />
                      </td>
                      <td className='border p-2'>R$ {dados.desconto.toFixed(2)}</td>
                      <td className='border p-2 font-bold'>R$ {dados.liquido.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className='mt-4 flex justify-between'>
            <button className='bg-green-600 text-white px-4 py-2 rounded' onClick={visualizarFolha}>Gerar Folha</button>
            <button className='bg-black text-white px-4 py-2 rounded' onClick={registrarFolha}>Registrar e Imprimir</button>
          </div>
        </>
      )}
    </div>
  );
}
