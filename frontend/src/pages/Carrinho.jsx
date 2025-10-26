import React, { useState } from "react";
import { useCart } from "../components/CartContext";
import { useNavigate } from "react-router-dom";

export default function Carrinho() {
  const { items, updateQty, removeItem, clear, total } = useCart();
  const navigate = useNavigate();

  // 🆕 Campos de dados do cliente
  const [nomeCliente, setNomeCliente] = useState("");
  const [endereco, setEndereco] = useState("");
  const [pagamento, setPagamento] = useState("");

  function validarRole() {
    const role = localStorage.getItem("role");
    if (role !== "cliente") navigate("/login-cliente");
  }
  React.useEffect(validarRole, [navigate]);

  async function finalizarPedido() {
    if (items.length === 0) return alert("Carrinho vazio.");

    if (!nomeCliente.trim() || !endereco.trim() || !pagamento.trim()) {
      alert("Todos os campos de informações pessoais são obrigatórios.");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://192.168.1.101:4000/pedidos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          itens: items,
          nome_cliente: nomeCliente,
          endereco,
          pagamento,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar pedido");

      alert(`✅ Pedido #${data.pedidoId} criado com sucesso!`);
      navigate("/pedidos");
      setTimeout(() => clear(), 100);
    } catch (err) {
      alert("❌ " + err.message);
    }
  }

  return (
    <div className="container mx-auto p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Carrinho</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/catalogo")}
            className="px-4 py-2 border rounded"
          >
            ← Voltar ao Catálogo
          </button>
        </div>
      </header>

      {/* 🆕 Formulário de dados do cliente */}
      {items.length > 0 && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="font-semibold mb-3 text-lg">Informações do Cliente</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              value={nomeCliente}
              onChange={(e) => setNomeCliente(e.target.value)}
              placeholder="Nome completo"
              className="border rounded p-2 w-full"
              required
            />
            <input
              type="text"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              placeholder="Endereço (Rua e número)"
              className="border rounded p-2 w-full"
              required
            />
            <select
              value={pagamento}
              onChange={(e) => setPagamento(e.target.value)}
              className="border rounded p-2 w-full"
              required
            >
              <option value="">Forma de pagamento</option>
              <option value="Pix">Pix</option>
              <option value="Cartão">Cartão</option>
              <option value="Dinheiro">Dinheiro</option>
            </select>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-white p-6 rounded shadow text-center text-gray-600">
          🛒 Seu carrinho está vazio.
        </div>
      ) : (
        <div className="bg-white p-4 rounded shadow">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Produto</th>
                <th className="p-2">Qtd</th>
                <th className="p-2">Preço</th>
                <th className="p-2">Subtotal</th>
                <th className="p-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.produto_id} className="border-t">
                  <td className="p-2">{i.nome}</td>
                  <td className="p-2">
                    <input
                      type="number"
                      min="1"
                      value={i.quantidade}
                      onChange={(e) =>
                        updateQty(i.produto_id, Number(e.target.value))
                      }
                      className="w-20 border rounded p-1"
                    />
                  </td>
                  <td className="p-2">R$ {i.preco_unitario.toFixed(2)}</td>
                  <td className="p-2">
                    R$ {(i.preco_unitario * i.quantidade).toFixed(2)}
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => removeItem(i.produto_id)}
                      className="text-red-600 hover:underline"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="border-t font-semibold">
                <td className="p-2" colSpan={3}>
                  Total
                </td>
                <td className="p-2">R$ {total.toFixed(2)}</td>
                <td />
              </tr>
            </tbody>
          </table>

          <div className="mt-4 flex gap-2 justify-end">
            <button onClick={clear} className="px-4 py-2 border rounded">
              Limpar
            </button>
            <button
              onClick={finalizarPedido}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold"
            >
              Finalizar Pedido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
