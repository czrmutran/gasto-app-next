"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

interface Gasto {
  id?: number;
  item: string;
  valor: number | string;
  categoria: string;
  criado_em?: string;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f7f', '#a78bfa', '#34d399', '#f87171'];

export default function DashboardComparativoTotal() {
  const [meusGastos, setMeusGastos] = useState<Gasto[]>([]);
  const [gastosConvidado, setGastosConvidado] = useState<Gasto[]>([]);
  const [convidado, setConvidado] = useState('');
  const [message, setMessage] = useState('');
  const [observacao, setObservacao] = useState('');
  const [dataSelecionada, setDataSelecionada] = useState<Date | null>(new Date());
  const [openCategoriasConvidado, setOpenCategoriasConvidado] = useState<boolean[]>([]);
  const [openCategoriasMeus, setOpenCategoriasMeus] = useState<boolean[]>([]);
  
  const toggleCategoria = (tipo: 'meus' | 'convidado', index: number) => {
    if (tipo === 'meus') {
      const newState = [...openCategoriasMeus];
      newState[index] = !newState[index];
      setOpenCategoriasMeus(newState);
    } else {
      const newState = [...openCategoriasConvidado];
      newState[index] = !newState[index];
      setOpenCategoriasConvidado(newState);
    }
  };


  useEffect(() => {
    fetchMeusGastos();
  }, []);

  const fetchMeusGastos = async () => {
    try {
      const token = localStorage.getItem('access');
      const res = await axios.get('http://127.0.0.1:8000/api/gastos/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMeusGastos(res.data);
    } catch (error) {
      console.error(error);
      setMessage('Erro ao carregar seus gastos.');
    }
  };

  const fetchGastosConvidado = async () => {
    if (!convidado) return;
    try {
      const token = localStorage.getItem('access');
      const res = await axios.get(`http://127.0.0.1:8000/api/gastos/de/${convidado}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGastosConvidado(res.data);
      setMessage('');
    } catch (error) {
      console.error(error);
      setMessage('Erro ao carregar os dados do convidado.');
    }
  };

  const filtrarPorMesAno = (gastos: Gasto[]) => {
    if (!dataSelecionada) return gastos;
    const mes = dataSelecionada.getMonth();
    const ano = dataSelecionada.getFullYear();
    return gastos.filter((g) => {
      const d = new Date(g.criado_em || '');
      return d.getMonth() === mes && d.getFullYear() === ano;
    });
  };

  const dadosFiltradosMeus = useMemo(() => filtrarPorMesAno(meusGastos), [meusGastos, dataSelecionada]);
  const dadosFiltradosConvidado = useMemo(() => filtrarPorMesAno(gastosConvidado), [gastosConvidado, dataSelecionada]);

  const categorias = Array.from(new Set([
    ...dadosFiltradosMeus.map(g => g.categoria),
    ...dadosFiltradosConvidado.map(g => g.categoria),
  ]));

  const graficoPizza = (gastos: Gasto[]) => {
    return categorias.map(c => ({
      categoria: c,
      valor: gastos.filter(g => g.categoria === c).reduce((acc, g) => acc + Number(g.valor), 0)
    })).filter(d => d.valor > 0);
  };

  const gerarComparativo = () => categorias.map(c => {
    const eu = dadosFiltradosMeus.filter(g => g.categoria === c).reduce((a, g) => a + Number(g.valor), 0);
    const convid = dadosFiltradosConvidado.filter(g => g.categoria === c).reduce((a, g) => a + Number(g.valor), 0);
    return { categoria: c, Eu: eu, [convidado || 'Convidado']: convid };
  });

  const handleExportCSV = () => {
    const todos = [
      ...dadosFiltradosMeus.map(g => ({ origem: 'Eu', ...g })),
      ...dadosFiltradosConvidado.map(g => ({ origem: convidado || 'Convidado', ...g }))
    ];
    const csv = Papa.unparse(todos);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `gastos-comparativo-${convidado || 'convidado'}.csv`);
  };

  return (
    <div className="max-w-7xl mx-auto mt-10 p-6 bg-white border rounded-2xl shadow-xl text-gray-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h2 className="text-3xl font-extrabold text-indigo-800">Dashboard Comparativo</h2>
        <button
          onClick={handleExportCSV}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow"
        >Exportar CSV</button>
      </div>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Usuário do convidado"
          value={convidado}
          onChange={(e) => setConvidado(e.target.value)}
          className="p-3 border border-indigo-300 rounded-lg text-gray-700 w-72 shadow-sm"
        />
        <DatePicker
          selected={dataSelecionada}
          onChange={(date) => setDataSelecionada(date)}
          dateFormat="MM/yyyy"
          showMonthYearPicker
          className="p-3 border border-gray-300 rounded-lg shadow-sm text-gray-700"
        />
        <button
          onClick={fetchGastosConvidado}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow"
        >Buscar</button>
      </div>

      {message && <p className="text-center text-red-600 font-medium mb-4">{message}</p>}

      {/* Gráfico comparativo */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold text-center text-indigo-700 mb-4">Gastos por Categoria</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={gerarComparativo()}>
            <XAxis dataKey="categoria" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Eu" fill="#4ade80" />
            <Bar dataKey={convidado || 'Convidado'} fill="#60a5fa" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráficos de pizza */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
        <div>
          <h4 className="text-center font-semibold mb-2 text-green-600">Distribuição - Você</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={graficoPizza(dadosFiltradosMeus)} dataKey="valor" nameKey="categoria" outerRadius={80} label>
                {graficoPizza(dadosFiltradosMeus).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h4 className="text-center font-semibold mb-2 text-blue-600">Distribuição - {convidado || 'Convidado'}</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={graficoPizza(dadosFiltradosConvidado)} dataKey="valor" nameKey="categoria" outerRadius={80} label>
                {graficoPizza(dadosFiltradosConvidado).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabelas finais */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/2 p-4 rounded-lg shadow-md bg-slate-50">
          <h3 className="text-2xl font-bold mb-4 text-center text-indigo-700">Meus Gastos</h3>
          {categorias.map((categoria, idx) => {
            const key = `meus-${categoria}-${idx}`;
            const itens = dadosFiltradosMeus.filter(g => g.categoria === categoria);
            const total = itens.reduce((acc, g) => acc + Number(g.valor), 0);
            const isOpen = openCategoriasMeus[idx] ?? true;
            return itens.length > 0 ? (
              <div key={key} className="mb-4">
                <div className="flex justify-between items-center mb-2 cursor-pointer" onClick={() => toggleCategoria('meus', idx)}>
                  <h4 className="font-semibold text-lg text-indigo-600">{categoria}</h4>
                  <span className="text-sm text-indigo-500 underline">{isOpen ? 'Ocultar' : 'Mostrar'}</span>
                </div>
                {isOpen && (
                  <>
                    <ul className="divide-y divide-gray-200">
                      {itens.map((g, i) => (
                        <li key={i} className="flex justify-between py-2 text-sm">
                          <span>{g.item}</span>
                          <span className="text-right">R$ {Number(g.valor).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-right font-bold text-indigo-700 mt-2">Total: R$ {total.toFixed(2)}</p>
                  </>
                )}
              </div>
            ) : null;
          })}
          <hr className="my-4" />
          <p className="text-right text-lg font-bold text-indigo-900">
            Total Geral: R$ {dadosFiltradosMeus.reduce((acc, g) => acc + Number(g.valor), 0).toFixed(2)}
          </p>
        </div>

        <div className="w-full md:w-1/2 p-4 rounded-lg shadow-md bg-slate-50">
          <h3 className="text-2xl font-bold mb-4 text-center text-indigo-700">Gastos de {convidado || 'Convidado'}</h3>
          {categorias.map((categoria, idx) => {
            const key = `convidado-${categoria}-${idx}`;
            const itens = dadosFiltradosConvidado.filter(g => g.categoria === categoria);
            const total = itens.reduce((acc, g) => acc + Number(g.valor), 0);
            const isOpen = openCategoriasConvidado[idx] ?? true;
            return itens.length > 0 ? (
              <div key={key} className="mb-4">
                <div className="flex justify-between items-center mb-2 cursor-pointer" onClick={() => toggleCategoria('convidado', idx)}>
                  <h4 className="font-semibold text-lg text-indigo-600">{categoria}</h4>
                  <span className="text-sm text-indigo-500 underline">{isOpen ? 'Ocultar' : 'Mostrar'}</span>
                </div>
                {isOpen && (
                  <>
                    <ul className="divide-y divide-gray-200">
                      {itens.map((g, i) => (
                        <li key={i} className="flex justify-between py-2 text-sm">
                          <span>{g.item}</span>
                          <span className="text-right">R$ {Number(g.valor).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-right font-bold text-indigo-700 mt-2">Total: R$ {total.toFixed(2)}</p>
                  </>
                )}
              </div>
            ) : null;
          })}
          <hr className="my-4" />
          <p className="text-right text-lg font-bold text-indigo-900">
            Total Geral: R$ {dadosFiltradosConvidado.reduce((acc, g) => acc + Number(g.valor), 0).toFixed(2)}
          </p>
        </div>
      </div>
      {/* Observação */}
      <div className="mb-8 pt-5">
        <label className="font-medium text-gray-700 block mb-2">Observações sobre os gastos</label>
        <textarea
          rows={3}
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 shadow-sm"
          placeholder="Ex: Este mês tivemos gastos extras com transporte..."
        />
      </div>
    </div>

    
  );

  
}