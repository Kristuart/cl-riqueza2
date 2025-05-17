
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function FolhaPagamento() {
  // Simulação dos estados e hooks (omitidos para foco na função principal)
  // Aqui você teria: vendas, vales, descontos, cambistas, áreas, etc.

  const imprimirERegistrar = async () => {
    if (!window.confirm('Deseja realmente registrar e imprimir a folha da dezena selecionada?')) return;

    const linhas = cambistas.map(c => calcularLinha(c));
    const totalLiquido = linhas.reduce((acc, l) => acc + l.liquido, 0);

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

      let { data: vales } = await supabase.from('vales').select('*').eq('codigo', l.codigo).order('data');
      let restante = l.valeLancado;
      for (let v of vales) {
        if (restante <= 0) break;
        const valor = parseFloat(v.valor);
        if (restante >= valor) {
          await supabase.from('vales').delete().eq('id', v.id);
          restante -= valor;
        } else {
          await supabase.from('vales').update({ valor: valor - restante }).eq('id', v.id);
          restante = 0;
        }
      }

      let { data: descontos } = await supabase.from('descontos').select('*').eq('codigo', l.codigo).order('data');
      let restanteDesc = l.desconto;
      for (let d of descontos) {
        if (restanteDesc <= 0) break;
        const valor = parseFloat(d.valor);
        if (restanteDesc >= valor) {
          await supabase.from('descontos').delete().eq('id', d.id);
          restanteDesc -= valor;
        } else {
          await supabase.from('descontos').update({ valor: valor - restanteDesc }).eq('id', d.id);
          restanteDesc = 0;
        }
      }
    }

    const html = `<html><head><title>Impressão</title><style>body{font-family:Arial;padding:20px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #000;padding:6px;}</style></head><body>
      <h2>CL Riqueza - Área ${areaSelecionada} (${dataDezena})</h2><table><thead><tr><th>Código</th><th>Nome</th><th>Salário</th><th>Vale</th><th>Desconto</th><th>Líquido</th></tr></thead><tbody>
      ${linhas.map(l => `<tr><td>${l.codigo}</td><td>${l.nome}</td><td>R$ ${l.salario.toFixed(2)}</td><td>R$ ${l.valeLancado.toFixed(2)}</td><td>R$ ${l.desconto.toFixed(2)}</td><td>R$ ${l.liquido.toFixed(2)}</td></tr>`).join('')}
      <tr><td colspan="5"><strong>Total líquido da área:</strong></td><td><strong>R$ ${totalLiquido.toFixed(2)}</strong></td></tr>
      </tbody></table><script>window.print()</script></body></html>`;

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
  };

  return (
    <div className='bg-white p-6 rounded shadow'>
      <h2 className='text-xl font-bold mb-4'>Folha de Pagamento</h2>
      {/* Aqui virá toda a tabela funcional com inputs e campos conforme versão validada */}
      {/* Vendas, tipos de pagamento, salário, saldo de vale, descontos, botão de Visualizar e Imprimir */}
      <button onClick={imprimirERegistrar} className='mt-4 bg-black text-white px-4 py-2 rounded'>Imprimir e Registrar</button>
    </div>
  );
}
