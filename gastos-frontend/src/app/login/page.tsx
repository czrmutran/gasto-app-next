'use client';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login/', {
        username: form.username, // Django espera 'username'
        password: form.password,
      });

      const { access, refresh } = response.data;
      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);
      router.push('/dashboard');
    } catch (error: any) {
      setMessage('Login inválido. Verifique suas credenciais.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10 space-y-4">
      <h2 className="text-2xl font-semibold">Login</h2>
      <input
        type="text"
        placeholder="username"
        className="w-full p-2 border rounded"
        value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
      />
      <input
        type="password"
        placeholder="Senha"
        className="w-full p-2 border rounded"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <button className="bg-green-500 text-white px-4 py-2 rounded">Entrar</button>
      <p className="text-sm mt-2">{message}</p>
    </form>
  );
}
