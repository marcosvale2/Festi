import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function PedidosCliente() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "cliente") {
      navigate("/login-cliente");
      return;
    }

    const token = localStorage.getItem("token");
    async function carregarPedidos() {
      setLoading(true);
      try {
        const res = await fetch("http://192.168.1.101:4000/pedidos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao carregar pedidos");
        setPedidos(data);
      } catch (err) {
        console.error(err);
        toast.error(`❌ ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    carregarPedidos();
  }, [navigate]);

  return (
    <div className="container mx-auto p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Meus Pedidos</h1>
        <button onClick={() => navigate("/catalogo")} className="px-4 py-2 border rounded">
          ← Voltar ao Catálogo
        </button>
      </header>

      {loading ? (
        <div className="bg-white p-6 rounded shadow text-center text-gray-600">
          Carregando pedidos...
        </div>
      ) : (
        <div className="bg-white rounded shadow p-4">
          {pedidos.length === 0 ? (
            <div>Nenhum pedido encontrado.</div>
          ) : (
            <div className="space-y-4">
              {pedidos.map((p) => (
                <div key={p.id} className="border rounded p-3">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-semibold">
                        #{p.id} — {p.status}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(p.data).toLocaleString("pt-BR")}
                      </div>
                    </div>
                    <div className="font-semibold">
                      Total: R$ {Number(p.total).toFixed(2)}
                    </div>
                  </div>
                  <table className="mt-3 w-full text-left">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-2">Produto</th>
                        <th className="p-2">Qtd</th>
                        <th className="p-2">Preço</th>
                        <th className="p-2">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(p.itens || []).map((i) => (
                        <tr key={i.id} className="border-t">
                          <td className="p-2">{i.produto_id}</td>
                          <td className="p-2">{i.quantidade}</td>
                          <td className="p-2">
                            R$ {Number(i.preco_unitario).toFixed(2)}
                          </td>
                          <td className="p-2">
                            R${" "}
                            {(
                              Number(i.preco_unitario) * Number(i.quantidade)
                            ).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
