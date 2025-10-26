import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App'
import Login from './pages/Login'
import LoginCliente from './pages/LoginCliente'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import Catalogo from './pages/Catalogo'
import Carrinho from './pages/Carrinho'
import PedidosCliente from './pages/PedidosCliente'
import './index.css'
import { CartProvider } from './components/CartContext'

function getInitialRoute() {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  // Se não estiver logado, vai pra tela de login cliente por padrão
  if (!token || !role) return '/login-cliente'

  // Se for cliente, volta pro catálogo
  if (role === 'cliente') return '/catalogo'

  // Se for admin/editor, volta pro dashboard
  if (role === 'admin' || role === 'editor') return '/dashboard'

  // fallback
  return '/login-cliente'
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <CartProvider>
        <Routes>
          {/* Login para admin/editor */}
          <Route path="/login" element={<Login />} />

          {/* Login para cliente */}
          <Route path="/login-cliente" element={<LoginCliente />} />

          {/* ÁREA RESTRITA */}
          <Route path="/" element={<App />}>
            {/* 📌 Redirecionamento baseado no role */}
            <Route index element={<Navigate to={getInitialRoute()} replace />} />

            {/* Painel staff */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="admin" element={<AdminDashboard />} />

            {/* Área cliente */}
            <Route path="catalogo" element={<Catalogo />} />
            <Route path="carrinho" element={<Carrinho />} />
            <Route path="pedidos" element={<PedidosCliente />} />
          </Route>
        </Routes>
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>
)
