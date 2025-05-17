
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function FolhaPagamento() {
  const [areaSelecionada, setAreaSelecionada] = useState('');
  const [dataDezena, setDataDezena] = useState('');
  const [areas, setAreas] = useState([]);
  const [cambistas, setCambistas] = useState([]);
  const [vendas, setVendas] = useState({});
  const [vales, setVales] = useState({});
  const [dadosMeta, setDadosMeta] = useState([]);
  const [descontosPendentes, setDescontosPendentes] = useState({});
  const [usuario, setUsuario] = useState('');
  const [saldosVale, setSaldosVale] = useState({});

  useEffect(() => {
    async function init() {
      const { data: areaData } = await supabase.from('areas').select('*');
      setAreas(areaData || []);
      const { data: metas } = await supabase.from('tabela_meta').select('*');
      setDadosMeta(metas || []);
      console.warn('TABELA META CARREGADA:', metas);
      const { data: user } = await supabase.auth.getUser();
      setUsuario(user?.user?.email || '');
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

  return <div>FolhaPagamento funcionando com tabela de meta (versão resumida)</div>;
}
