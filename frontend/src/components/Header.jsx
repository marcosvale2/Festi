import React from 'react'
import logo from '../assets/logo-festi.png'

export default function Header() {
  return (
    <header>
      <div className="flex items-center gap-3">
        <img src={logo} alt="Logo Festi" />
        <h1>Sistema Festi</h1>
      </div>
    </header>
  )
}
