import React from 'react'
import ProductForm from '../components/ProductForm'
import ProductTable from '../components/ProductTable'
import gerarPDF from "../components/PdfReport";

export default function Dashboard(){
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [produtos, setProdutos] = React.useState([]);

  // 🔄 Atualiza tabela e PDF quando adiciona produtos
  function reload() {
    setRefreshKey(k => k + 1);
  }

  // 📡 Buscar produtos no backend
  React.useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://192.168.1.101:4000/produtos", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Erro ao carregar produtos");
        return res.json();
      })
      .then(data => {
        console.log("✅ Produtos carregados:", data);
        setProdutos(data);
      })
      .catch(err => console.error("❌ Erro ao buscar produtos:", err));
  }, [refreshKey]);

  // 🧾 Gerar PDF
  const handleGerarPDF = () => {
    if (produtos.length === 0) {
      alert("Nenhum produto cadastrado para gerar PDF!");
      return;
    }
    gerarPDF(produtos);
  };

  // 🚪 Logout
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="container mx-auto">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sistema de Produtos</h1>
        <div className="flex gap-2 items-center">
          <button
            onClick={handleGerarPDF}
            className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded font-semibold shadow-md transition-all"
          >
            📄 Gerar PDF
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-2 border rounded hover:bg-gray-100 transition-all"
          >
            Sair
          </button>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1">
          <ProductForm onAdd={reload} />
        </div>
        <div className="col-span-2">
          <ProductTable refreshKey={refreshKey} onChange={reload} />
        </div>
      </div>
    </div>
  );
}
