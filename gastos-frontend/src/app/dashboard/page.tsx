'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface Gasto {
  item: string;
  valor: number;
  categoria: string;
  criado_em?: string;
  id?: number;
  tipo?: 'fixo' | 'variável';
}

export default function Dashboard() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [mesSelecionado, setMesSelecionado] = useState<number>(new Date().getMonth());
  const [rendaMensal, setRendaMensal] = useState<number>(5000);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const [novoGasto, setNovoGasto] = useState<Gasto>({
    item: '',
    valor: 0,
    categoria: 'Investimentos',
    tipo: 'variável',
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

  useEffect(() => {
    fetchGastos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoGasto.item || !novoGasto.valor || !novoGasto.categoria) {
      setMessage('Preencha todos os campos.');
      return;
    }
    try {
      const token = localStorage.getItem('access');
      if (editandoId !== null) {
        const res = await axios.put(`http://127.0.0.1:8000/api/gastos/${editandoId}/`, novoGasto, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGastos(gastos.map(g => (g.id === editandoId ? res.data : g)));
        setEditandoId(null);
      } else {
        const res = await axios.post('http://127.0.0.1:8000/api/gastos/', novoGasto, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGastos([...gastos, res.data]);
      }
      setNovoGasto({ item: '', valor: 0, categoria: 'Investimentos', tipo: 'variável' });
      setMessage('');
    } catch (error) {
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
      setMessage('Erro ao deletar gasto.');
    }
  };

  const handleEdit = (gasto: Gasto) => {
    setNovoGasto(gasto);
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
    <div className="max-w-4xl mx-auto mt-10 p-4 border rounded-xl shadow-lg bg-white text-gray-800">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">Painel Financeiro</h2>

      <div className="grid grid-cols-3 gap-4 text-center mb-8">
        <div className="bg-green-100 p-4 rounded shadow">
          <h4 className="font-bold text-green-700">Renda Mensal</h4>
          <p className="text-green-800 font-semibold">R$ {rendaMensal.toFixed(2)}</p>
        </div>
        <div className="bg-red-100 p-4 rounded shadow">
          <h4 className="font-bold text-red-700">Gastos Totais</h4>
          <p className="text-red-800 font-semibold">R$ {Number(totalGastos).toFixed(2)}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded shadow">
          <h4 className="font-bold text-blue-700">Guardado (Investimentos)</h4>
          <p className="text-blue-800 font-semibold">R$ {Number(totalInvestimentos).toFixed(2)}</p>
        </div>
      </div>

      <div className="mb-6 text-center">
        <label className="font-semibold text-gray-800">Filtrar por mês: </label>
        <select
          value={mesSelecionado}
          onChange={(e) => setMesSelecionado(Number(e.target.value))}
          className="ml-2 border p-2 rounded text-gray-800"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i}>{new Date(0, i).toLocaleString('pt-BR', { month: 'long' })}</option>
          ))}
        </select>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-2 mb-6">
        <input type="text" placeholder="Item" className="p-2 border rounded text-gray-800" value={novoGasto.item} onChange={(e) => setNovoGasto({ ...novoGasto, item: e.target.value })} />
        <input type="number" placeholder="Valor" className="p-2 border rounded text-gray-800" value={novoGasto.valor} onChange={(e) => setNovoGasto({ ...novoGasto, valor: Number(e.target.value) })} />
        <select className="p-2 border rounded text-gray-800" value={novoGasto.categoria} onChange={(e) => setNovoGasto({ ...novoGasto, categoria: e.target.value })}>
          {categorias.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <select className="p-2 border rounded text-gray-800" value={novoGasto.tipo} onChange={(e) => setNovoGasto({ ...novoGasto, tipo: e.target.value as 'fixo' | 'variável' })}>
          <option value="fixo">Fixo</option>
          <option value="variável">Variável</option>
        </select>
        <button type="submit" className="col-span-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          {editandoId !== null ? 'Atualizar gasto' : 'Adicionar gasto'}
        </button>
      </form>

      {gastosAgrupados.map((grupo) => (
        <div key={grupo.categoria} className="mb-6">
          <h4 className="text-xl font-semibold mb-2 text-blue-700">{grupo.categoria}</h4>
          <table className="w-full table-auto border text-gray-800">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Item</th>
                <th className="p-2 border">Valor (R$)</th>
                <th className="p-2 border">Data</th>
                <th className="p-2 border">Tipo</th>
                <th className="p-2 border">Ações</th>
              </tr>
            </thead>
            <tbody>
              {grupo.itens.map((g) => (
                <tr key={g.id} className="text-center">
                  <td className="p-2 border">{g.item}</td>
                  <td className="p-2 border">{Number(g.valor || 0).toFixed(2)}</td>
                  <td className="p-2 border">{g.criado_em ? new Date(g.criado_em).toLocaleDateString() : '-'}</td>
                  <td className="p-2 border">{g.tipo}</td>
                  <td className="p-2 border space-x-2">
                    <button onClick={() => handleEdit(g)} className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(g.id)} className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
                      Deletar
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-200 font-semibold">
                <td colSpan={5} className="text-right p-2">Total da categoria: R$ {grupo.totalCategoria.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}

      {message && <p className="text-center text-sm text-red-600 mt-2">{message}</p>}
    </div>
  );
}
