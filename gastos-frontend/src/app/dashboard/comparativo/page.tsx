'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface Gasto {
  id?: number;
  item: string;
  valor: number;
  categoria: string;
  tipo?: 'fixo' | 'variável';
  criado_em?: string;
}

export default function DashboardComparativo() {
  const [meusGastos, setMeusGastos] = useState<Gasto[]>([]);
  const [gastosConvidado, setGastosConvidado] = useState<Gasto[]>([]);
  const [convidado, setConvidado] = useState('');
  const [message, setMessage] = useState('');

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

  useEffect(() => {
    fetchMeusGastos();
  }, []);

  const renderTabela = (gastos: Gasto[], titulo: string) => (
    <div className="w-full md:w-1/2 p-2">
      <h3 className="text-xl font-semibold mb-4 text-center text-blue-700">{titulo}</h3>
      <table className="w-full border table-auto text-sm text-gray-800">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Item</th>
            <th className="p-2 border">Valor (R$)</th>
            <th className="p-2 border">Categoria</th>
            <th className="p-2 border">Tipo</th>
            <th className="p-2 border">Data</th>
          </tr>
        </thead>
        <tbody>
          {gastos.map((g) => (
            <tr key={g.id} className="text-center">
              <td className="p-2 border">{g.item}</td>
              <td className="p-2 border">{Number(g.valor).toFixed(2)}</td>
              <td className="p-2 border">{g.categoria}</td>
              <td className="p-2 border">{g.tipo}</td>
              <td className="p-2 border">{g.criado_em ? new Date(g.criado_em).toLocaleDateString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4 border rounded-xl shadow bg-white text-gray-800">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">Comparar Gastos com um Convidado</h2>

      <div className="mb-6 text-center">
        <input
          type="text"
          placeholder="Nome de usuário do convidado"
          value={convidado}
          onChange={(e) => setConvidado(e.target.value)}
          className="p-2 border rounded mr-2 text-gray-800 w-64"
        />
        <button
          onClick={fetchGastosConvidado}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Buscar
        </button>
      </div>

      {message && <p className="text-center text-red-600 mb-4">{message}</p>}

      <div className="flex flex-col md:flex-row gap-4">
        {renderTabela(meusGastos, 'Meus Gastos')}
        {renderTabela(gastosConvidado, `Gastos de ${convidado}`)}
      </div>
    </div>
  );
}
