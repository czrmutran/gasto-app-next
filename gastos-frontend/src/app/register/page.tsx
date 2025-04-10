'use client';
import { useState } from 'react';
import axios from 'axios';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/register/', form);
      if (response.status === 201) {
        setMessage('Usuário registrado com sucesso!');
      }
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Erro ao registrar usuário');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10 space-y-4">
      <h2 className="text-2xl font-semibold">Registro</h2>
      <input
        type="text"
        placeholder="Nome de usuário"
        className="w-full p-2 border rounded"
        value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
      />
      <input
        type="email"
        placeholder="Email"
        className="w-full p-2 border rounded"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        type="password"
        placeholder="Senha"
        className="w-full p-2 border rounded"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <button className="bg-blue-500 text-white px-4 py-2 rounded">Registrar</button>
      <p className="text-sm mt-2">{message}</p>
    </form>
  );
}
