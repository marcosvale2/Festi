import React from 'react'

// Lista produtos, permite editar e deletar (se role permitir)
export default function ProductTable({ refreshKey, onChange }) {
  const [produtos, setProdutos] = React.useState([])
  const [editing, setEditing] = React.useState(null)
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  React.useEffect(() => {
    async function load() {
      const res = await fetch('http://192.168.1.101:4000/produtos', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setProdutos(data)
    }
    load()
  }, [refreshKey]) // eslint-disable-line

  async function handleDelete(id) {
    if (!confirm('Deletar produto?')) return
    await fetch(`http://192.168.1.101:4000/produtos/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (onChange) onChange()
  }

  async function saveEdit(p) {
    await fetch(`http://192.168.1.101:4000/produtos/${p.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        ...p,
        preco: parseFloat(p.preco) // garantir número
      })
    })
    setEditing(null)
    if (onChange) onChange()
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-semibold mb-2">Produtos</h2>
      <div className="overflow-auto max-h-[60vh]">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Nome</th>
              <th className="p-2">Seção</th>
              <th className="p-2">Preço (R$)</th>
              <th className="p-2">Preço correto</th>
              <th className="p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map(p => (
              <tr key={p.id} className="border-t hover:bg-gray-50 transition">
                <td className="p-2 align-top">{p.id}</td>
                <td className="p-2">
                  {editing === p.id ? (
                    <input
                      defaultValue={p.nome}
                      onChange={e => (p.nome = e.target.value)}
                      className="border p-1 rounded w-full"
                    />
                  ) : p.nome}
                </td>
                <td className="p-2">
                  {editing === p.id ? (
                    <input
                      defaultValue={p.secao}
                      onChange={e => (p.secao = e.target.value)}
                      className="border p-1 rounded w-full"
                    />
                  ) : p.secao}
                </td>
                <td className="p-2">
                  {editing === p.id ? (
                    <input
                      type="number"
                      step="0.01"
                      defaultValue={p.preco}
                      onChange={e => (p.preco = e.target.value)}
                      className="border p-1 rounded w-full"
                    />
                  ) : (
                    `R$ ${Number(p.preco).toFixed(2)}`
                  )}
                </td>
                <td className="p-2">
                  {editing === p.id ? (
                    <input
                      type="checkbox"
                      defaultChecked={p.precoCorreto}
                      onChange={e => (p.precoCorreto = e.target.checked)}
                    />
                  ) : p.precoCorreto ? '✅' : '❌'}
                </td>
                <td className="p-2">
                  {editing === p.id ? (
                    <>
                      <button
                        onClick={() => saveEdit(p)}
                        className="mr-2 bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => setEditing(null)}
                        className="px-2 py-1 border rounded hover:bg-gray-100 transition"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      {(role === 'editor' || role === 'admin') && (
                        <button
                          onClick={() => setEditing(p.id)}
                          className="mr-2 px-2 py-1 border rounded hover:bg-gray-100 transition"
                        >
                          Editar
                        </button>
                      )}
                      {(role === 'editor' || role === 'admin') && (
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="px-2 py-1 border rounded hover:bg-red-100 transition"
                        >
                          Deletar
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
