import React, { useState } from 'react'

// Formulário para adicionar novos produtos. Salva via API (POST /produtos).
export default function ProductForm({ onAdd }){
  const [id, setId] = useState('')
  const [nome, setNome] = useState('')
  const [secao, setSecao] = useState('')
  const [precoCorreto, setPrecoCorreto] = useState(false)
  const [msg, setMsg] = useState(null)


const secoes = [
  "Bomboniere",
  "Confeitaria",
  "Descartáveis",
  "Papelaria",
  "Bebidas",
  "Limpeza"
];



  async function handleSubmit(e){
    e.preventDefault()
    const token = localStorage.getItem('token')
    setMsg(null)
    try{
      const res = await fetch('http://192.168.1.101:4000/produtos',{
        method:'POST',
        headers:{'Content-Type':'application/json', 'Authorization': `Bearer ${token}`},
        body: JSON.stringify({ id, nome, secao, precoCorreto })
      })
      const data = await res.json()
      if(!res.ok) throw new Error(data.error || 'Erro ao criar')
      setMsg('✅ Produto cadastrado com sucesso')
      setId(''); setNome(''); setSecao(''); setPrecoCorreto(false)
      if(onAdd) onAdd()
    }catch(err){
      setMsg('❌ ' + err.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow">
      <h2 className="font-semibold mb-2">Cadastrar Produto</h2>
      {msg && <div className="mb-2 text-sm">{msg}</div>}
      <input value={id} onChange={e=>setId(e.target.value)} placeholder="ID (número já existente)" className="border p-2 mb-2 w-full" required />
      <input value={nome} onChange={e=>setNome(e.target.value)} placeholder="Nome" className="border p-2 mb-2 w-full" required />
      <select
  value={secao}
  onChange={e => setSecao(e.target.value)}
  className="border p-2 mb-2 w-full rounded"
  required
>
  <option value="" disabled>Selecione a seção</option>
  {secoes.map(s => (
    <option key={s} value={s}>{s}</option>
  ))}
</select>

      <label className="flex items-center gap-2 mb-2">
        <input type="checkbox" checked={precoCorreto} onChange={e=>setPrecoCorreto(e.target.checked)} />
        Preço correto
      </label>
      <button className="bg-green-600 text-white px-4 py-2 rounded">Adicionar</button>
    </form>
  )
}
