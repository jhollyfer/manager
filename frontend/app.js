const API = "http://localhost:3000/products";

let produtoEncontrado = null;

// --- Sanitizacao XSS ---
function escapeHtml(str) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(String(str)));
  return div.innerHTML;
}

// --- Tab ---
function setTab(tab) {
  const lista = document.getElementById("painelLista");
  const form = document.getElementById("painelForm");
  const tL = document.getElementById("tabLista");
  const tF = document.getElementById("tabForm");

  if (tab === "lista") {
    lista.classList.remove("hidden");
    form.classList.add("hidden");
    tL.className = "toggle-btn active";
    tF.className = "toggle-btn inactive";
  } else {
    lista.classList.add("hidden");
    form.classList.remove("hidden");
    tL.className = "toggle-btn inactive";
    tF.className = "toggle-btn active";
  }
}

// --- Toast ---
function showToast(msg, type) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = `fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-semibold visible`;
  t.style.background = type === "success" ? "var(--purple)" : "var(--pink)";
  setTimeout(() => {
    t.className = "hidden";
  }, 3000);
}

// --- Renderizar card ---
function renderCard(data) {
  const grid = document.getElementById("listaGrid");
  const vazio = document.getElementById("listaVazia");
  vazio.classList.add("hidden");

  let card = document.getElementById(`card-${data.id}`);
  if (!card) {
    card = document.createElement("div");
    card.id = `card-${data.id}`;
    card.className =
      "produto-card bg-white rounded-2xl border border-gray-100 overflow-hidden animate-in";
    grid.appendChild(card);
  }

  const nome = escapeHtml(data.nome);
  const descricao = escapeHtml(data.descricao);
  const id = escapeHtml(data.id);
  const preco = Number(data.preco).toFixed(2);

  // Limpar conteudo anterior
  card.textContent = "";

  // Construir card via DOM seguro
  const body = document.createElement("div");
  body.className = "card-body";
  body.dataset.id = data.id;
  body.style.cursor = "pointer";

  const header = document.createElement("div");
  header.className = "h-36 flex items-center justify-center text-5xl";
  header.style.background = "linear-gradient(135deg, #F0EFFE, #E8E4FC)";
  header.textContent = "\u{1F4E6}";

  const content = document.createElement("div");
  content.className = "p-5";

  const h3 = document.createElement("h3");
  h3.className = "font-bold text-gray-900 text-base mb-1";
  h3.textContent = data.nome;

  const pDesc = document.createElement("p");
  pDesc.className = "text-xs text-gray-500 mb-3 line-clamp-2";
  pDesc.textContent = data.descricao;

  const infoRow = document.createElement("div");
  infoRow.className = "flex items-center justify-between";

  const precoSpan = document.createElement("span");
  precoSpan.className = "inline-flex items-center gap-1 text-xs font-semibold";
  precoSpan.style.color = "var(--pink)";
  precoSpan.textContent = `R$ ${preco}`;

  const idSpan = document.createElement("span");
  idSpan.className = "text-xs text-gray-400";
  idSpan.textContent = `#${data.id}`;

  infoRow.appendChild(precoSpan);
  infoRow.appendChild(idSpan);

  const btnRow = document.createElement("div");
  btnRow.className = "flex gap-2 mt-4";

  const btnEditar = document.createElement("button");
  btnEditar.className = "flex-1 text-xs font-bold py-2 rounded-lg border transition";
  btnEditar.style.color = "var(--purple)";
  btnEditar.style.borderColor = "var(--purple)";
  btnEditar.textContent = "Editar";

  const btnExcluir = document.createElement("button");
  btnExcluir.className = "flex-1 text-xs font-bold py-2 rounded-lg border transition";
  btnExcluir.style.color = "var(--pink)";
  btnExcluir.style.borderColor = "var(--pink)";
  btnExcluir.textContent = "Excluir";

  btnRow.appendChild(btnEditar);
  btnRow.appendChild(btnExcluir);

  content.appendChild(h3);
  content.appendChild(pDesc);
  content.appendChild(infoRow);
  content.appendChild(btnRow);

  body.appendChild(header);
  body.appendChild(content);
  card.appendChild(body);

  // Event listeners
  btnEditar.addEventListener("click", (e) => {
    e.stopPropagation();
    editarCard(data.id);
  });
  btnExcluir.addEventListener("click", (e) => {
    e.stopPropagation();
    excluirCard(data.id);
  });
  body.addEventListener("click", () => {
    verDetalhe(data.id);
  });
}

// --- Ver detalhe (GET /products/:id) ---
async function verDetalhe(id) {
  try {
    const { data } = await axios.get(`${API}/${id}`);
    produtoEncontrado = data;

    const panel = document.getElementById("searchResult");
    const content = document.getElementById("searchResultContent");
    content.textContent = "";

    const fields = [
      ["ID", data.id],
      ["Nome", data.nome],
      ["Preco", `R$ ${Number(data.preco).toFixed(2)}`],
      ["Descricao", data.descricao],
    ];
    fields.forEach(([label, value]) => {
      const p = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = `${label}: `;
      p.appendChild(strong);
      p.appendChild(document.createTextNode(value));
      content.appendChild(p);
    });

    panel.classList.remove("hidden");
  } catch {
    showToast("Erro ao carregar detalhes.", "error");
  }
}

// --- Editar card (busca dados atualizados via GET /products/:id) ---
async function editarCard(id) {
  try {
    const { data } = await axios.get(`${API}/${id}`);
    produtoEncontrado = data;
    preencherFormulario();
    setTab("form");
  } catch {
    showToast("Erro ao carregar produto para edicao.", "error");
  }
}

async function excluirCard(id) {
  if (!confirm(`Excluir produto ID ${id}?`)) return;
  try {
    await axios.delete(`${API}/${id}`);
    document.getElementById(`card-${id}`)?.remove();
    document.getElementById("searchResult").classList.add("hidden");
    produtoEncontrado = null;
    showToast("Produto excluido!", "success");
    const grid = document.getElementById("listaGrid");
    if (!grid.children.length)
      document.getElementById("listaVazia").classList.remove("hidden");
  } catch {
    showToast("Erro ao excluir.", "error");
  }
}

// --- Carregar todos os produtos (GET /products) ---
async function carregarProdutos() {
  try {
    const { data } = await axios.get(API);
    const grid = document.getElementById("listaGrid");
    grid.textContent = "";
    document.getElementById("searchResult").classList.add("hidden");
    document.getElementById("searchId").value = "";
    produtoEncontrado = null;

    if (data.length === 0) {
      document.getElementById("listaVazia").classList.remove("hidden");
    } else {
      document.getElementById("listaVazia").classList.add("hidden");
      data.forEach((p) => renderCard(p));
    }
    setTab("lista");
  } catch {
    showToast("Erro ao carregar produtos.", "error");
  }
}

// --- Buscar produtos por nome/descricao ---
async function buscarProdutos() {
  const q = document.getElementById("searchId").value.trim();

  try {
    const { data } = await axios.get(API, { params: { q } });
    document.getElementById("searchResult").classList.add("hidden");
    produtoEncontrado = null;

    const grid = document.getElementById("listaGrid");
    grid.textContent = "";

    if (data.length === 0) {
      document.getElementById("listaVazia").classList.remove("hidden");
      showToast("Nenhum produto encontrado.", "error");
    } else {
      document.getElementById("listaVazia").classList.add("hidden");
      data.forEach((p) => renderCard(p));
    }
    setTab("lista");
  } catch {
    showToast("Erro ao buscar produtos.", "error");
  }
}

// --- Preencher formulario para edicao ---
function preencherFormulario() {
  if (!produtoEncontrado) return;
  document.getElementById("editId").value = produtoEncontrado.id;
  document.getElementById("nome").value = produtoEncontrado.nome;
  document.getElementById("preco").value = produtoEncontrado.preco;
  document.getElementById("descricao").value = produtoEncontrado.descricao;
  document.getElementById("formTitle").textContent =
    `Editando Produto #${produtoEncontrado.id}`;
  const btn = document.getElementById("btnSubmit");
  btn.textContent = "Salvar Alteracoes";
  btn.style.background = "#3D35C2";
  document.getElementById("btnCancelEdit").classList.remove("hidden");
  setTab("form");
}

// --- Cancelar edicao ---
function cancelarEdicao() {
  document.getElementById("editId").value = "";
  document.getElementById("productForm").reset();
  document.getElementById("formTitle").textContent = "Cadastrar Produto";
  const btn = document.getElementById("btnSubmit");
  btn.textContent = "Cadastrar Produto";
  btn.style.background = "var(--purple)";
  document.getElementById("btnCancelEdit").classList.add("hidden");
}

// --- Submit ---
async function handleSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("editId").value;
  const payload = {
    nome: document.getElementById("nome").value.trim(),
    preco: parseFloat(document.getElementById("preco").value),
    descricao: document.getElementById("descricao").value.trim(),
  };

  try {
    let savedData;
    if (id) {
      const { data } = await axios.put(`${API}/${id}`, payload);
      savedData = data || { id, ...payload };
      showToast("Produto atualizado!", "success");
    } else {
      const { data } = await axios.post(API, payload);
      savedData = data;
      showToast("Produto cadastrado!", "success");
    }
    cancelarEdicao();
    if (savedData) renderCard(savedData);
    setTab("lista");
  } catch {
    showToast("Erro ao salvar produto.", "error");
  }
}

// --- Init ---
document.addEventListener("DOMContentLoaded", carregarProdutos);
