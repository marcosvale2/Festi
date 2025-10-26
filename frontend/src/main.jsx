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
import { LoaderProvider } from './context/LoaderContext'
import GlobalLoader from './components/GlobalLoader'

function getInitialRoute() {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  if (!token || !role) return '/login-cliente'
  if (role === 'cliente') return '/catalogo'
  if (role === 'admin' || role === 'editor') return '/dashboard'
  return '/login-cliente'
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LoaderProvider>
        <CartProvider>
          <GlobalLoader />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/login-cliente" element={<LoginCliente />} />
            <Route path="/" element={<App />}>
              <Route index element={<Navigate to={getInitialRoute()} replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="catalogo" element={<Catalogo />} />
              <Route path="carrinho" element={<Carrinho />} />
              <Route path="pedidos" element={<PedidosCliente />} />
            </Route>
          </Routes>
        </CartProvider>
      </LoaderProvider>
    </BrowserRouter>
  </React.StrictMode>
)
