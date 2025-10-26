import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";
import toast from 'react-hot-toast'

export default function LoginCliente() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);

    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      localStorage.setItem("role", data.role);

      if (data.role !== "cliente") {
        return stoast.error("Área exclusiva para clientes!");
      }

      navigate("/catalogo");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-4 text-center">Login do Cliente</h2>
        {error && <div className="bg-red-100 text-red-700 p-2 mb-3 rounded">{error}</div>}
        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border p-2 rounded"
            placeholder="Usuário"
            required
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="border p-2 rounded"
            placeholder="Senha"
            required
          />
          <button
            type="submit"
            className="bg-pink-600 hover:bg-pink-700 text-white py-2 rounded font-semibold"
          >
            Entrar
          </button>
        </form>
        <p className="text-sm text-gray-500 mt-3 text-center">
          Dica: peça ao admin para criar um usuário com role <strong>cliente</strong>.
        </p>
      </div>
    </div>
  );
}
