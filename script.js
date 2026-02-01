const lista = document.getElementById("lista");
let editIndex = null;

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
    "6h Diurno": Number(v6d.value || 0),
    "6h Noturno": Number(v6n.value || 0),
    "8h Diurno": Number(v8d.value || 0),
    "8h Noturno": Number(v8n.value || 0),
    "12h Diurno": Number(v12d.value || 0),
    "12h Noturno": Number(v12n.value || 0),
    "24h": Number(v24.value || 0)
  };
  localStorage.setItem("valores", JSON.stringify(valores));
  alert("Valores salvos com sucesso");
}

/* =========================
   SALVAR / ATUALIZAR PLANTÃO
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

  if (isDataValorDobrado(data)) {
    valor *= 2;
  }

  const plantoes = JSON.parse(localStorage.getItem("plantoes")) || [];

  if (editIndex !== null) {
    plantoes[editIndex] = { nome, data, turno, valor };
    editIndex = null;
  } else {
    plantoes.push({ nome, data, turno, valor });
  }

  localStorage.setItem("plantoes", JSON.stringify(plantoes));
  limparFormulario();
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

  plantoes.forEach((p, index) => {
    const [ano, mes, dia] = p.data.split("-");
    if (ano === anoSel && mes === mesSel) {
      const li = document.createElement("li");
      li.innerHTML = `
        ${dia}/${mes} ${p.turno}
        <br>
        <button onclick="editarPlantao(${index})">✏️ Editar</button>
        <button onclick="excluirPlantao(${index})">🗑️ Excluir</button>
      `;
      lista.appendChild(li);
    }
  });
}

/* =========================
   EDITAR PLANTÃO
========================= */
function editarPlantao(index) {
  const plantoes = JSON.parse(localStorage.getItem("plantoes")) || [];
  const p = plantoes[index];

  document.getElementById("nome").value = p.nome;
  document.getElementById("data").value = p.data;
  document.getElementById("turno").value = p.turno;

  editIndex = index;
}

/* =========================
   EXCLUIR PLANTÃO
========================= */
function excluirPlantao(index) {
  if (!confirm("Deseja excluir este plantão?")) return;

  const plantoes = JSON.parse(localStorage.getItem("plantoes")) || [];
  plantoes.splice(index, 1);
  localStorage.setItem("plantoes", JSON.stringify(plantoes));
  filtrarPorMes();
}

/* =========================
   LIMPAR FORMULÁRIO
========================= */
function limparFormulario() {
  document.getElementById("data").value = "";
  document.getElementById("turno").value = "6h Diurno";
  editIndex = null;
}

/* =========================
   CALCULAR TOTAL DO MÊS
========================= */
function calcularTotal() {
  const mesSelecionado = document.getElementById("mesSelecionado").value;
  if (!mesSelecionado) return alert("Selecione um mês");

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
   EXPORTAR CSV DETALHADO
========================= */
function exportarCSV() {
  const mesSelecionado = document.getElementById("mesSelecionado").value;
  if (!mesSelecionado) return alert("Selecione um mês");

  const [anoSel, mesSel] = mesSelecionado.split("-");
  const plantoes = JSON.parse(localStorage.getItem("plantoes")) || [];

  const filtrados = plantoes.filter(p => {
    const [ano, mes] = p.data.split("-");
    return ano === anoSel && mes === mesSel;
  });

  if (!filtrados.length) return alert("Nenhum plantão no mês");

  const nome = filtrados[0].nome;

  const totais = {
    "6h Diurno": 0,
    "6h Noturno": 0,
    "8h Diurno": 0,
    "8h Noturno": 0,
    "12h Diurno": 0,
    "12h Noturno": 0,
    "24h": 0
  };

  filtrados.forEach(p => {
    totais[p.turno] += p.valor;
  });

  const totalGeral = Object.values(totais).reduce((s, v) => s + v, 0);

  let csv =
    "Mes,Ano,Profissional,6h_Diurno,6h_Noturno,8h_Diurno,8h_Noturno,12h_Diurno,12h_Noturno,24h,Total\n";

  csv +=
    `${mesSel},${anoSel},"${nome}",` +
    `${totais["6h Diurno"]},` +
    `${totais["6h Noturno"]},` +
    `${totais["8h Diurno"]},` +
    `${totais["8h Noturno"]},` +
    `${totais["12h Diurno"]},` +
    `${totais["12h Noturno"]},` +
    `${totais["24h"]},` +
    `${totalGeral}\n`;

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `fechamento_detalhado_${anoSel}-${mesSel}.csv`;
  link.click();
}

/* =========================
   EXPORTAR TXT (SEM VALOR)
========================= */
function exportarTXT() {
  const mesSelecionado = document.getElementById("mesSelecionado").value;
  if (!mesSelecionado) return alert("Selecione um mês");

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

  if (!filtrados.length) return alert("Nenhum plantão no mês");

  let texto = `PLANTÕES – ${meses[mesSel - 1]} / ${anoSel}\n\n`;
  texto += `Profissional: ${filtrados[0].nome}\n\n`;

  filtrados.forEach(p => {
    const [, m, d] = p.data.split("-");
    texto += `${d}/${m} ${p.turno}\n`;
  });

  const blob = new Blob([texto], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `plantoes_${anoSel}-${mesSel}.txt`;
  link.click();
}
