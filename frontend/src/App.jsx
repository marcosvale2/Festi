import React from 'react'
import { Outlet } from 'react-router-dom'

export default function App() {
  // 🔸 Não redireciona automaticamente mais
  // Cada rota (Dashboard ou Catálogo/Carrinho) já faz sua própria verificação de role/token
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Outlet />
    </div>
  )
}
