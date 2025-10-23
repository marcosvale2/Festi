import jsPDF from "jspdf";
import logo from "../assets/logo-festi.png"; // Caminho da imagem

export function gerarPDF(produtos) {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 🎨 Paleta de cores FESTI
  const rosa = [233, 30, 99];
  const azul = [0, 51, 153];
  const branco = [255, 255, 255];

  // 🖼️ Cabeçalho azul
  doc.setFillColor(...azul);
  doc.rect(0, 0, pageWidth, 30, "F");

  // 📸 Logo
  doc.addImage(logo, "PNG", 15, 5, 25, 20);

  // ✍️ Título
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...branco);
  doc.text("Relatório de Produtos", pageWidth / 2, 20, { align: "center" });

  // 🧾 Cabeçalho da tabela
  let startY = 45;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("ID", 15, startY);
  doc.text("Nome", 50, startY);
  doc.text("Seção", 110, startY);
  doc.text("Preço OK", 170, startY);
  doc.line(15, startY + 2, 195, startY + 2);

  // 📄 Linhas
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

    // ✅ Exibe [OK] ou [X] colorido
    if (p.precoCorreto) {
      doc.setTextColor(0, 128, 0); // verde
      doc.text("[OK]", 172, y);
    } else {
      doc.setTextColor(255, 0, 0); // vermelho
      doc.text("[X]", 172, y);
    }

    // volta para preto para a próxima linha
    doc.setTextColor(0, 0, 0);
    y += 8;
  });

  // 📅 Rodapé
  const hoje = new Date().toLocaleDateString("pt-BR");
  doc.setFontSize(10);
  doc.setTextColor(...rosa);
  doc.text(`Gerado em: ${hoje} | Festi Distribuidora`, 15, pageHeight - 10);

  // 📄 Número de páginas
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setTextColor(...rosa);
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth - 40,
      pageHeight - 10
    );
  }

  // 💾 Salvar PDF
  doc.save(`relatorio_festi_${hoje}.pdf`);
}

export default gerarPDF;
