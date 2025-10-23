import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

export default function App(){
  const navigate = useNavigate();
  // se não tiver token, redireciona para login
  React.useEffect(()=>{
    const tk = localStorage.getItem('token');
    if(!tk) navigate('/login');
  },[]) // eslint-disable-line

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Outlet />
    </div>
  )
}
