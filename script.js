const lista = document.getElementById("lista");

/* =========================
   DATAS COM VALOR DOBRADO
========================= */
function isDataValorDobrado(data) {
  const [, mes, dia] = data.split("-");

  return (
    (dia === "24" && mes === "11") ||
    (dia === "25" && mes === "11") ||
    (dia === "31" && mes === "12") ||
    (dia === "01" && mes === "01")
  );
}

/* =========================
   SALVAR VALORES DOS TURNOS
========================= */
function salvarValores() {
  const valores = {
    "6h Diurno": document.getElementById("v6d").value,
    "6h Noturno": document.getElementById("v6n").value,
    "8h Diurno": document.getElementById("v8d").value,
    "8h Noturno": document.getElementById("v8n").value,
    "12h Diurno": document.getElementById("v12d").value,
    "12h Noturno": document.getElementById("v12n").value,
    "24h": document.getElementById("v24").value
  };

  localStorage.setItem("valores", JSON.stringify(valores));
  alert("Valores salvos com sucesso");
}

/* =========================
   SALVAR PLANTÃO
========================= */
function salvarPlantao() {
  const nome = document.getElementById("nome").value.trim();
  const data = document.getElementById("data").value;
  const turno = document.getElementById("turno").value;

  if (!nome || !data) {
    alert("Preencha o nome e a data");
    return;
  }

  const valores = JSON.parse(localStorage.getItem("valores")) || {};
  let valor = Number(valores[turno] || 0);

  // Aplica valor dobrado se for data especial
  if (isDataValorDobrado(data)) {
    valor = valor * 2;
  }

  const plantoes = JSON.parse(localStorage.getItem("plantoes")) || [];
  plantoes.push({ nome, data, turno, valor });

  localStorage.setItem("plantoes", JSON.stringify(plantoes));
  filtrarPorMes();
}

/* =========================
   LISTAR PLANTÕES DO MÊS
========================= */
function filtrarPorMes() {
  const mesSelecionado = document.getElementById("mesSelecionado").value;
  lista.innerHTML = "";

  if (!mesSelecionado) return;

  const [anoSel, mesSel] = mesSelecionado.split("-");
  const plantoes = JSON.parse(localStorage.getItem("plantoes")) || [];

  const filtrados = plantoes
    .filter(p => {
      const [ano, mes] = p.data.split("-");
      return ano === anoSel && mes === mesSel;
    })
    .sort((a, b) => new Date(a.data) - new Date(b.data));

  filtrados.forEach(p => {
    const [a, m, d] = p.data.split("-");
    const li = document.createElement("li");
    li.textContent = `${d}/${m} ${p.turno}`;
    lista.appendChild(li);
  });
}

/* =========================
   CALCULAR TOTAL DO MÊS
========================= */
function calcularTotal() {
  const mesSelecionado = document.getElementById("mesSelecionado").value;
  if (!mesSelecionado) {
    alert("Selecione um mês");
    return;
  }

  const [anoSel, mesSel] = mesSelecionado.split("-");
  const plantoes = JSON.parse(localStorage.getItem("plantoes")) || [];

  const total = plantoes
    .filter(p => {
      const [ano, mes] = p.data.split("-");
      return ano === anoSel && mes === mesSel;
    })
    .reduce((soma, p) => soma + p.valor, 0);

  document.getElementById("total").innerText =
    `Total a receber no mês: R$ ${total.toFixed(2)}`;
}

/* =========================
   EXPORTAR CSV (COM VALOR)
========================= */
function exportarCSV() {
  const mesSelecionado = document.getElementById("mesSelecionado").value;
  if (!mesSelecionado) {
    alert("Selecione um mês");
    return;
  }

  const [anoSel, mesSel] = mesSelecionado.split("-");
  const plantoes = JSON.parse(localStorage.getItem("plantoes")) || [];

  const filtrados = plantoes.filter(p => {
    const [ano, mes] = p.data.split("-");
    return ano === anoSel && mes === mesSel;
  });

  if (!filtrados.length) {
    alert("Nenhum plantão no mês selecionado");
    return;
  }

  const total = filtrados.reduce((soma, p) => soma + p.valor, 0);
  const nome = filtrados[0].nome;

  let csv = "Mes,Ano,Profissional,Total_a_Receber\n";
  csv += `${mesSel},${anoSel},"${nome}",${total.toFixed(2)}\n`;

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `fechamento_${anoSel}-${mesSel}.csv`;
  link.click();
}

/* =========================
   EXPORTAR TXT (SEM VALOR)
========================= */
function exportarTXT() {
  const mesSelecionado = document.getElementById("mesSelecionado").value;
  if (!mesSelecionado) {
    alert("Selecione um mês");
    return;
  }

  const [anoSel, mesSel] = mesSelecionado.split("-");
  const meses = [
    "JANEIRO","FEVEREIRO","MARÇO","ABRIL","MAIO","JUNHO",
    "JULHO","AGOSTO","SETEMBRO","OUTUBRO","NOVEMBRO","DEZEMBRO"
  ];

  const plantoes = JSON.parse(localStorage.getItem("plantoes")) || [];
  const filtrados = plantoes
    .filter(p => {
      const [ano, mes] = p.data.split("-");
      return ano === anoSel && mes === mesSel;
    })
    .sort((a, b) => new Date(a.data) - new Date(b.data));

  if (!filtrados.length) {
    alert("Nenhum plantão no mês selecionado");
    return;
  }

  let texto = `PLANTÕES – ${meses[mesSel - 1]} / ${anoSel}\n\n`;
  texto += `Profissional: ${filtrados[0].nome}\n\n`;

  filtrados.forEach(p => {
    const [a, m, d] = p.data.split("-");
    texto += `${d}/${m} ${p.turno}\n`;
  });

  const blob = new Blob([texto], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `plantoes_${anoSel}-${mesSel}.txt`;
  link.click();
}
