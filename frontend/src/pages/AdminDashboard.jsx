import React, { useEffect, useState } from 'react'

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [logs, setLogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('editor')
  const token = localStorage.getItem('token')
  const userRole = localStorage.getItem('role')

  // Redireciona caso não seja admin
  useEffect(() => {
    if (userRole !== 'admin') {
      window.location.href = '/dashboard'
    }
  }, [userRole])

  // Buscar usuários e logs
  useEffect(() => {
    fetch('http://192.168.1.101:4000/users', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(setUsers)

    fetch('http://192.168.1.101:4000/logs', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(setLogs)
  }, [token])

  // Criar usuário
  const handleCreateUser = async (e) => {
    e.preventDefault()
    const res = await fetch('http://192.168.1.101:4000/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ username, password, role })
    })
    if (res.ok) {
      const newUser = await res.json()
      setUsers([...users, newUser])
      setUsername('')
      setPassword('')
      setRole('editor')
    }
  }

  // Deletar usuário
  const handleDeleteUser = async (uname) => {
    if (!confirm(`Deseja deletar o usuário ${uname}?`)) return
    const res = await fetch(`http://192.168.1.101:4000/users/${uname}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) {
      setUsers(users.filter(u => u.username !== uname))
    }
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Painel do Administrador 👑</h1>

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
        <select value={role} onChange={e => setRole(e.target.value)} className="border p-2 mb-2 w-full">
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </select>
        <button className="bg-green-600 text-white px-4 py-2 rounded">Adicionar</button>
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
                      className="bg-red-600 text-white px-2 py-1 rounded"
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

      {/* 📊 Logs de relatórios */}
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
      </div>
    </div>
  )
}
