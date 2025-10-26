import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo-festi.png'
import toast from 'react-hot-toast'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    const loadingToast = toast.loading("Entrando...");

    try {
      const res = await fetch('http://192.168.1.101:4000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro')

      localStorage.setItem('token', data.token)
      localStorage.setItem('username', data.username)
      localStorage.setItem('role', data.role)

      toast.success(`👋 Bem-vindo, ${data.username}!`)
      navigate(data.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      toast.error(`❌ ${err.message}`)
    } finally {
      toast.dismiss(loadingToast)
    }
  }

  return (
    <div className="login-container">
      <img src={logo} alt="Logo Festi" />
      <h2>Bem-vindo 👋</h2>

      <form onSubmit={handleLogin} className="flex flex-col gap-3">
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="border p-2"
          placeholder="Usuário"
          required
        />
        <input
          value={password}
          onChange={e => setPassword(e.target.value)}
          type="password"
          className="border p-2"
          placeholder="Senha"
          required
        />
        <button type="submit" className="w-full">Entrar</button>
      </form>
    </div>
  )
}
