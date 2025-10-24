import jsPDF from "jspdf";
import logo from "../assets/logo-festi.png";

export function gerarPDF(produtos) {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const rosa = [233, 30, 99];
  const azul = [0, 51, 153];
  const branco = [255, 255, 255];

  doc.setFillColor(...azul);
  doc.rect(0, 0, pageWidth, 30, "F");
  doc.addImage(logo, "PNG", 15, 5, 25, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...branco);
  doc.text("Relatório de Produtos", pageWidth / 2, 20, { align: "center" });

  let startY = 45;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("ID", 15, startY);
  doc.text("Nome", 50, startY);
  doc.text("Seção", 110, startY);
  doc.text("Preço OK", 170, startY);
  doc.line(15, startY + 2, 195, startY + 2);

  doc.setFont("helvetica", "normal");
  let y = startY + 10;

  produtos.forEach((p) => {
    if (y > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }
    doc.text(String(p.id), 15, y);
    doc.text(p.nome || "", 50, y);
    doc.text(p.secao || "", 110, y);

    if (p.precoCorreto) {
      doc.setTextColor(0, 128, 0);
      doc.text("[OK]", 172, y);
    } else {
      doc.setTextColor(255, 0, 0);
      doc.text("[X]", 172, y);
    }

    doc.setTextColor(0, 0, 0);
    y += 8;
  });

  const hoje = new Date().toLocaleDateString("pt-BR");
  doc.setFontSize(10);
  doc.setTextColor(...rosa);
  doc.text(`Gerado em: ${hoje} | Festi Distribuidora`, 15, pageHeight - 10);

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setTextColor(...rosa);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - 40, pageHeight - 10);
  }

 // 📅 Rodapé
const hoje1 = new Date();
const dataFormatada = hoje1.toLocaleDateString("pt-BR");
const horaFormatada = hoje1.toLocaleTimeString("pt-BR").replace(/:/g, "-");

// 💾 Salvar PDF com data e hora no nome
doc.save(`relatorio_festi_${dataFormatada}(${horaFormatada}).pdf`);

  // 📡 Enviar log para o servidor
  const token = localStorage.getItem("token");
  fetch("http://192.168.1.101:4000/logs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  }).catch(err => console.error("Erro ao salvar log de relatório:", err));
}

export default gerarPDF;
