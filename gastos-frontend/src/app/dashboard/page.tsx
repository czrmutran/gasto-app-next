'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface Gasto {
  item: string;
  valor: number;
  categoria: string;
  criado_em?: string;
  id?: number;
}

export default function Dashboard() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [mesSelecionado, setMesSelecionado] = useState<number>(new Date().getMonth());
  const [rendaMensal, setRendaMensal] = useState<number | null>(null);
  const [editandoRenda, setEditandoRenda] = useState<boolean>(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const [novoGasto, setNovoGasto] = useState<Gasto>({
    item: '',
    valor: 0,
    categoria: 'Investimentos',
  });

  const categorias = [
    'Investimentos',
    'Alimentação',
    'Transporte',
    'Presentes',
    'Cuidados Pessoais',
    'Lazer',
    'Custos Fixos',
  ];

  const fetchGastos = async () => {
    try {
      const token = localStorage.getItem('access');
      const res = await axios.get('http://127.0.0.1:8000/api/gastos/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGastos(res.data);
    } catch (error) {
      setMessage('Erro ao carregar os gastos.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRendaMensal = async () => {
    try {
      const token = localStorage.getItem('access');
      const res = await axios.get('http://127.0.0.1:8000/api/renda/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRendaMensal(Number(res.data.renda_mensal));
    } catch (error) {
      console.error('Erro ao buscar renda mensal:', error);
    }
  };

  const salvarRendaMensal = async () => {
    try {
      const token = localStorage.getItem('access');
      await axios.put(
        'http://127.0.0.1:8000/api/renda/',
        { renda_mensal: rendaMensal },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEditandoRenda(false);
    } catch (error) {
      console.error('Erro ao salvar renda mensal:', error);
    }
  };

  useEffect(() => {
    fetchGastos();
    fetchRendaMensal();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoGasto.item || !novoGasto.valor || !novoGasto.categoria) {
      setMessage('Preencha todos os campos.');
      return;
    }

    try {
      const token = localStorage.getItem('access');
      const headers = { Authorization: `Bearer ${token}` };

      const payload = {
        item: novoGasto.item,
        valor: novoGasto.valor,
        categoria: novoGasto.categoria,
      };

      if (editandoId !== null) {
        const res = await axios.put(
          `http://127.0.0.1:8000/api/gastos/${editandoId}/`,
          payload,
          { headers }
        );
        setGastos(gastos.map(g => (g.id === editandoId ? res.data : g)));
        setEditandoId(null);
      } else {
        const res = await axios.post('http://127.0.0.1:8000/api/gastos/', payload, { headers });
        setGastos([...gastos, res.data]);
      }

      setNovoGasto({ item: '', valor: 0, categoria: 'Investimentos' });
      setMessage('');
    } catch (error) {
      console.error(error);
      setMessage('Erro ao salvar gasto.');
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    try {
      const token = localStorage.getItem('access');
      await axios.delete(`http://127.0.0.1:8000/api/gastos/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGastos(gastos.filter((g) => g.id !== id));
    } catch (error) {
      console.error(error);
      setMessage('Erro ao deletar gasto.');
    }
  };

  const handleEdit = (gasto: Gasto) => {
    setNovoGasto({
      item: gasto.item,
      valor: gasto.valor,
      categoria: gasto.categoria,
    });
    setEditandoId(gasto.id || null);
  };

  const gastosDoMes = gastos.filter((g) => {
    const data = new Date(g.criado_em || '');
    return data.getMonth() === mesSelecionado;
  });

  const gastosAgrupados = categorias.map((categoria) => {
    const itens = gastosDoMes.filter((g) => g.categoria === categoria);
    const totalCategoria = itens.reduce((acc, g) => acc + Number(g.valor || 0), 0);
    return { categoria, itens, totalCategoria };
  }).filter(group => group.itens.length > 0);

  const totalGastos = gastosDoMes.reduce((acc, g) => acc + Number(g.valor || 0), 0);
  const totalInvestimentos = gastosDoMes.filter(g => g.categoria === 'Investimentos')
                                        .reduce((acc, g) => acc + Number(g.valor || 0), 0);

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white border rounded-2xl shadow-xl text-gray-800">
      <h2 className="text-4xl font-extrabold mb-10 text-center text-indigo-800">Painel Financeiro</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center mb-12">
        <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl shadow">
          <h4 className="font-medium text-emerald-700 text-sm">Entrada</h4>
          <p className="text-emerald-900 text-2xl font-bold">
            R$ {rendaMensal !== null ? rendaMensal.toFixed(2) : '...'}
          </p>
        </div>
        <div className="bg-rose-50 border border-rose-300 p-4 rounded-xl shadow">
          <h4 className="font-medium text-rose-700 text-sm">Saída</h4>
          <p className="text-rose-900 text-2xl font-bold">R$ {totalGastos.toFixed(2)}</p>
        </div>
        <div className="bg-blue-50 border border-blue-300 p-4 rounded-xl shadow">
          <h4 className="font-medium text-blue-700 text-sm">Guardado (Investimentos)</h4>
          <p className="text-blue-900 text-2xl font-bold">R$ {totalInvestimentos.toFixed(2)}</p>
        </div>
      </div>

      <div className="mb-8 text-center">
        <label className="font-semibold text-gray-800">Filtrar por mês:</label>
        <select
          value={mesSelecionado}
          onChange={(e) => setMesSelecionado(Number(e.target.value))}
          className="ml-2 border p-2 rounded shadow-sm text-gray-800"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i}>{new Date(0, i).toLocaleString('pt-BR', { month: 'long' })}</option>
          ))}
        </select>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-10">
        <input type="text" placeholder="Item" className="p-2 border rounded-lg shadow-sm text-gray-800" value={novoGasto.item} onChange={(e) => setNovoGasto({ ...novoGasto, item: e.target.value })} />
        <input type="number" placeholder="Valor" className="p-2 border rounded-lg shadow-sm text-gray-800" value={novoGasto.valor} onChange={(e) => setNovoGasto({ ...novoGasto, valor: Number(e.target.value) })} />
        <select className="p-2 border rounded-lg shadow-sm text-gray-800" value={novoGasto.categoria} onChange={(e) => setNovoGasto({ ...novoGasto, categoria: e.target.value })}>
          {categorias.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <button type="submit" className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700 transition">
          {editandoId !== null ? 'Atualizar' : 'Adicionar'}
        </button>
      </form>

      {gastosAgrupados.map((grupo) => (
        <div key={grupo.categoria} className="mb-8">
          <h4 className="text-xl font-semibold mb-2 text-indigo-700">{grupo.categoria}</h4>
          <table className="w-full table-auto border text-gray-800 shadow-sm rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-100 text-center text-sm text-gray-700">
                <th className="p-2 border font-semibold">Item</th>
                <th className="p-2 border font-semibold">Valor (R$)</th>
                <th className="p-2 border font-semibold">Data</th>
                <th className="p-2 border font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {grupo.itens.map((g, idx) => (
                <tr key={g.id} className={`text-center ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="p-2 border">{g.item}</td>
                  <td className="p-2 border">R$ {Number(g.valor || 0).toFixed(2)}</td>
                  <td className="p-2 border">{g.criado_em ? new Date(g.criado_em).toLocaleDateString() : '-'}</td>
                  <td className="p-2 border">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleEdit(g)} className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition">
                        Editar
                      </button>
                      <button onClick={() => handleDelete(g.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition">
                        Deletar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-200 font-semibold text-right">
                <td colSpan={4} className="p-2">
                  Total da categoria: R$ {grupo.totalCategoria.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}

      {message && <p className="text-center text-sm text-red-600 mt-4">{message}</p>}
    </div>
  );
}
