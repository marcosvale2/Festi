import React, { useEffect, useState } from 'react'
import gerarPDFPedidos from '../components/PdfReportPedidos'
import { apiFetch } from '../services/api'

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [logs, setLogs] = useState([])
  const [pedidos, setPedidos] = useState([])

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('editor')

  const token = localStorage.getItem('token')
  const userRole = localStorage.getItem('role')

  // 🔐 Verifica se é admin
  useEffect(() => {
    if (userRole !== 'admin') {
      window.location.href = '/dashboard'
    }
  }, [userRole])

  // 📡 Carregar usuários, logs e pedidos
  useEffect(() => {
    async function loadData() {
      try {
        const [usersData, logsData, pedidosData] = await Promise.all([
          apiFetch('/users'),
          apiFetch('/logs'),
          apiFetch('/pedidos'),
        ])
        setUsers(usersData)
        setLogs(logsData)
        setPedidos(pedidosData)
      } catch (err) {
        alert(`❌ ${err.message}`)
      }
    }
    loadData()
  }, [])

  // ➕ Criar usuário
  const handleCreateUser = async (e) => {
    e.preventDefault()
    try {
      const data = await apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify({ username, password, role }),
      })

      setUsers([...users, data])
      setUsername('')
      setPassword('')
      setRole('editor')
      alert(`✅ Usuário '${data.username}' criado com sucesso!`)
    } catch (err) {
      alert(`❌ ${err.message}`)
    }
  }

  // 🗑️ Deletar usuário
  const handleDeleteUser = async (uname) => {
    if (!confirm(`Deseja deletar o usuário ${uname}?`)) return
    try {
      await apiFetch(`/users/${uname}`, {
        method: 'DELETE'
      })
      setUsers(users.filter(u => u.username !== uname))
      alert(`✅ Usuário '${uname}' deletado`)
    } catch (err) {
      alert(`❌ ${err.message}`)
    }
  }

  // 📄 Relatório de pedidos
  const handleGerarRelatorioPedidos = () => {
    if (pedidos.length === 0) {
      alert("Nenhum pedido encontrado.")
      return
    }
    gerarPDFPedidos(pedidos)
  }

  // 🧹 Limpar logs
  const handleLimparLogs = async () => {
    if (!window.confirm("🗑️ Deseja realmente apagar todos os registros de relatórios?")) return
    try {
      await apiFetch('/logs/reset', { method: 'POST' })
      setLogs([])
      alert("✅ Logs apagados com sucesso!")
    } catch (err) {
      alert(`❌ ${err.message}`)
    }
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Painel do Administrador 👑</h1>

      {/* 📄 Botão para relatório de pedidos */}
      <div className="mb-6">
        <button
          onClick={handleGerarRelatorioPedidos}
          className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded font-semibold"
        >
          📄 Gerar Relatório de Pedidos
        </button>
      </div>

      {/* 👤 Cadastrar usuário */}
      <form onSubmit={handleCreateUser} className="bg-white p-4 rounded shadow mb-6">
        <h2 className="font-semibold mb-2">Cadastrar Novo Usuário</h2>
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Usuário"
          className="border p-2 mb-2 w-full"
          required
        />
        <input
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Senha"
          type="password"
          className="border p-2 mb-2 w-full"
          required
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border p-2 mb-2 w-full rounded"
        >
          <option value="admin">admin</option>
          <option value="editor">editor</option>
          <option value="cliente">cliente</option>
        </select>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
          Adicionar
        </button>
      </form>

      {/* 📃 Lista de usuários */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="font-semibold mb-2">Usuários Cadastrados</h2>
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="p-2">Usuário</th>
              <th className="p-2">Papel</th>
              <th className="p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.username} className="border-t">
                <td className="p-2">{u.username}</td>
                <td className="p-2">{u.role}</td>
                <td className="p-2">
                  {u.username !== 'admin' && (
                    <button
                      onClick={() => handleDeleteUser(u.username)}
                      className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                    >
                      Deletar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📊 Logs */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Relatórios Gerados</h2>
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="p-2">Usuário</th>
              <th className="p-2">Data/Hora</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l, i) => (
              <tr key={i} className="border-t">
                <td className="p-2">{l.username}</td>
                <td className="p-2">{new Date(l.data).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          onClick={handleLimparLogs}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold shadow-md transition-all"
        >
          🧹 Limpar Logs
        </button>
      </div>
    </div>
  )
}
