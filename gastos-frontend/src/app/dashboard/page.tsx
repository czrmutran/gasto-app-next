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
      const res = await axios.post('http://127.0.0.1:8000/api/gastos/', novoGasto, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGastos([...gastos, res.data]);
      setNovoGasto({ item: '', valor: 0, categoria: 'Investimentos' });
      setMessage('');
    } catch (error) {
      setMessage('Erro ao salvar gasto.');
    }
  };

  const total = gastos.reduce((acc, g) => acc + Number(g.valor || 0), 0);

  const gastosAgrupados = categorias.map((categoria) => ({
    categoria,
    itens: gastos.filter((g) => g.categoria === categoria),
  })).filter(group => group.itens.length > 0);

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4 border rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center">Calculadora de Gastos</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-2 mb-4">
        <input
          type="text"
          placeholder="Item"
          className="p-2 border rounded"
          value={novoGasto.item}
          onChange={(e) => setNovoGasto({ ...novoGasto, item: e.target.value })}
        />
        <input
          type="number"
          placeholder="Valor"
          className="p-2 border rounded"
          value={novoGasto.valor}
          onChange={(e) => setNovoGasto({ ...novoGasto, valor: Number(e.target.value) })}
        />
        <select
          className="p-2 border rounded"
          value={novoGasto.categoria}
          onChange={(e) => setNovoGasto({ ...novoGasto, categoria: e.target.value })}
        >
          {categorias.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="col-span-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Adicionar gasto
        </button>
      </form>

      <div className="text-xl font-semibold text-center mb-8">
        Total: <span className="text-blue-700">R$ {total.toFixed(2)}</span>
      </div>

      {gastosAgrupados.length > 0 && (
        <div className="mt-4">
          <h3 className="text-2xl font-bold mb-4 text-center">Gastos cadastrados por categoria</h3>
          {gastosAgrupados.map((grupo) => (
            <div key={grupo.categoria} className="mb-6">
              <h4 className="text-xl font-semibold mb-2 text-blue-700">{grupo.categoria}</h4>
              <table className="w-full table-auto border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Item</th>
                    <th className="p-2 border">Valor (R$)</th>
                    <th className="p-2 border">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {grupo.itens.map((g) => (
                    <tr key={g.id} className="text-center">
                      <td className="p-2 border">{g.item}</td>
                      <td className="p-2 border">{Number(g.valor).toFixed(2)}</td>
                      <td className="p-2 border">{g.criado_em ? new Date(g.criado_em).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {message && (
        <p className="text-center text-sm text-red-600 mt-2">{message}</p>
      )}
    </div>
  );
}